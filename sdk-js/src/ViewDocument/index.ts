import SecretDocumentSmartContract from "../SmartContract/SecretDocumentSmartContract";
import PolygonToSecretSmartContract from "../SmartContract/PolygonToSecretSmartContract";

class ViewDocument {
  shareDocument: SecretDocumentSmartContract;
  polygonToSecret: PolygonToSecretSmartContract;

  constructor({ shareDocument, polygonToSecret }) {
    this.shareDocument = shareDocument;
    this.polygonToSecret = polygonToSecret;
  }

  async all(): Promise<Array<string>> {
    return this.shareDocument.findAll();
  }

  async get(fileId: string): Promise<any> {
    return this.shareDocument.getFile(fileId);
  }
}

export default ViewDocument;
