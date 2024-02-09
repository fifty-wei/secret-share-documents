import * as crypto from "crypto";

interface EncryptedData {
  initialVector: string;
  data: Buffer;
  authTag: string;
}

const algorithm = "aes-256-gcm";

function generate() {
  const key = crypto.randomBytes(32);
  return key;
}

function encrypt(data: Buffer, publicKey: Buffer): EncryptedData {
  const initialVector = crypto.randomBytes(16);
  let cipher = crypto.createCipheriv(algorithm, publicKey, initialVector);
  let encrypted = cipher.update(data);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    initialVector: initialVector.toString("hex"),
    data: encrypted,
    authTag: authTag.toString("hex"),
  };
}

function decrypt(encryptedData: EncryptedData, publicKey: Buffer): any {
  const initialVectorBuffer = Buffer.from(encryptedData.initialVector, "hex");
  const encryptedBuffer = Buffer.from(encryptedData.data);
  const authTag = Buffer.from(encryptedData.authTag, "hex");
  let decipher = crypto.createDecipheriv(
    algorithm,
    publicKey,
    initialVectorBuffer,
  );
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedBuffer);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted;
}

const SymmetricKey = {
  generate: generate,
  encrypt: encrypt,
  decrypt: decrypt,
};

export default SymmetricKey;
