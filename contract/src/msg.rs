use cosmwasm_std::Addr;
use cosmwasm_std::Binary;

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
        payload: EncryptedExecuteMsg,  // TODO :: Change to EVMExecuteMsg as we do not need to encrypt this one
    },
}



#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct EncryptedExecuteMsg {
    pub payload: Binary,
    pub public_key: Vec<u8>,  // TODO :: See with fron if it is better to have it in hex instead
}



#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum ExecuteMsgAction {
    StoreNewFile {
        owner: Addr,
        payload: String,
    },
    ManageFileRights {
        // TODO :: 
        // Think also to add a permit here
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
    GetFileContent { key: String },
}

// We define a custom struct for each query response
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, JsonSchema)]
pub struct FilePayloadResponse {
    pub payload: String,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, JsonSchema)]
pub struct ContractKeyResponse {
    pub public_key: Vec<u8>,  // TODO :: See with fron if it is better to have it in hex instead
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, JsonSchema)]
pub struct FileIdsResponse {
    pub ids: Vec<String>,
}
