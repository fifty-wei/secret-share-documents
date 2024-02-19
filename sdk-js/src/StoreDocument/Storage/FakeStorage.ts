import IStorage from "./IStorage";
import IEncryptedData from "../Encryption/IEncryptedData";
import IUploadOptions from "./IUploadOptions";

class FakeStorage implements IStorage {
  async upload(
    encryptedData: IEncryptedData,
    options: IUploadOptions,
  ): Promise<any> {
    return `https://fake.net/1234567890`;
  }
}

export default FakeStorage;
