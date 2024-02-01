use std::any::type_name;

use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use cosmwasm_std::{Addr, StdError, StdResult, Storage};

use secret_toolkit::serialization::{Bincode2, Serde};
use serde::de::DeserializeOwned;

use secret_toolkit::storage::Item;

// use secret_toolkit_storage::Keymap;

/// Prefix to store all the files in the smart contract
pub const PREFIX_FILES: &[u8] = b"files";

/// Item to store the public/private key of the Secret Smart Contract
pub static CONTRACT_KEYS: Item<ContractKeys> = Item::new(b"contract_keys");



// TODO :: Do a working approach then improve !
pub const PREFIX_USERS: &[u8] = b"users";


// Some documentation
// https://docs.scrt.network/secret-network-documentation/development/secret-contract-cosmwasm-framework/contract-components/storage/prefixed-storage


#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, JsonSchema)]
pub struct ContractKeys {
    pub private_key: Vec<u8>,
    pub public_key: Vec<u8>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, JsonSchema)]
pub struct FileState {
    pub owner: Addr,
    pub payload: String, 
    // pub viewers: Keymap<Addr, bool> // = Keymap::new(b"votes");
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, JsonSchema)]
pub struct UserInfo {
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
    storage.set(key, &Bincode2::serialize(value)?);
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
    Bincode2::deserialize(
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
        Some(value) => Bincode2::deserialize(&value).map(Some),
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

// TODO :: Should we change the encoding method - Use it when we have enum 

// /// Returns StdResult<()> resulting from saving an item to storage using Json (de)serialization
// /// because bincode2 annoyingly uses a float op when deserializing an enum
// ///
// /// # Arguments
// ///
// /// * `storage` - a mutable reference to the storage this item should go to
// /// * `key` - a byte slice representing the key to access the stored item
// /// * `value` - a reference to the item to store
// pub fn json_save<T: Serialize, S: Storage>(
//     storage: &mut S,
//     key: &[u8],
//     value: &T,
// ) -> StdResult<()> {
//     storage.set(key, &Json::serialize(value)?);
//     Ok(())
// }

// /// Returns StdResult<T> from retrieving the item with the specified key using Json
// /// (de)serialization because bincode2 annoyingly uses a float op when deserializing an enum.
// /// Returns a StdError::NotFound if there is no item with that key
// ///
// /// # Arguments
// ///
// /// * `storage` - a reference to the storage this item is in
// /// * `key` - a byte slice representing the key that accesses the stored item
// pub fn json_load<T: DeserializeOwned, S: ReadonlyStorage>(storage: &S, key: &[u8]) -> StdResult<T> {
//     Json::deserialize(
//         &storage
//             .get(key)
//             .ok_or_else(|| StdError::not_found(type_name::<T>()))?,
//     )
// }
