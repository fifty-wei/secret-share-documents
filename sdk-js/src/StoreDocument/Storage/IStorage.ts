import ISymmetricEncryptedData from "../../Encryption/ISymmetricEncryptedData";
import IUploadOptions from "./IUploadOptions";

export default interface IStorage {
  upload(
    data: ISymmetricEncryptedData,
    options: IUploadOptions,
  ): Promise<string>;
}
