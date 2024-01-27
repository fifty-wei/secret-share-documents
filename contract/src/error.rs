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
}

#[derive(Debug)]
pub enum CryptoError {
    /// The ECDH process failed.
    DerivingKeyError = 1,
    /// A key was missing.
    MissingKeyError = 2,
    /// The symmetric decryption has failed for some reason.
    DecryptionError = 3,
    /// The ciphertext provided was improper.
    /// e.g. MAC wasn't valid, missing IV etc.
    ImproperEncryption = 4,
    /// The symmetric encryption has failed for some reason.
    EncryptionError = 5,
    /// The signing process has failed for some reason.
    SigningError = 6,
    /// The signature couldn't be parsed correctly.
    ParsingError = 7,
    /// The public key can't be recovered from a message & signature.
    RecoveryError = 8,
    /// A key wasn't valid.
    /// e.g. PrivateKey, PublicKey, SharedSecret.
    KeyError = 9,
    /// The random function had failed generating randomness
    RandomError = 10,
    /// An error related to signature verification
    VerificationError = 11,
    SocketCreationError = 12,
    IPv4LookupError = 13,
    IntelCommunicationError = 14,
    SSSCommunicationError = 15,
    BadResponse = 16,
}
