import * as crypto from "crypto";

interface EncryptedData {
  initialVector: string;
  data: string;
  authTag: string;
}

const algorithm = "aes-256-gcm";

function generate() {
  const key = crypto.randomBytes(32);
  return key;
}

function encrypt(text: string, publicKey: Buffer): EncryptedData {
  const initialVector = crypto.randomBytes(16);
  let cipher = crypto.createCipheriv(algorithm, publicKey, initialVector);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    initialVector: initialVector.toString("hex"),
    data: encrypted.toString("hex"),
    authTag: authTag.toString("hex"),
  };
}

function decrypt(encryptedData: EncryptedData, publicKey: Buffer): string {
  const initialVectorBuffer = Buffer.from(encryptedData.initialVector, "hex");
  const encryptedText = Buffer.from(encryptedData.data, "hex");
  const authTag = Buffer.from(encryptedData.authTag, "hex");
  let decipher = crypto.createDecipheriv(
    algorithm,
    publicKey,
    initialVectorBuffer,
  );
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

const SymmetricKey = {
  generate: generate,
  encrypt: encrypt,
  decrypt: decrypt,
};

export default SymmetricKey;
