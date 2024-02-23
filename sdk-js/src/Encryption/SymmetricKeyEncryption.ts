import { randomBytes, createCipheriv, createDecipheriv } from "crypto";
import ISymmetricEncryptedData from "./ISymmetricEncryptedData";

const algorithm = "aes-256-gcm";

function generate() {
  const key = randomBytes(32);
  return key;
}

function encrypt(data: Buffer, publicKey: Buffer): ISymmetricEncryptedData {
  const initialVector = randomBytes(16);
  let cipher = createCipheriv(algorithm, publicKey, initialVector);
  let encrypted = cipher.update(data);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    initialVector: initialVector.toString("hex"),
    data: encrypted,
    authTag: authTag.toString("hex"),
  };
}

function decrypt(
  encryptedData: ISymmetricEncryptedData,
  publicKey: Buffer,
): Buffer {
  const initialVectorBuffer = Buffer.from(encryptedData.initialVector, "hex");
  const encryptedBuffer = Buffer.from(encryptedData.data);
  const authTag = Buffer.from(encryptedData.authTag, "hex");
  let decipher = createDecipheriv(algorithm, publicKey, initialVectorBuffer);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedBuffer);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted;
}

const SymmetricKeyEncryption = {
  generate: generate,
  encrypt: encrypt,
  decrypt: decrypt,
};

export default SymmetricKeyEncryption;
