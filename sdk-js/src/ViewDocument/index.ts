import SecretDocumentSmartContract from "../SmartContract/SecretDocumentSmartContract";

interface Props {
  secretDocument: SecretDocumentSmartContract;
}

class ViewDocument {
  secretDocument: SecretDocumentSmartContract;

  constructor({ secretDocument }: Props) {
    this.secretDocument = secretDocument;
  }

  async all(): Promise<Array<string>> {
    return this.secretDocument.findAll();
  }

  async get(fileId: string): Promise<any> {
    return this.secretDocument.getFile(fileId);
  }
}

export default ViewDocument;
