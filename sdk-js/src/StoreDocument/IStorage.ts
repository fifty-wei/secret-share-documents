import IEncryptedData from "./IEncryptedData";

export default interface IStorage {
  uploadFile(url: string): Promise<string>;
  storeEncryptedData(data: IEncryptedData): Promise<{ status: number, data: any }>;
}
