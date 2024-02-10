import ShareDocumentSmartContract from "../SmartContract/ShareDocumentSmartContract";
import SymmetricKey from "./SymmetricKey";

interface StoreInBlockchain {
  config: {}
}

class StoreDocument {

  const stores: StoreInBlockchain[] = [];

  store(url) {
    // Get the public key of the smart contract deployed on Secret Network
    const shareDocumentPublicKey = ShareDocumentSmartContract.getPublicKey();

    // Locally generate a symmetric key to encrypt the uploaded data.
    const localSymmetricKey = SymmetricKey.generate();

    // Send the encrypted document to Arweave or IPFS and retrieve the access link.
    // this.getStorage().forEach((store) => {
    //   store.store(url);
    // });

    // Create a JSON file that bundles the information to be stored on Secret Network,
    // including the Arweave link and the symmetric key (generated locally) used to encrypt the data.

    // Use ECDH method, to generate an asymmetric key on Secret Network.

    // Build new JSON with the payload (binary) + the ECDH public key.
    // The payload includes the action to be performed as specified in the JSON.

    // Encrypt the JSON with the public ECDH key multiply by the public key of the Secret Network's smart contract.

    // Make a request through the Polygon smart contract, which contacts Secret Network via Axelar to store everything in the Secret contract.
  }

  addStorage(store StoreInBlockchain) {
    this.stores.push(store)
  }

  getStorage() {
    return this.stores
  }
};

export default StoreDocument;
