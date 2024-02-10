import { SecretNetworkClient, Wallet } from "secretjs";
import ShareDocumentSmartContract from "../SmartContract/ShareDocumentSmartContract";
import SymmetricKeyEncryption from "./Encryption/SymmetricKeyEncryption";
import ISmartContract from "../SmartContract/ISmartContract";
import IStorage from "./Storage/IStorage";
import IUploadOptions from "./Storage/IUploadOptions";
import ECDHEncryption from "./Encryption/ECDHEncryption";

class StoreDocument {
  client: SecretNetworkClient;
  contract: ISmartContract;
  storage: IStorage;
  wallet: Wallet;

  constructor({ client, contract, storage, wallet }) {
    this.client = client;
    this.contract = contract;
    this.storage = storage;
    this.wallet = wallet;
  }

  // TODO: Add the type of the return value.
  async store(fileUrl: string): Promise<any> {
    // Get the public key of the smart contract deployed on Secret Network
    const shareDocument = new ShareDocumentSmartContract({
      client: this.client,
      contract: this.contract,
    });
    const shareDocumentPublicKey = shareDocument.getPublicKey();

    // Locally generate a symmetric key to encrypt the uploaded data.
    const localSymmetricKey = SymmetricKeyEncryption.generate();

    // Fetch the document and prepare upload options.
    const response = await fetch(fileUrl);
    let uploadOptions: IUploadOptions = {
      contentType: "",
    };

    if (response.headers.get("content-type")) {
      uploadOptions.contentType = response.headers.get(
        "content-type",
      ) as string;
    }

    const data = await response.arrayBuffer();
    const bufferData = Buffer.from(data);

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
      publicKey: localSymmetricKey,
    };

    // Use ECDH method, to generate local asymmetric keys.
    const ECDHKeys = ECDHEncryption.generate();
    console.log("[INFO] Generated ECDH keys:");
    console.log({ ECDHKeys });

    // Build new JSON with the payload (binary) + the ECDH public key.
    // const encyptedPayload = {
    //   data: payloadJson,
    //   publicKey: ECDH.getPublicKey()
    // }
    
    // The payload includes the action to be performed as specified in the JSON.

    // Encrypt the JSON with the public ECDH key multiply by the public key of the Secret Network's smart contract.

    // Make a request through the Polygon smart contract, which contacts Secret Network via Axelar to store everything in the Secret contract.
  }


  storeFile();
}

export default StoreDocument;
