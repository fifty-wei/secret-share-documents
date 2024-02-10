import SymmetricKeyEncryption from "../src/StoreDocument/Encryption/SymmetricKeyEncryption";
import { test, expect } from "@jest/globals";

test("Generate symmetric key is not empty", async () => {
  const key = SymmetricKeyEncryption.generate();
  expect(key).toBeDefined();
});

test("Text is the same after decryption", async () => {
  const text = "fakeText";
  const publicKey = SymmetricKeyEncryption.generate();
  // Need to be converted to Buffer to be encrypted.
  const bufferData = Buffer.from(text);
  const encryptedData = SymmetricKeyEncryption.encrypt(bufferData, publicKey);
  const decryptedText = SymmetricKeyEncryption.decrypt(encryptedData, publicKey);
  expect(decryptedText.toString()).toBe(text);
});


test("Image file is the same after decryption", async () => {
  const imageUrl = "https://school.truchot.co/ressources/sci-v2.jpg";
  const response = await fetch(imageUrl);
  const data = await response.arrayBuffer();
  // Need to be converted to Buffer to be encrypted.
  const bufferData = Buffer.from(data);
  const publicKey = SymmetricKeyEncryption.generate();
  const encryptedData = SymmetricKeyEncryption.encrypt(bufferData, publicKey);
  const decryptedImage = SymmetricKeyEncryption.decrypt(encryptedData, publicKey);
  expect(Buffer.compare(decryptedImage, bufferData)).toBe(0);
});


test("PDF file is the same after decryption", async () => {
  const imageUrl = "https://school.truchot.co/ressources/brief-arolles-bis.pdf";
  const response = await fetch(imageUrl);
  const data = await response.arrayBuffer();
  // Need to be converted to Buffer to be encrypted.
  const bufferData = Buffer.from(data);
  const publicKey = SymmetricKeyEncryption.generate();
  const encryptedData = SymmetricKeyEncryption.encrypt(bufferData, publicKey);
  const decryptedImage = SymmetricKeyEncryption.decrypt(encryptedData, publicKey);
  expect(Buffer.compare(decryptedImage, bufferData)).toBe(0);
});
