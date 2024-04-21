import SecretDocumentSmartContract from "../SmartContract/SecretDocumentSmartContract";
import axios from "axios";
import SymmetricKeyEncryption from "../Encryption/SymmetricKeyEncryption";
import IStorage from "../StoreDocument/Storage/IStorage";

interface Props {
  secretDocument: SecretDocumentSmartContract;
}

class ViewDocument {
  private secretDocument: SecretDocumentSmartContract;
  private storage: IStorage;

  constructor({ secretDocument, storage }: Props) {
    this.secretDocument = secretDocument;
    this.storage = storage;
  }

  async getAllFileIds(): Promise<Array<string>> {
    return this.secretDocument.findAll();
  }

  async download(fileId: string): Promise<Buffer> {

    const { url, symmetricKey } = await this.secretDocument.getFile(fileId);
    const res = await this.storage.download(url);

    return SymmetricKeyEncryption.decrypt(res, symmetricKey);
  }
}

export default ViewDocument;
