import SymmetricKey from "../src/StoreDocument/SymmetricKey";
import { test, expect } from "@jest/globals";

test("Generate symmetric key is not empty", async () => {
  const key = SymmetricKey.generate();
  expect(key).toBeDefined();
});

test("Text is the same after decryption", async () => {
  const text = "fakeText";
  const publicKey = SymmetricKey.generate();
  // Need to be converted to Buffer to be encrypted.
  const bufferData = Buffer.from(text);
  const encryptedData = SymmetricKey.encrypt(bufferData, publicKey);
  const decryptedText = SymmetricKey.decrypt(encryptedData, publicKey);
  expect(decryptedText.toString()).toBe(text);
});


test("Image file is the same after decryption", async () => {
  const imageUrl = "https://school.truchot.co/ressources/sci-v2.jpg";
  const response = await fetch(imageUrl);
  const data = await response.arrayBuffer();
  // Need to be converted to Buffer to be encrypted.
  const bufferData = Buffer.from(data);
  const publicKey = SymmetricKey.generate();
  const encryptedData = SymmetricKey.encrypt(bufferData, publicKey);
  const decryptedImage = SymmetricKey.decrypt(encryptedData, publicKey);
  expect(Buffer.compare(decryptedImage, bufferData)).toBe(0);
});


test("PDF file is the same after decryption", async () => {
  const imageUrl = "https://school.truchot.co/ressources/brief-arolles-bis.pdf";
  const response = await fetch(imageUrl);
  const data = await response.arrayBuffer();
  // Need to be converted to Buffer to be encrypted.
  const bufferData = Buffer.from(data);
  const publicKey = SymmetricKey.generate();
  const encryptedData = SymmetricKey.encrypt(bufferData, publicKey);
  const decryptedImage = SymmetricKey.decrypt(encryptedData, publicKey);
  expect(Buffer.compare(decryptedImage, bufferData)).toBe(0);
});
