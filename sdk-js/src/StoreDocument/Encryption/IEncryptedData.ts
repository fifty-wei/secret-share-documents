export default interface IEncryptedData {
  initialVector: string;
  data: Buffer;
  authTag: string;
}
