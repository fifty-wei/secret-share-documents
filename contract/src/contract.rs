use cosmwasm_std::{
    entry_point, to_binary, Addr, Binary, Env, Deps, DepsMut,
    MessageInfo, Response, StdError, StdResult,
};
// use secret_toolkit_storage::Keymap;

use crate::error::ContractError;
use crate::msg::{CountResponse, ExecuteMsg, InstantiateMsg, QueryMsg};
use crate::state::{config, config_read, State};

use cosmwasm_storage::PrefixedStorage;

use crate::state::save;
use crate::state::FileState;
use crate::state::PREFIX_FILES;

// Some tutorials
// https://github.com/darwinzer0/secret-contract-tutorials/tree/main/tutorial1

// use sha2::{Digest, Sha256};
// https://github.com/scrtlabs/SecretDice/blob/master/src/contract.rs


#[entry_point]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    msg: InstantiateMsg,
) -> Result<Response, StdError> {

    let state = State {
        // file_state: Keymap::new(b"files"),
        count: msg.count,
        owner: info.sender.clone(),
    };

    config(deps.storage).save(&state)?;




// let mut password_store = PrefixedStorage::new(PREFIX_FILES, &mut deps.storage);
// let key: &[u8] = env.message.sender.to_string().as_bytes();
// save(&mut password_store, key, &msg.password)?;




    deps.api.debug(&format!("Contract was initialized by {}", info.sender));

    Ok(Response::default())
}

#[entry_point]
pub fn execute(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    match msg {
        ExecuteMsg::StoreNewFile { owner, payload } => request_store_new_file(deps, owner, payload),
        ExecuteMsg::Increment {} => try_increment(deps),
        ExecuteMsg::Reset { count } => try_reset(deps, info, count),
    }
}


pub fn request_store_new_file(
    deps: DepsMut,
    owner: Addr,
    payload: String
) -> Result<Response, ContractError> {

    // Store the payload data
    match store_new_file(deps, owner, payload) {
        Ok(_key) => Ok(Response::default()),
        Err(_data) =>Ok(Response::default()),
    }

}


/// Store a new file in the smartcontract storage
///
pub fn store_new_file(
    deps: DepsMut,
    owner: Addr,
    payload: String
) -> StdResult<&[u8]> {

    // Get the storage for files
    let mut file_storage = PrefixedStorage::new(deps.storage, PREFIX_FILES);

    // Create the file content
    let file_state = FileState {
        owner: owner,
        payload: payload
    };

    // Create the associated key
    let key: &[u8] = b"test_key";

    // Save the file
    save(&mut file_storage, key, &file_state)?;

    Ok(key)
}




pub fn try_increment(
    deps: DepsMut,
) -> Result<Response, ContractError> {

    config(deps.storage).update(|mut state| -> Result<_, ContractError> {
        state.count += 1;
        Ok(state)
    })?;

    deps.api.debug("count incremented successfully");
    Ok(Response::default())
}

pub fn try_reset(
    deps: DepsMut,
    info: MessageInfo,
    count: i32,
) -> Result<Response, ContractError> {

    config(deps.storage).update(|mut state| -> Result<_, ContractError> {
        if info.sender != state.owner {
            return Err(ContractError::Unauthorized {});
        }
        state.count = count;
        Ok(state)
    })?;

    deps.api.debug("count reset successfully");
    Ok(Response::default())
}

#[entry_point]
pub fn query(
    deps: Deps,
    _env: Env,
    msg: QueryMsg,
) -> StdResult<Binary> {
    match msg {
        QueryMsg::GetCount {} => to_binary(&query_count(deps)?),
    }
}

fn query_count(
    deps: Deps,
) -> StdResult<CountResponse> {
    let state = config_read(deps.storage).load()?;
    Ok(CountResponse { count: state.count })
}



#[cfg(test)]
mod tests {
    use super::*;

    use cosmwasm_std::testing::{mock_dependencies, mock_env, mock_info};
    use cosmwasm_std::{coins, from_binary};


    // use secret_toolkit_storage::{Item, Keymap};
    // use serde::{Deserialize, Serialize};
    // use cosmwasm_std::testing::MockStorage;
    // use cosmwasm_std::StdResult;

    use cosmwasm_std::Api;

    use cosmwasm_storage::ReadonlyPrefixedStorage;
    use crate::state::may_load;
    use crate::state::PREFIX_FILES;

    // https://docs.rs/cosmwasm-std/latest/cosmwasm_std/trait.Api.html
    // let input = "what-users-provide";
    // let validated: Addr = api.addr_validate(input).unwrap();
    // assert_eq!(validated, input);

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

        // Verify the key data
        assert_eq!(key, b"test_key");
        
        // read the storage content
        let files_store = ReadonlyPrefixedStorage::new(&deps.storage, PREFIX_FILES);
        let key: &[u8] = b"test_key";
        let loaded_payload: StdResult<Option<FileState>> = may_load(&files_store, key);

        let store_data : FileState = match loaded_payload {
            Ok(Some(file_state)) => file_state,
            Ok(None) => panic!("File not found from the given key."),
            Err(error) => panic!("Error when loading file from storage: {:?}", error),
        };

        assert_eq!(store_data.owner, owner );
        assert_eq!(store_data.payload, payload);
    }


    #[test]
    fn proper_initialization() {
        let mut deps = mock_dependencies();

        let msg = InstantiateMsg { count: 17 };
        let info = mock_info("creator", &coins(1000, "earth"));

        // we can just call .unwrap() to assert this was a success
        let res = instantiate(deps.as_mut(), mock_env(), info, msg).unwrap();
        assert_eq!(0, res.messages.len());

        // it worked, let's query the state
        let res = query(deps.as_ref(), mock_env(), QueryMsg::GetCount {}).unwrap();
        let value: CountResponse = from_binary(&res).unwrap();
        assert_eq!(17, value.count);
    }

    #[test]
    fn increment() {
        let mut deps = mock_dependencies();

        let msg = InstantiateMsg { count: 17 };
        let info = mock_info("creator", &coins(2, "token"));
        let _res = instantiate(deps.as_mut(), mock_env(), info, msg).unwrap();

        // anyone can increment
        let info = mock_info("anyone", &coins(2, "token"));
        let msg = ExecuteMsg::Increment {};
        let _res = execute(deps.as_mut(), mock_env(), info, msg).unwrap();

        // should increase counter by 1
        let res = query(deps.as_ref(), mock_env(), QueryMsg::GetCount {}).unwrap();
        let value: CountResponse = from_binary(&res).unwrap();
        assert_eq!(18, value.count);
    }

    #[test]
    fn reset() {
        let mut deps = mock_dependencies();

        let msg = InstantiateMsg { count: 17 };
        let info = mock_info("creator", &coins(2, "token"));
        let _res = instantiate(deps.as_mut(), mock_env(), info, msg).unwrap();

        // not anyone can reset
        let unauth_env = mock_info("anyone", &coins(2, "token"));
        let msg = ExecuteMsg::Reset { count: 5 };
        let res = execute(deps.as_mut(), mock_env(), unauth_env, msg);
        match res {
            Err(ContractError::Unauthorized {}) => {}
            _ => panic!("Must return unauthorized error"),
        }

        // only the original creator can reset the counter
        let auth_info = mock_info("creator", &coins(2, "token"));
        let msg = ExecuteMsg::Reset { count: 5 };
        let _res = execute(deps.as_mut(), mock_env(), auth_info, msg).unwrap();

        // should now be 5
        let res = query(deps.as_ref(), mock_env(), QueryMsg::GetCount {}).unwrap();
        let value: CountResponse = from_binary(&res).unwrap();
        assert_eq!(5, value.count);
    }
}
