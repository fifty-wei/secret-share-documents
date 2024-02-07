import { SecretNetworkClient } from "secretjs";
import ShareDocumentSmartContract from "../SmartContract/ShareDocumentSmartContract";
import SymmetricKey from "./SymmetricKey";
import ISmartContract from "../SmartContract/ISmartContract";
import IStorage from "./IStorage";
import IUploadOptions from "./IUploadOptions";

class StoreDocument {

  client: SecretNetworkClient;
  contract: ISmartContract;
  storage: IStorage;

  constructor({
    client,
    contract,
    storage
  }) {
    this.client = client;
    this.contract = contract;
    this.storage = storage;
  }

  // TODO: Add the type of the return value.
  async store(fileUrl: string): Promise<any> {
    // Get the public key of the smart contract deployed on Secret Network
    const shareDocument = new ShareDocumentSmartContract({
      client: this.client,
      contract: this.contract
    });
    const shareDocumentPublicKey = shareDocument.getPublicKey();

    // Locally generate a symmetric key to encrypt the uploaded data.
    const localSymmetricKey = SymmetricKey.generate();

    // Fetch the document and prepare upload options.
    const response = await fetch(fileUrl);
    let uploadOptions: IUploadOptions = {
      contentType: ''
    };

    if (response.headers.get('content-type')) {
      uploadOptions.contentType = response.headers.get('content-type') as string;
    }

    const data = await response.arrayBuffer();
    const bufferData = Buffer.from(data);

    // Encrypt the document with the symmetric key.
    const encryptedData = SymmetricKey.encrypt(bufferData, localSymmetricKey);

    // Send the encrypted document to Arweave or IPFS and retrieve the access link.
    const storageLink = this.storage.upload(encryptedData, uploadOptions);

    // Create a JSON file that bundles the information to be stored on Secret Network,
    // including the Arweave link and the symmetric key (generated locally) used to encrypt the data.
    const payloadJson = {
      url: storageLink,
      publicKey: localSymmetricKey
    }

    // Use ECDH method, to generate an asymmetric key on Secret Network.

    // Build new JSON with the payload (binary) + the ECDH public key.
    // The payload includes the action to be performed as specified in the JSON.

    // Encrypt the JSON with the public ECDH key multiply by the public key of the Secret Network's smart contract.

    // Make a request through the Polygon smart contract, which contacts Secret Network via Axelar to store everything in the Secret contract.
  }
};

export default StoreDocument;
