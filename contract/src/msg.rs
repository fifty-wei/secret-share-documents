use cosmwasm_std::Addr;
// use cosmwasm_std::Binary;

use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use secret_toolkit::permit::Permit;


#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, JsonSchema)]
pub struct InstantiateMsg {}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum ExecuteMsg {
    ReceiveMessageEvm {
        source_chain: String,
        source_address: String,
        payload: EncryptedExecuteMsg, 
    },
}



#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct EncryptedExecuteMsg {
    pub payload: Vec<u8>,
    pub public_key: Vec<u8>,  // TODO :: See with front if it is better to have it in hex instead
}



#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum ExecutePermitMsg {
    WithPermit {
        permit: Permit,
        execute: ExecuteMsgAction,
    },
}


#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum ExecuteMsgAction {
    StoreNewFile {
        payload: String,
    },
    ManageFileRights { // Only owner of the file can call with this request
        file_id: String,
        add_viewing: Vec<Addr>, // Add viewing rights
        delete_viewing: Vec<Addr>,  // Delete viewing rights
        change_owner: Addr,  // Change owner of the file
    }
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum QueryMsg {
    GetContractKey {},
    WithPermit {
        permit: Permit,
        query: QueryWithPermit,
    },
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum QueryWithPermit {
    GetFileIds {},
    GetFileContent { file_id: String },
    GetFileAccess { file_id: String },
}

// We define a custom struct for each query response
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, JsonSchema)]
pub struct FilePayloadResponse {
    pub payload: String,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, JsonSchema)]
pub struct ContractKeyResponse {
    pub public_key: Vec<u8>,  // TODO :: See with front if it is better to have it in hex instead
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, JsonSchema)]
pub struct FileIdsResponse {
    pub file_ids: Vec<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, JsonSchema)]
pub struct FileAccessResponse {
    pub owner: Addr,
    pub viewers: Vec<Addr>,
}
