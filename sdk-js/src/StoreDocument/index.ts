import IUploadOptions from "./Storage/IUploadOptions";
import SymmetricKeyEncryption from "../Encryption/SymmetricKeyEncryption";
import IStorage from "./Storage/IStorage";
import PolygonToSecretSmartContract from "../SmartContract/PolygonToSecretSmartContract";
import SecretDocumentSmartContract from "../SmartContract/SecretDocumentSmartContract";
import IEncryptedData from "../Encryption/IEncryptedData";

interface UploadedDocument {
  url: string;
  symmetricKey: Buffer;
}

interface Props {
  secretDocument: SecretDocumentSmartContract;
  polygonToSecret: PolygonToSecretSmartContract;
  storage: IStorage;
}

class StoreDocument {
  storage: IStorage;
  secretDocument: SecretDocumentSmartContract;
  polygonToSecret: PolygonToSecretSmartContract;

  constructor({ secretDocument, polygonToSecret, storage }: Props) {
    this.storage = storage;
    this.secretDocument = secretDocument;
    this.polygonToSecret = polygonToSecret;
  }

  async uploadDocument(
    bufferData: Buffer,
    uploadOptions: IUploadOptions,
  ): Promise<UploadedDocument> {
    // Locally generate a symmetric key to encrypt the uploaded data.
    const localSymmetricKey = SymmetricKeyEncryption.generate();

    // Encrypt the document with the symmetric key.
    const encryptedData = SymmetricKeyEncryption.encrypt(
      bufferData,
      localSymmetricKey,
    );

    // Send the encrypted document to Arweave or IPFS and retrieve the access link.
    const storageLink = await this.storage.upload(encryptedData, uploadOptions);

    // Create a JSON file that bundles the information to be stored on Secret Network,
    // including the storage link and the symmetric key (generated locally) used to encrypt the data.
    return {
      url: storageLink,
      symmetricKey: localSymmetricKey,
    };
  }

  async getEncryptedMessage(
    bufferData: Buffer,
    uploadOptions: IUploadOptions,
  ): Promise<IEncryptedData> {
    const payloadJson = await this.uploadDocument(bufferData, uploadOptions);

    const payloadWithPermit = await this.secretDocument.wrapPayloadWithPermit({
      execute: this.secretDocument
        .getExecuteFactory()
        .storeNewFile(JSON.stringify(payloadJson)),
    });

    return this.secretDocument.encryptPayload(payloadWithPermit);
  }

  async fetchDocument(fileUrl: string) {
    // Fetch the document and prepare upload options.
    const response = await fetch(fileUrl);

    const data = await response.arrayBuffer();

    return {
      contentType: response.headers.get("content-type") as string,
      data: data,
    };
  }

  async fromUrl(fileUrl: string): Promise<string> {
    // Fetch the document and prepare upload options.
    let uploadOptions: IUploadOptions = {
      contentType: "",
    };

    const { data, contentType } = await this.fetchDocument(fileUrl);
    uploadOptions.contentType = contentType;
    const bufferData = Buffer.from(data);
    const encryptedMessage = await this.getEncryptedMessage(
      bufferData,
      uploadOptions,
    );

    return this.polygonToSecret.send(encryptedMessage);
  }

  async fromFile(file: File): Promise<string> {
    const bufferData = Buffer.from(await file.arrayBuffer());
    const encryptedMessage = await this.getEncryptedMessage(bufferData, {
      contentType: file.type,
    });

    return this.polygonToSecret.send(encryptedMessage);
  }
}

export default StoreDocument;
