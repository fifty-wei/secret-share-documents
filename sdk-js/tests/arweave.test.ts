import SymmetricKey from "../src/StoreDocument/SymmetricKey";
import ArweaveStorage from "../src/StoreDocument/ArweaveStorage";
import { test, expect } from "@jest/globals";
import fs from "fs";

const jwk = JSON.parse(fs.readFileSync("wallet.json").toString());

test("Arweave wallet exist", async () => {
  expect(jwk).toBeDefined();
});

test("Arweave storage exist", async () => {
  const storage = new ArweaveStorage({
    key: jwk,
    host: 'arweave.net',
    port: 443,
    protocol: 'https'
  });
  expect(storage).toBeDefined();
});

test('Upload encrypted URL', async () => {
  const url = 'https://school.truchot.co/ressources/sci-v2.jpg';
  const publicKey = SymmetricKey.generate();
  const encryptedUrl = SymmetricKey.encrypt(url, publicKey);
  const storage = new ArweaveStorage({
    key: jwk,
    host: 'arweave.net',
    port: 443,
    protocol: 'https'
  });

  let data;

  try {
    data = await storage.storeEncryptedData(encryptedUrl);
  } catch (e) {
    console.error(`[ERROR] Failed to store encrypted url to Arweave.`);
    console.error(e);
  }
  console.log({ data })
  expect(data).toBeDefined();
});

// test("Upload an image from existing url", async () => {
//   const url = 'https://school.truchot.co/ressources/sci-v2.jpg';
//   let data = '';
//     const storage = new ArweaveStorage({
//       key: jwk,
//       host: 'arweave.net',
//       port: 443,
//       protocol: 'https'
//     });
//   try {
//     data = await storage.storeEncryptedUrl(url);
//     console.log({ data });
//   } catch (e) {
//     console.error(`[ERROR] Failed to upload file data from ${url} to Arweave.`);
//     console.error(e);
//   }

//   expect(data).toBeDefined()
//   expect(data).toContain('https://arweave.net/');
// });
