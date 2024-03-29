use std::any::type_name;

use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use serde::de::DeserializeOwned;

use cosmwasm_std::{Addr, StdError, StdResult, Storage};

use secret_toolkit::serialization::{Json, Serde};
use secret_toolkit::storage::{Item, Keymap};


pub const KEY_CONFIG: &[u8] = b"config";
pub const KEY_CONTRACT_KEYS: &[u8] = b"contract_keys";
pub const KEY_FILE_PERMISSIONS: &[u8] = b"files_permissions";

/// Prefix to store all the files in the smart contract
pub const PREFIX_FILES: &[u8] = b"files";
pub const PREFIX_FILES_METADATA: &[u8] = b"files_metadata";
pub const PREFIX_REVOKED_PERMITS: &str = "revoked_permits";
pub const PREFIX_USERS: &[u8] = b"users";

pub static CONFIG: Item<Config> = Item::new(KEY_CONFIG);

/// Item to store the public/private key of the Secret Smart Contract
pub static CONTRACT_KEYS: Item<ContractKeys> = Item::new(KEY_CONTRACT_KEYS);

/// (file_id, user_address) => access
pub static FILE_PERMISSIONS: Keymap<([u8; 32], Addr), bool> = Keymap::new(KEY_FILE_PERMISSIONS);


#[derive(Serialize, Debug, Deserialize, Clone, JsonSchema)]
#[cfg_attr(test, derive(Eq, PartialEq))]
pub struct Config {
    // the address of this contract, used to validate query permits
    pub contract_address: Addr,
    pub index: u128,
}


#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, JsonSchema)]
pub struct ContractKeys {
    pub private_key: Vec<u8>,
    pub public_key: Vec<u8>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, JsonSchema)]
pub struct FileState {
    pub payload: String, 
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, JsonSchema)]
pub struct FileMetadata {
    pub owner: Addr, 
    pub viewers: Vec<Addr>,
}


#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, JsonSchema)]
pub struct UserInfo {
    // Files the user can see
    pub files: Vec<[u8; 32]>, 
}


/// Returns StdResult<()> resulting from saving an item to storage
///
/// # Arguments
///
/// * `storage` - a mutable reference to the storage this item should go to
/// * `key` - a byte slice representing the key to access the stored item
/// * `value` - a reference to the item to store
pub fn save<T: Serialize, S: Storage>(storage: &mut S, key: &[u8], value: &T) -> StdResult<()> {
    storage.set(key, &Json::serialize(value)?);
    Ok(())
}

/// Returns StdResult<T> from retrieving the item with the specified key.  Returns a
/// StdError::NotFound if there is no item with that key
///
/// # Arguments
///
/// * `storage` - a reference to the storage this item is in
/// * `key` - a byte slice representing the key that accesses the stored item
pub fn load<T: DeserializeOwned, S: Storage>(storage: &S, key: &[u8]) -> StdResult<T> {
    Json::deserialize(
        &storage
            .get(key)
            .ok_or_else(|| StdError::not_found(type_name::<T>()))?,
    )
}

/// Returns StdResult<Option<T>> from retrieving the item with the specified key.
/// Returns Ok(None) if there is no item with that key
///
/// # Arguments
///
/// * `storage` - a reference to the storage this item is in
/// * `key` - a byte slice representing the key that accesses the stored item
pub fn may_load<T: DeserializeOwned, S: Storage>(storage: &S, key: &[u8]) -> StdResult<Option<T>> {
    match storage.get(key) {
        Some(value) => Json::deserialize(&value).map(Some),
        None => Ok(None),
    }
}

/// Removes an item from storage
///
/// # Arguments
///
/// * `storage` - a mutable reference to the storage this item is in
/// * `key` - a byte slice representing the key that accesses the stored item
pub fn remove<S: Storage>(storage: &mut S, key: &[u8]) {
    storage.remove(key);
}
