import * as crypto from "crypto";

interface EncryptedData {
  initialVector: string;
  data: string;
}

const algorithm = "aes-256-cbc"; // Encryption Algorithm
const initialVector = crypto.randomBytes(16); // Initialisation Vector

// Generate symmetric key (256 bits for AES)
function generate() {
  const key = crypto.randomBytes(32);
  console.log("Symmetric key (hex):", key.toString("hex"));
  return key;
}

function decrypt(encryptedData: EncryptedData, key: string): string {
  let initialVectorBuffer = Buffer.from(encryptedData.initialVector, "hex");
  let encryptedText = Buffer.from(encryptedData.data, "hex");
  let decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(key),
    initialVectorBuffer,
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

function encrypt(text: string, key: string): EncryptedData {
  let cipher = crypto.createCipheriv(
    algorithm,
    Buffer.from(key),
    initialVector,
  );
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return {
    initialVector: initialVector.toString("hex"),
    data: encrypted.toString("hex"),
  };
}

const SymmetricKey = {
  generate: generate,
  encrypt: encrypt,
  decrypt: decrypt,
};

export default SymmetricKey;
