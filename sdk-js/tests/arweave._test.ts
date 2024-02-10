import SymmetricKeyEncryption from "../src/StoreDocument/Encryption/SymmetricKeyEncryption";
import ArweaveStorage from "../src/StoreDocument/Storage/ArweaveStorage";
import { test, expect, beforeAll, afterAll } from "@jest/globals";
import fs from "fs";
import IUploadOptions from "../src/StoreDocument/Storage/IUploadOptions";
import Arweave from "arweave";

const arweave = Arweave.init({
  host: "localhost",
  port: 1984,
  protocol: "http",
});

const jwk = JSON.parse(fs.readFileSync("wallet.json").toString());
const storage = new ArweaveStorage({
  client: arweave,
  key: jwk,
});

beforeAll(async () => {
  // Generate wallet
  const wallet = arweave.wallets.jwkToAddress(jwk);

  // Airdrop amount of tokens (in winston) to wallet
  const amountInWinston = arweave.ar.arToWinston("100");
  const toto = await arweave.api.get(`mint/${wallet}/${amountInWinston}`);

  console.log("[INFO] After airdrop tokens:");
  console.log({ toto });
});

test("Upload encrypted image", async () => {
  const balance = Number(await storage.getBalance());
  console.log("[INFO] Get balance before sending data:", { balance });

  const fileUrl = "https://school.truchot.co/ressources/sci-v2.jpg";

  // Fetch the document and prepare upload options.
  const response = await fetch(fileUrl);
  let uploadOptions: IUploadOptions = {
    contentType: "",
  };

  if (response.headers.get("content-type")) {
    uploadOptions.contentType = response.headers.get("content-type") as string;
  }

  const data = await response.arrayBuffer();
  const bufferData = Buffer.from(data);

  // Encrypt the document with the symmetric key.
  const localSymmetricKey = SymmetricKeyEncryption.generate();
  const encryptedData = SymmetricKeyEncryption.encrypt(
    bufferData,
    localSymmetricKey,
  );

  let res;

  try {
    res = await storage.upload(encryptedData, uploadOptions);
    const tata = await arweave.api.get("mine");
    console.log({ tata });
  } catch (e) {
    console.error(`[ERROR] Failed to store encrypted data to Arweave.`);
    console.error(e.error);
  }
  console.log({ res });

  const newBalance = Number(await storage.getBalance());
  console.log("[INFO] Get balance after sending data:", { newBalance });
  console.log();
  expect(balance).toBeGreaterThan(newBalance);
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
