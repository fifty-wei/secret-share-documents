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

test("Upload an image from existing url", async () => {
  const url = 'https://school.truchot.co/ressources/sci-v2.jpg';
  let data = '';
  try {
    const storage = new ArweaveStorage({
      key: jwk,
      host: 'arweave.net',
      port: 443,
      protocol: 'https'
    });
    data = await storage.uploadFile(url);
    console.log({ data });
  } catch (e) {
    console.error(`[ERROR] Failed to upload file data from ${url} to Arweave.`);
    console.error(e);
  }

  expect(data).toBeDefined()
  expect(data).toContain('https://arweave.net/');
});
