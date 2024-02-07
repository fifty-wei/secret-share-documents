import IEncryptedData from "./IEncryptedData";
import IUploadOptions from "./IUploadOptions";

export default interface IStorage {
  upload(data: IEncryptedData, options: IUploadOptions): Promise<string>;
}
