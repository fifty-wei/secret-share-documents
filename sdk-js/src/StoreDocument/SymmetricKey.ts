import * as crypto from "crypto";

interface EncryptedData {
  initialVector: string;
  data: string;
  authTag: string;
}

const algorithm = "aes-256-gcm";

// Generate symmetric key (256 bits for AES)
function generate() {
  const key = crypto.randomBytes(32);
  console.log("Symmetric key (hex):", key.toString("hex"));
  return key;
}

function encrypt(text: string, publicKey: Buffer): EncryptedData {
  const initialVector = crypto.randomBytes(16); // Move IV generation inside encrypt to ensure uniqueness per encryption
  let cipher = crypto.createCipheriv(algorithm, publicKey, initialVector);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const authTag = cipher.getAuthTag(); // Get authentication tag after finishing encryption
  return {
    initialVector: initialVector.toString("hex"),
    data: encrypted.toString("hex"),
    authTag: authTag.toString("hex"), // Return the authTag as part of the encrypted data
  };
}

function decrypt(encryptedData: EncryptedData, publicKey: Buffer): string {
  const initialVectorBuffer = Buffer.from(encryptedData.initialVector, "hex");
  const encryptedText = Buffer.from(encryptedData.data, "hex");
  const authTag = Buffer.from(encryptedData.authTag, "hex"); // Extract the authTag
  let decipher = crypto.createDecipheriv(
    algorithm,
    publicKey,
    initialVectorBuffer,
  );
  decipher.setAuthTag(authTag); // Set the authentication tag before decryption
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
