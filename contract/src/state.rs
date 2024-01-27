use std::any::type_name;

use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use cosmwasm_std::{Addr, StdError, StdResult, Storage};
use cosmwasm_storage::{singleton, singleton_read, ReadonlySingleton, Singleton};

use secret_toolkit::serialization::{Bincode2, Serde};
use serde::de::DeserializeOwned;

use secret_toolkit_storage::Item;

// use secret_toolkit_storage::Keymap;

pub static CONFIG_KEY: &[u8] = b"config";

pub const PREFIX_FILES: &[u8] = b"files";

// Some code example
// https://github.com/scrtlabs/shielded-voting/blob/master/contracts/secret-poll/src/state.rs

// TODO
// https://docs.scrt.network/secret-network-documentation/development/secret-contract-cosmwasm-framework/contract-components/storage/prefixed-storage

// let mut password_store = PrefixedStorage::new(PREFIX_FILES, &mut deps.storage);
// let key: &[u8] = env.message.sender.to_string().as_bytes();
// save(&mut password_store, key, &msg.password)?;

// let mut password_store = PrefixedStorage::new(PREFIX_PASSWORDS, &mut deps.storage);
// let key: &[u8] = env.message.sender.to_string().as_bytes();
// // Throws error if there is no password saved before
// let password: String = load(&password_store, key)?;

// let password_store = ReadonlyPrefixedStorage::new(PREFIX_PASSWORDS, &deps.storage);
// let key = address.to_string().as_bytes();
// let may_password: Option<String> = may_load(&password_store, key)?;

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, JsonSchema)]
pub struct ContractKeys {
    pub private_key: Vec<u8>,
    pub public_key: Vec<u8>,
}

pub static CONTRACT_KEYS: Item<ContractKeys> = Item::new(b"contract_keys");

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, JsonSchema)]
pub struct FileState {
    pub owner: Addr,
    pub payload: String, // pub viewers: Keymap<Addr, bool> // = Keymap::new(b"votes");
}

// ID -> FileState

// TODO :: To be deleted

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, JsonSchema)]
pub struct State {
    pub count: i32,
    pub owner: Addr,
}

pub fn config(storage: &mut dyn Storage) -> Singleton<State> {
    singleton(storage, CONFIG_KEY)
}

pub fn config_read(storage: &dyn Storage) -> ReadonlySingleton<State> {
    singleton_read(storage, CONFIG_KEY)
}

// TODO :: End to be deleted

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

// TODO :: Use it when we have enum as we
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
