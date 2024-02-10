export default interface IEvmEncryptedMessage {
  payload: Uint8Array;
  public_key: Uint8Array;
}
