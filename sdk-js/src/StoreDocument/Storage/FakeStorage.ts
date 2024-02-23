import IStorage from "./IStorage";
import ISymmetricEncryptedData from "../../Encryption/ISymmetricEncryptedData";
import IUploadOptions from "./IUploadOptions";

class FakeStorage implements IStorage {
  async upload(
    encryptedData: ISymmetricEncryptedData,
    options: IUploadOptions,
  ): Promise<any> {
    return `https://fake.net/1234567890`;
  }
}

export default FakeStorage;
