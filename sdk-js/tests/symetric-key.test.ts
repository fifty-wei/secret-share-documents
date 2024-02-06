import SymmetricKey from "../src/StoreDocument/SymmetricKey";
import { test, expect } from "@jest/globals";

test("Generate symmetric key is not empty", async () => {
  const key = SymmetricKey.generate();
  expect(key).toBeDefined();
});

test("Text is the same after decryption", async () => {
  const text = "fakeText";
  const publicKey = SymmetricKey.generate();
  const encryptedData = SymmetricKey.encrypt(text, publicKey);
  const decryptedText = SymmetricKey.decrypt(encryptedData, publicKey);
  expect(decryptedText).toBe(text);
});
