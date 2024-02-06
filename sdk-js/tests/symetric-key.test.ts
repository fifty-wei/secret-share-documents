import SymmetricKey from "../src/StoreDocument/SymmetricKey";
import { test, expect } from "@jest/globals";

test("Generate symmetric key is not empty", async () => {
  const key = await SymmetricKey.generate();
  expect(key).toBeDefined();
});

test("Text is the same after decryption", async () => {
  const key = await SymmetricKey.generate();
  const text = "fakeText";
  const encryptedData = SymmetricKey.encrypt(text, key.toString("hex"));
  const decryptedText = SymmetricKey.decrypt(
    encryptedData,
    key.toString("hex"),
  );
  expect(decryptedText).toBe(text);
});
