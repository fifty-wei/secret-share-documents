import SecretDocumentSmartContract from "../SmartContract/SecretDocumentSmartContract";
import axios from "axios";
import SymmetricKeyEncryption from "../Encryption/SymmetricKeyEncryption";

interface Props {
  secretDocument: SecretDocumentSmartContract;
}

class ViewDocument {
  secretDocument: SecretDocumentSmartContract;

  constructor({ secretDocument }: Props) {
    this.secretDocument = secretDocument;
  }

  async getAllFileIds(): Promise<Array<string>> {
    return this.secretDocument.findAll();
  }

  async download(fileId: string): Promise<Buffer> {

    const { url, symmetricKey } = await this.secretDocument.getFile(fileId);
    const res = await axios.get(url);

    if (res.status !== 200) {
      throw Error(`Failed to download file at ${res}`);
    }

    return SymmetricKeyEncryption.decrypt(res.data, symmetricKey);
  }
}

export default ViewDocument;
