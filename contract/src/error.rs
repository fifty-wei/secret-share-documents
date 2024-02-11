use cosmwasm_std::StdError;
use thiserror::Error;

#[derive(Error, Debug, PartialEq)]
pub enum ContractError {
    #[error("{0}")]
    // let thiserror implement From<StdError> for you
    Std(#[from] StdError),

    #[error("Unauthorized")]
    // issued when message sender != owner
    Unauthorized {},

    #[error("Custom Error val: {val:?}")]
    CustomError { val: String },
    // Add any other custom errors you like here.
    // Look at https://docs.rs/thiserror/1.0.21/thiserror/ for details.

    #[error("The provided public key is invalid: {val:?}")]
    InvalidPublicKey { val: String },

    #[error("The symmetric encryption has failed for some reason.")]
    EncryptionError,

    #[error("The provided execute message encrypted is unknown.")]
    UnknownExecutePermitMsg,

    #[error("Error when deserialize the Permit message encrypted. More detail: {val:?}")]
    ErrorDeserializeExectueMsg {val: String},

}
