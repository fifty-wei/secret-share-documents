async function getPublicKey() {
  const publicKey = 1234;
  console.log(`Retrieved public key is: ${publicKey}`);

  return publicKey;
}

const ShareDocumentSmartContract = {
  getPublicKey: getPublicKey,
};

export default ShareDocumentSmartContract;
