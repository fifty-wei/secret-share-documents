import SymmetricKey from "../src/StoreDocument/SymmetricKey";
import ArweaveStorage from "../src/StoreDocument/ArweaveStorage";
import { test, expect, beforeAll, afterAll } from "@jest/globals";
import fs from "fs";
import IUploadOptions from "../src/StoreDocument/IUploadOptions";
import ArLocal from 'arlocal';

// Arweave local.
const port = 1984;
const arLocal = new ArLocal(port);

beforeAll(async () => {
  // Start is a Promise, we need to start it inside an async function.
  await arLocal.start();
});

const localSymmetricKey = SymmetricKey.generate();
const jwk = JSON.parse(fs.readFileSync("wallet.json").toString());
const storage = new ArweaveStorage({
  key: jwk,
  host: 'localhost',
  port: port,
  protocol: 'http'
});

test("Arweave wallet exist", async () => {
  expect(jwk).toBeDefined();
});

test("Arweave storage exist", async () => {
  console.log('[INFO] Arweave storage:', { storage });
  expect(storage).toBeDefined();
});

test('Upload encrypted image', async () => {
  const fileUrl = 'https://school.truchot.co/ressources/sci-v2.jpg';

  // Fetch the document and prepare upload options.
  const response = await fetch(fileUrl);
  let uploadOptions: IUploadOptions = {
    contentType: ''
  };

  if (response.headers.get('content-type')) {
    uploadOptions.contentType = response.headers.get('content-type') as string;
  }

  const data = await response.arrayBuffer();
  const bufferData = Buffer.from(data);

  // Encrypt the document with the symmetric key.
  const encryptedData = SymmetricKey.encrypt(bufferData, localSymmetricKey);

  let res;

  try {
    res = await storage.upload(encryptedData, uploadOptions);
  } catch (error) {
    console.error(`[ERROR] Failed to store encrypted url to Arweave.`);
    console.error({ error });
  }
  console.log({ res })
  expect(res).toBeDefined();
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

afterAll(async () => {
  // After we are done with our tests, let's close the connection.
  await arLocal.stop();
})
