export default interface IEncryptedMessage {
  payload: Array<number>;
  public_key: Array<number>;
}
