export default interface ISymmetricEncryptedData {
  initialVector: string;
  data: Buffer;
  authTag: string;
}
