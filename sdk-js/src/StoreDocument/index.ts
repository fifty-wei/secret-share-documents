import ShareDocumentSmartContract from "../SmartContract/ShareDocumentSmartContract";
import SymmetricKeyEncryption from "./Encryption/SymmetricKeyEncryption";
import IUploadOptions from "./Storage/IUploadOptions";
import ECDHEncryption from "./Encryption/ECDHEncryption";
import IEncryptedMessage from "./IEncryptedMessage";
import IStorage from "./Storage/IStorage";
import PolygonToSecretSmartContrat from "../SmartContract/PolygonToSecretSmartContract";

class StoreDocument {
  storage: IStorage;
  shareDocument: ShareDocumentSmartContract;
  polygonToSecret: PolygonToSecretSmartContrat;

  constructor({ shareDocument, polygonToSecret, storage }) {
    this.storage = storage;
    this.shareDocument = shareDocument;
    this.polygonToSecret = polygonToSecret;
  }

  async getEncryptedMessage(
    bufferData: Buffer,
    uploadOptions: IUploadOptions,
  ): Promise<IEncryptedMessage> {
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
    const payloadJson = {
      url: storageLink,
      symmetricKey: localSymmetricKey,
    };

    // Use ECDH method, to generate local asymmetric keys.
    const ECDHKeys = ECDHEncryption.generate();
    // Get the public key of the smart contract deployed on Secret Network
    const shareDocumentPublicKey = await this.shareDocument.getPublicKey();

    const ECDHSharedKey = ECDHEncryption.generateSharedKey(
      shareDocumentPublicKey,
      ECDHKeys.privateKey,
    );

    const shareDocumentPermit = await this.shareDocument.generatePermit();

    // Build new JSON with permit + the ECDH public key.
    const payloadWithPermit = {
      with_permit: {
        permit: shareDocumentPermit,
        execute: {
          store_new_file: {
            payload: JSON.stringify(payloadJson),
          },
        },
      },
    };

    // Encrypt the JSON with the public ECDH shared key.
    const encryptedPayload = await ECDHEncryption.encrypt(
      payloadWithPermit,
      ECDHSharedKey,
    );

    return {
      payload: Array.from(encryptedPayload),
      public_key: Array.from(ECDHKeys.publicKey),
    };
  }

  async storeEncryptedMessage(
    encryptedMessage: IEncryptedMessage,
  ): Promise<string> {
    const payload = {
      source_chain: "test-chain",
      source_address: "test-address",
      payload: encryptedMessage,
    };

    return this.polygonToSecret.send(payload);
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
    // const response = await fetch(fileUrl);
    let uploadOptions: IUploadOptions = {
      contentType: "",
    };

    // if (response.headers.get("content-type")) {
    //   uploadOptions.contentType = response.headers.get(
    //     "content-type",
    //   ) as string;
    // }

    const { data, contentType } = await this.fetchDocument(fileUrl);
    uploadOptions.contentType = contentType;
    const bufferData = Buffer.from(data);
    const encryptedMessage = await this.getEncryptedMessage(
      bufferData,
      uploadOptions,
    );
    return this.storeEncryptedMessage(encryptedMessage);
  }

  async fromFile(file: File): Promise<string> {
    const bufferData = Buffer.from(await file.arrayBuffer());
    const encryptedMessage = await this.getEncryptedMessage(bufferData, {
      contentType: file.type,
    });
    console.log({ encryptedMessage });
    return this.storeEncryptedMessage(encryptedMessage);
  }
}

export default StoreDocument;
