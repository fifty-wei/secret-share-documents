export default interface IEncryptedMessage {
  payload: Uint8Array;
  public_key: Uint8Array;
}
