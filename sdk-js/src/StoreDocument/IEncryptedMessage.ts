export default interface IEncryptedMessage {
  payload: Uint8Array;
  publicKey: Uint8Array;
}
