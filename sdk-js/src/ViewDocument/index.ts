import SecretDocumentSmartContract from "../SmartContract/SecretDocumentSmartContract";
import PolygonToSecretSmartContract from "../SmartContract/PolygonToSecretSmartContract";

class ViewDocument {
    shareDocument: SecretDocumentSmartContract;
    polygonToSecret: PolygonToSecretSmartContract;

    constructor({ shareDocument, polygonToSecret }) {
        this.shareDocument = shareDocument;
        this.polygonToSecret = polygonToSecret;
    }

    async all(): Promise<Array<any>> {
        return this.shareDocument.findAll();
    }

    // async get(id: string): Promise<any> {
    //     return this.shareDocument.get(id);
    // }
}

export default ViewDocument;
