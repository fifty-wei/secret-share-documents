import { randomBytes } from "crypto";
import secp256k1 from "secp256k1";

function getPrivateKey(): Buffer {
  while (true) {
    const privateKey = randomBytes(32)
    if (secp256k1.privateKeyVerify(privateKey)) {
      return privateKey
    }
  }
}

function generate() {
  const privateKey = getPrivateKey();
  const publicKey = secp256k1.publicKeyCreate(privateKey)

  return {
    privateKey: privateKey,
    publicKey: publicKey,
  }
}

const ECDHEncryption = {
  generate: generate,
};

export default ECDHEncryption;
