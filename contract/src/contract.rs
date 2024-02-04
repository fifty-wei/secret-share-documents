
use cosmwasm_std::{
    entry_point, to_binary, Addr, Binary, Deps, DepsMut, Env, MessageInfo, Response, StdError,
    StdResult,
};


use secp256k1::ecdh::SharedSecret;
use secp256k1::{PublicKey, Secp256k1, SecretKey};

use cosmwasm_storage::ReadonlyPrefixedStorage;

use secret_toolkit::permit::Permit;
use secret_toolkit::serialization::{Json, Serde};


use crate::error::{ContractError, CryptoError};
use crate::msg::{ContractKeyResponse, EncryptedExecuteMsg, ExecuteMsg, ExecuteMsgAction, FileIdsResponse, FilePayloadResponse, InstantiateMsg, QueryMsg, QueryWithPermit};

use crate::state::{
    may_load, save, Config, ContractKeys, FileState, UserInfo, CONFIG, CONTRACT_KEYS, FILE_PERMISSIONS, PREFIX_FILES, PREFIX_REVOKED_PERMITS, PREFIX_USERS
};

use cosmwasm_storage::PrefixedStorage;

use sha2::{Digest, Sha256};

use aes_siv::aead::generic_array::GenericArray;
use aes_siv::siv::Aes128Siv;

use hex;

// use ethabi::{decode, ParamType};


#[entry_point]
pub fn instantiate(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    _msg: InstantiateMsg,
) -> Result<Response, StdError> {
    // Create the public/private keys for the contract
    let rng = env.block.random.unwrap().0;
    let secp = Secp256k1::new();

    let private_key = SecretKey::from_slice(&rng).unwrap();
    let private_key_string = private_key.display_secret().to_string();
    let private_key_bytes = hex::decode(private_key_string).unwrap();

    let public_key = PublicKey::from_secret_key(&secp, &private_key);
    let public_key_bytes = public_key.serialize().to_vec();

    let my_keys = ContractKeys {
        private_key: private_key_bytes,
        public_key: public_key_bytes,
    };

    CONTRACT_KEYS.save(deps.storage, &my_keys)?;

    // Save the configuration of this contract
    let _ = CONFIG.save(deps.storage, &Config {
        contract_address: env.contract.address,
    });


    deps.api
        .debug(&format!("Contract was initialized by {}", info.sender));

    Ok(Response::default())
}


// TODO :: See Revoking permits - need implementation ?
// https://scrt.university/pathways/33/implementing-viewing-keys-and-permits

#[entry_point]
pub fn execute(
    deps: DepsMut,
    _env: Env,
    _info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    match msg {
        ExecuteMsg::ReceiveMessageEvm {
            source_chain,
            source_address,
            payload,
        } => receive_message_evm(deps, source_chain, source_address, payload),
        _ => Ok(Response::default())
    }
}


/// Decrypt and execute the message passed from EVM
pub fn receive_message_evm(
    deps: DepsMut,
    _source_chain: String,
    _source_address: String,
    execute_msg: EncryptedExecuteMsg,
) -> Result<Response, ContractError> {

    let user_public_key = execute_msg.public_key;
    let encrypted_data = execute_msg.payload;

    // TODO :: Owner can be set by the permit

    // Decrypt the EVM message
    match _decrypt_with_user_public_key(&deps, encrypted_data, user_public_key) {
        Ok(ExecuteMsgAction::StoreNewFile {
            owner,
            payload,
        }) => {
            println!("Alright");

            let _ = store_new_file(deps, owner, payload);
        }
        Ok(_) => {
            println!("Other message");
        }
        Err(_e) => {
            println!("Error");
        }
    };

    Ok(Response::default())

}


/// Decrypt a cyphertext using a given public key and the contract private key.
///
/// Create a shared secret by using the user public key and the contract private key.
/// Then, used this shared secet to decrypt the cyphertext.
fn _decrypt_with_user_public_key(
    deps: &DepsMut,
    payload: Binary,
    user_public_key: Vec<u8>,
) -> Result<ExecuteMsgAction, ContractError> {
    // Read the private key from the storage
    let contract_keys = CONTRACT_KEYS.load(deps.storage)?;

    let contract_private_key = SecretKey::from_slice(contract_keys.private_key.as_slice())
        .map_err(|e| ContractError::CustomError {
            val: format!("Invalid private key: {}", e),
        })?;

    let other_public_key = PublicKey::from_slice(user_public_key.as_slice()).map_err(|e| {
        ContractError::CustomError {
            val: format!("Invalid public key: {}", e),
        }
    })?;

    // Create a shared secret from the user public key and the conrtact private key
    let shared_secret = SharedSecret::new(&other_public_key, &contract_private_key);
    let key = shared_secret.secret_bytes();

    let ad_data: &[&[u8]] = &[];
    let ad = Some(ad_data);

    match aes_siv_decrypt(&payload, ad, &key) {
        Ok(decrypted_data) => {

            // Cannot use Bincode2 as float issue
            // Need to change to other way to decode it
            // let data = Bincode2::deserialize::<ExecuteMsg>(&decrypted_data).map(Some);

            // TODO :: See if I can map to a ExecuteMsg directly instead of a Some
            let data = Json::deserialize::<ExecuteMsgAction>(&decrypted_data).map(Some);

            // println!("Here the data deserialized: {:?}", data);

            match data {
                Ok(d) => match d {
                    Some(msg) => Ok(msg),
                    None => Err(ContractError::CustomError {
                        val: format!("Error empty object when deserialized"),
                    }),
                },
                Err(e) => Err(ContractError::CustomError {
                    val: format!("Error when deserialize payload message {:?}", e.to_string()),
                })
            }
        }
        Err(_e) => {
            // warn!("Error decrypting data: {:?}", e);
            println!("Hola some issue here Crypto error.");
            // Optionally, return an error here if you need to indicate a failure to the caller
            Err(ContractError::CustomError {
                val: format!("Invalid public key"),
            })
        }
    }
}

pub fn aes_siv_decrypt(
    plaintext: &[u8],
    ad: Option<&[&[u8]]>,
    key: &[u8],
) -> Result<Vec<u8>, CryptoError> {
    let ad = ad.unwrap_or(&[&[]]);

    let mut cipher = Aes128Siv::new(GenericArray::clone_from_slice(key));
    cipher.decrypt(ad, plaintext).map_err(|_e| {
        // warn!("aes_siv_encrypt error: {:?}", e);
        CryptoError::EncryptionError
    })
}


/// Create a key from a given file data.
///
/// When storing new data, we need to have a unique key for the given data.
/// We decide to create a hash using the struct element to have a unique
/// key, allowing us to store the data.
///
pub fn create_key_from_file_state(file_state: &FileState) -> [u8; 32] {
    // Encode the file state struct data
    let encoded_file_state: Vec<u8> = bincode::serialize(file_state).unwrap();

    // Hash the data
    let mut hasher = Sha256::new();
    hasher.update(&encoded_file_state);

    // Retrieve the hash
    let key: [u8; 32] = hasher.finalize().into();

    key
}


/// Add a key to a user
pub fn store_new_key(deps: DepsMut, owner: Addr, file_key: [u8; 32]) -> StdResult<()> {

    let user_address = owner.as_bytes();

    // Get user storage
    let mut users_store = PrefixedStorage::new(deps.storage, PREFIX_USERS);
    let loaded_info: StdResult<Option<UserInfo>> = may_load(&users_store, user_address);

    let mut user_info = match loaded_info {
        Ok(Some(user_info)) => user_info,
        Ok(None) => UserInfo {
            files: Vec::new()
        },
        Err(error) => {
            println!("Error when retrieving the data, TODO :: have exception here : {:?}", error);
            return Ok(());
        }
    };

    user_info.files.push(file_key);

    save(&mut users_store, user_address, &user_info)
}


/// Store a new file in the smartcontract storage
///
pub fn store_new_file(deps: DepsMut, owner: Addr, payload: String) -> StdResult<String> {
    // Get the storage for files
    let mut file_storage = PrefixedStorage::new(deps.storage, PREFIX_FILES);

    // Create the file content
    let file_state = FileState {
        owner: owner.clone(),
        payload: payload,
    };

    let key: [u8; 32] = create_key_from_file_state(&file_state);

    // Save the file
    save(&mut file_storage, &key, &file_state)?;


    // Add the viewing right for the user
    // TODO :: Manage error
    // let _ = add_viewing_rights(deps, owner.clone(), key.clone());
    let _ = FILE_PERMISSIONS.insert(deps.storage, &(key, owner.clone()), &true);

    // Add the key to the user
    // TODO :: handle error
    let _ = store_new_key(deps, owner.clone(), key);


    Ok(hex::encode(&key))
}

/// Read the data from the storage
pub fn load_file(deps: Deps, key: String) -> StdResult<String> {
    // TODO :: Future version :: Need to verify the user

    let extracted_key = match hex::decode(key) {
        Ok(k) => k,
        _ => panic!("Invalid key"),
    };

    let files_store = ReadonlyPrefixedStorage::new(deps.storage, PREFIX_FILES);
    let loaded_payload: StdResult<Option<FileState>> = may_load(&files_store, &extracted_key);

    let payload: String = match loaded_payload {
        Ok(Some(file_state)) => file_state.payload,
        Ok(None) => panic!("Error."),
        Err(_error) => panic!("Error."),
    };

    Ok(payload)
}


#[entry_point]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {    
    match msg {
        QueryMsg::GetContractKey {} => to_binary(&query_key(deps)?),
        QueryMsg::WithPermit { permit, query } => permit_queries(deps, permit, query)
    }
}

fn query_key(deps: Deps) -> StdResult<ContractKeyResponse> {
    let contract_keys = CONTRACT_KEYS.load(deps.storage)?;
    Ok(ContractKeyResponse {
        public_key: contract_keys.public_key,
    })
}

fn permit_queries(deps: Deps, permit: Permit, query: QueryWithPermit) -> Result<Binary, StdError> {
    // Validate permit content
    let token_address = CONFIG.load(deps.storage)?.contract_address;

    // Get and validate user address
    let account = secret_toolkit::permit::validate(
        deps,
        PREFIX_REVOKED_PERMITS,
        &permit,
        token_address.into_string(),
        None,
    )?;

    let account = Addr::unchecked(account);

    // Permit validated! We can now execute the query.
    match query {
        QueryWithPermit::GetFileIds {} => {
            // Get user file
            to_binary(&query_file_ids(deps, account)?)
        },
        QueryWithPermit::GetFileContent { key } => {

            let u8_key: [u8; 32] = key.as_bytes().try_into().unwrap();

            // Check the permission - whitelisted
            // let _ = FILE_PERMISSIONS.insert(deps.storage, &(key, owner.clone()), &true);
            let whitelisted = FILE_PERMISSIONS.get(deps.storage, &(u8_key, account));

            match whitelisted {
                Some(authorized) => {
                    if !authorized {
                        panic!("Unauthorized user");
                    }
                },
                _ => {
                    panic!("Unauthorized user");
                }
            };
            
            // Get the file content
            to_binary(&query_file_content(deps, key)?)
        }
    }
}

/// Return the file ids given a user.
/// We need to verify with a permit that only the given account is the one that can retrieve the data.
fn query_file_ids(deps: Deps, account: Addr) -> StdResult<FileIdsResponse> {

    // Get user storage
    let users_store = ReadonlyPrefixedStorage::new(deps.storage, PREFIX_USERS);
    let loaded_payload: StdResult<Option<UserInfo>> = may_load(&users_store, account.as_bytes());

    match loaded_payload {
        Ok(Some(user_info)) => Ok(FileIdsResponse { ids: user_info.files }),
        Ok(None) => panic!("File not found from the given key."),
        Err(error) => panic!("Error when loading file from storage: {:?}", error),        
    }

}

fn query_file_content(deps: Deps, key: String) -> StdResult<FilePayloadResponse> {
    let file_content: String = load_file(deps, key)?;

    Ok(FilePayloadResponse {
        payload: file_content,
    })
}



#[cfg(test)]
mod tests {
    use super::*;

    use cosmwasm_std::testing::{mock_dependencies, mock_env, mock_info};
    use cosmwasm_std::{coins, from_binary, QueryResponse};
    use secret_toolkit::permit::{PermitParams, PermitSignature, PubKey, TokenPermissions};
    use secret_toolkit::serialization::Serde;

    use crate::msg::ExecuteMsgAction::StoreNewFile;

    use cosmwasm_std::Api;

    use crate::state::may_load;
    use crate::state::PREFIX_FILES;
    use cosmwasm_storage::ReadonlyPrefixedStorage;

    use rstest::fixture;
    use rstest::*;

    // Some references
    // https://github.com/desmos-labs/desmos-contracts/blob/master/contracts/poap/src/contract_tests.rs

    // See this project - organization
    // https://github.com/desmos-labs/desmos-contracts/tree/master/contracts/poap



    /// Instanciate a new smart contract
    fn setup_contract(deps: DepsMut) {
        // Instanciate our Secret Contract
        let msg = InstantiateMsg {};
        let info = mock_info("creator", &coins(0, ""));
        let response = instantiate(deps, mock_env(), info, msg).unwrap();
        assert_eq!(0, response.messages.len());
    }


    fn _query_contract_pubic_key(deps: Deps) -> ContractKeyResponse {
        let query_msg = QueryMsg::GetContractKey {};
        let response = query(deps, mock_env(), query_msg).unwrap();
        let key_response: ContractKeyResponse = from_binary(&response).unwrap();
        key_response
    }

    fn _generate_local_public_private_key(env: Env) -> (Vec<u8>, Vec<u8>) {
        // Generate public/private key locally
        let rng = env.block.random.unwrap().0;
        let secp = Secp256k1::new();

        let private_key = SecretKey::from_slice(&rng).unwrap();
        let private_key_string = private_key.display_secret().to_string();
        let private_key_bytes = hex::decode(private_key_string).unwrap();

        let public_key = PublicKey::from_secret_key(&secp, &private_key);
        let public_key_bytes = public_key.serialize().to_vec();

        return (public_key_bytes, private_key_bytes);
    }

    fn _encrypt_with_share_secret(
        local_private_key: Vec<u8>, 
        contract_public_key: Vec<u8>, 
        message_to_encrypt: &Vec<u8>
    ) -> Vec<u8> {
        let my_private_key = SecretKey::from_slice(&local_private_key)
            .map_err(|e| ContractError::CustomError {
                val: format!("Invalid private key: {}", e),
            })
            .unwrap();

        let other_public_key = PublicKey::from_slice(contract_public_key.as_slice())
            .map_err(|e| ContractError::CustomError {
                val: format!("Invalid public key: {}", e),
            })
            .unwrap();

        let shared_secret = SharedSecret::new(&other_public_key, &my_private_key);
        let key = shared_secret.secret_bytes();

        // Encrypt our payload
        let ad_data: &[&[u8]] = &[];
        let ad = Some(ad_data);
        let ad = ad.unwrap_or(&[&[]]);

        let mut cipher = Aes128Siv::new(GenericArray::clone_from_slice(&key));
        let encrypt_message = cipher
            .encrypt(ad, message_to_encrypt)
            .map_err(|_e| CryptoError::EncryptionError)
            .unwrap();

        return encrypt_message;
    }

    #[test]
    fn test_contract_initialization() {
        // Initialize the smart contract
        let mut deps = mock_dependencies();
        setup_contract(deps.as_mut());

        // Check that the contract generate a public key
        let key_response = _query_contract_pubic_key(deps.as_ref());
        assert_eq!(33, key_response.public_key.len());        
    }

    #[test]
    fn test_evm_store_new_file() {
        let mut deps = mock_dependencies();
        setup_contract(deps.as_mut());

        let env = mock_env();

        let user_address = "secret18mdrja40gfuftt5yx6tgj0fn5lurplezyp894y";
        let permit_name = "default";
        let chain_id = "secretdev-1";
        let pub_key = "AkZqxdKMtPq2w0kGDGwWGejTAed0H7azPMHtrCX0XYZG";
        let signature = "ZXyFMlAy6guMG9Gj05rFvcMi5/JGfClRtJpVTHiDtQY3GtSfBHncY70kmYiTXkKIxSxdnh/kS8oXa+GSX5su6Q==";


        let raw_address = "secret18mdrja40gfuftt5yx6tgj0fn5lurplezyp894y";
        let owner = deps.api.addr_validate(raw_address).unwrap();
        let payload = String::from("{\"file\": \"content\"}");

        // Create the message for storing a new file
        let store_new_file_msg = ExecuteMsgAction::StoreNewFile { 
            owner: owner.clone(), 
            payload: payload.clone() 
        };

        let message = &Json::serialize(&store_new_file_msg).unwrap();

        // Generate public/private key locally
        let (local_public_key, local_private_key) = _generate_local_public_private_key(env);
        
        // Query the contract public key
        let contract_public_key = _query_contract_pubic_key(deps.as_ref()).public_key;

        // Create share secret
        let encrypted_message = _encrypt_with_share_secret(local_private_key, contract_public_key, message);
       
        // Create the request
        let evm_message = ExecuteMsg::ReceiveMessageEvm {
            source_chain: String::from("polygon"),
            source_address: String::from("0x329CdCBBD82c934fe32322b423bD8fBd30b4EEB6"),
            payload: EncryptedExecuteMsg {
                payload: Binary::from(encrypted_message),
                public_key: local_public_key,
            },
        };

        // Send the evm message
        let unauth_env = mock_info("anyone", &coins(0, "token"));
        let res_store_file = execute(deps.as_mut(), mock_env(), unauth_env, evm_message);
        assert!(res_store_file.is_ok());
        
        // Query the user file
        // let Query

        let token_address = CONFIG.load(deps.as_mut().storage).unwrap().contract_address;


        // Retrieve list of file given a user
        let query_msg = QueryMsg::WithPermit { 
            permit: Permit {
                params: PermitParams {
                    allowed_tokens: vec![String::from(token_address)],
                    permit_name: permit_name.to_string(),
                    chain_id: chain_id.to_string(),
                    permissions: vec![TokenPermissions::Owner],
                },
                signature: PermitSignature {
                    pub_key: PubKey {
                        r#type: "tendermint/PubKeySecp256k1".to_string(),
                        value: Binary::from_base64(pub_key).unwrap(),
                    },
                    signature: Binary::from_base64(signature).unwrap(),
                }
            }, 
            query: QueryWithPermit::GetFileIds {}
        };
        let res = query(deps.as_ref(), mock_env(), query_msg);
        assert!(res.is_ok());
        
        let file_id_response = Json::deserialize::<FileIdsResponse>(&res.unwrap()).map(Some);

        // We should now have one key
        assert_eq!(file_id_response.unwrap().unwrap().ids.len(), 1);




        // Check the file has been encrypted
        // TODO :: remove this verification, check directly by requesting the user key
        // read the storage content
        let expected_key = create_key_from_file_state(&FileState {
            owner: owner.clone(),
            payload: payload.clone(),
        });
    
        let files_store = ReadonlyPrefixedStorage::new(&deps.storage, PREFIX_FILES);
        let loaded_payload: StdResult<Option<FileState>> = may_load(&files_store, &expected_key);

        let store_data: FileState = match loaded_payload {
            Ok(Some(file_state)) => file_state,
            Ok(None) => panic!("File not found from the given key."),
            Err(error) => panic!("Error when loading file from storage: {:?}", error),
        };

        assert_eq!(store_data.owner, owner);
        assert_eq!(store_data.payload, payload);
    }


    #[test]
    fn test_unauthorized_file_access() {
        
        let user_address = "secret18mdrja40gfuftt5yx6tgj0fn5lurplezyp894y";
        let permit_name = "default";
        let chain_id = "secretdev-1";
        let pub_key = "AkZqxdKMtPq2w0kGDGwWGejTAed0H7azPMHtrCX0XYZG";
        let signature = "ZXyFMlAy6guMG9Gj05rFvcMi5/JGfClRtJpVTHiDtQY3GtSfBHncY70kmYiTXkKIxSxdnh/kS8oXa+GSX5su6Q==";

        let mut deps = mock_dependencies();
        setup_contract(deps.as_mut());

        let owner = deps.api.addr_validate(user_address).unwrap();
        let payload = String::from("{\"file\": \"content\"}");

        // Mock a new file for a user A
        let _ = store_new_file(deps.as_mut(), owner.clone(), payload);

        let file_ids = query_file_ids(deps.as_ref(), owner.clone()).unwrap();
        assert_eq!(file_ids.ids.len(), 1);

        let file_id = file_ids.ids[0];

        // TODO :: Query file ok for owner

        // TODO :: Query file unauthorize user error
        



    }


    #[test]
    fn test_encrypted_file_payload_request() {
        
        // Initialize the smart contract
        let mut deps = mock_dependencies();
        setup_contract(deps.as_mut());

        let env = mock_env();

        let raw_address = "secretvaloper14c29nyq8e9jgpcpw55e3n7ea4aktxg4xnurynd";
        let owner = deps.api.addr_validate(raw_address).unwrap();
        let payload = String::from("{\"file\": \"content\"}");

        // Create the message for storing a new file
        let store_new_file_msg = StoreNewFile { 
            owner: owner.clone(), 
            payload: payload.clone() 
        };

        let message = &Json::serialize(&store_new_file_msg).unwrap();

        // Generate public/private key locally
        let rng = env.block.random.unwrap().0;
        let secp = Secp256k1::new();

        let private_key = SecretKey::from_slice(&rng).unwrap();
        let private_key_string = private_key.display_secret().to_string();
        let private_key_bytes = hex::decode(private_key_string).unwrap();

        let public_key = PublicKey::from_secret_key(&secp, &private_key);
        let public_key_bytes = public_key.serialize().to_vec();

        // Query the contract public key
        let public_key_response = _query_contract_pubic_key(deps.as_ref());
        let contract_public_key = public_key_response.public_key;

        // Create share secret
        let my_private_key = SecretKey::from_slice(&private_key_bytes)
            .map_err(|e| ContractError::CustomError {
                val: format!("Invalid private key: {}", e),
            })
            .unwrap();

        let other_public_key = PublicKey::from_slice(contract_public_key.as_slice())
            .map_err(|e| ContractError::CustomError {
                val: format!("Invalid public key: {}", e),
            })
            .unwrap();

        let shared_secret = SharedSecret::new(&other_public_key, &my_private_key);
        let key = shared_secret.secret_bytes();

        // Encrypt our payload
        let ad_data: &[&[u8]] = &[];
        let ad = Some(ad_data);
        let ad = ad.unwrap_or(&[&[]]);

        let mut cipher = Aes128Siv::new(GenericArray::clone_from_slice(&key));
        let encrypt_message = cipher
            .encrypt(ad, message)
            .map_err(|_e| CryptoError::EncryptionError)
            .unwrap();

        // Send the request
        let msg = EncryptedExecuteMsg {
            payload: Binary::from(encrypt_message),
            public_key: public_key_bytes,
        };

        // let data = Json::deserialize::<ExecuteMsg>(&payload.as_slice()).map(Some);

        // let encoded_evm_message = Json::serialize(&msg).unwrap();

        let evm_message = ExecuteMsg::ReceiveMessageEvm {
            source_chain: String::from("polygon"),
            source_address: String::from("0x329CdCBBD82c934fe32322b423bD8fBd30b4EEB6"),
            payload: msg,
        };


        let unauth_env = mock_info("anyone", &coins(0, "token"));
        let res_store_file = execute(deps.as_mut(), mock_env(), unauth_env, evm_message);
        assert!(res_store_file.is_ok());
        
        // Retrieve list of file given a user


        // Check the file has been encrypted
        // TODO :: remove this verification, check directly by requesting the user key
        // read the storage content
        let expected_key = create_key_from_file_state(&FileState {
            owner: owner.clone(),
            payload: payload.clone(),
        });
    
        let files_store = ReadonlyPrefixedStorage::new(&deps.storage, PREFIX_FILES);
        let loaded_payload: StdResult<Option<FileState>> = may_load(&files_store, &expected_key);

        let store_data: FileState = match loaded_payload {
            Ok(Some(file_state)) => file_state,
            Ok(None) => panic!("File not found from the given key."),
            Err(error) => panic!("Error when loading file from storage: {:?}", error),
        };

        assert_eq!(store_data.owner, owner);
        assert_eq!(store_data.payload, payload);

    }



    #[test]
    fn test_store_new_file() {
        let mut deps = mock_dependencies();

        let raw_address = "secretvaloper14c29nyq8e9jgpcpw55e3n7ea4aktxg4xnurynd";
        let owner = deps.api.addr_validate(raw_address).unwrap();
        let payload = String::from("{\"file\": \"content\"}");

        // Store the new file
        let store_new_file_result = store_new_file(deps.as_mut(), owner.clone(), payload.clone());
        let key = match store_new_file_result {
            Ok(storage_key) => storage_key,
            Err(error) => panic!("Error when storing a new file: {:?}", error),
        };

        let expected_key = create_key_from_file_state(&FileState {
            owner: owner.clone(),
            payload: payload.clone(),
        });

        // Verify the key data
        assert_eq!(key, hex::encode(expected_key));

        let extracted_key = match hex::decode(key) {
            Ok(k) => k,
            _ => panic!("Invalid key"),
        };

        assert_eq!(extracted_key, expected_key);

        // read the storage content
        let files_store = ReadonlyPrefixedStorage::new(&deps.storage, PREFIX_FILES);
        let loaded_payload: StdResult<Option<FileState>> = may_load(&files_store, &extracted_key);

        let store_data: FileState = match loaded_payload {
            Ok(Some(file_state)) => file_state,
            Ok(None) => panic!("File not found from the given key."),
            Err(error) => panic!("Error when loading file from storage: {:?}", error),
        };

        assert_eq!(store_data.owner, owner);
        assert_eq!(store_data.payload, payload);
    }

    // TODO :: ~/Project/examples/EVM-encrypt-decrypt/secret_network

    #[test]
    fn keys_initialization() {
        let mut deps = mock_dependencies();

        // Instanciate our Secret Contract
        let msg = InstantiateMsg {};
        let info = mock_info("creator", &coins(0, ""));
        let response = instantiate(deps.as_mut(), mock_env(), info, msg).unwrap();
        assert_eq!(0, response.messages.len());

        // Get the generated public key
        let msg = QueryMsg::GetContractKey {};
        let response = query(deps.as_ref(), mock_env(), msg).unwrap();
        let public_key_response: ContractKeyResponse = from_binary(&response).unwrap();
        let public_key = public_key_response.public_key;
        assert!(public_key.len() == 33); // We have an additional 1 byte prefix for the X-coordinate

        // Verify that the public key is the same as the one we store
        let contract_keys = CONTRACT_KEYS.load(deps.as_mut().storage);
        let storage_public_key = match contract_keys {
            Ok(keys) => keys.public_key,
            Err(error) => panic!("Error when loading key from storage: {:?}", error),
        };
        assert!(public_key == storage_public_key);
    }

    
}
