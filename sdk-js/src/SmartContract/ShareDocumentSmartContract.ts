export type Address = `0x${string}`;

class ShareDocumentSmartContract {
  async getPublicKey() {
    const publicKey = 1234;
    console.log(`Retrieved public key is: ${publicKey}`);

    return publicKey;
  }
}

export default ShareDocumentSmartContract;
