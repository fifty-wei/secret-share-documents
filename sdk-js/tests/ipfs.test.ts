import SymmetricKeyEncryption from "../src/StoreDocument/Encryption/SymmetricKeyEncryption";
import IPFSStorage from "../src/StoreDocument/Storage/IpfsStorage";
import { test, expect, beforeAll, afterAll } from "@jest/globals";
import fs from "fs";
import IUploadOptions from "../src/StoreDocument/Storage/IUploadOptions";

const storage = new IPFSStorage({
  gateway: "https://ipfs.infura.io",
});

test("uploads encrypted data to IPFS and returns a CID", async () => {
  const fileUrl = "https://school.truchot.co/ressources/sci-v2.jpg";

  const response = await fetch(fileUrl);
  let uploadOptions: IUploadOptions = {
    contentType: "",
  };

  if (response.headers.get("content-type")) {
    uploadOptions.contentType = response.headers.get("content-type") as string;
  }

  const data = await response.arrayBuffer();
  const bufferData = Buffer.from(data);

  const localSymmetricKey = SymmetricKeyEncryption.generate();
  const encryptedData = SymmetricKeyEncryption.encrypt(
    bufferData,
    localSymmetricKey
  );

  try {
    const res = await storage.upload(encryptedData, uploadOptions);
    console.log({ res });

    expect(res).toBeDefined();
  } catch (e) {
    console.error(`[ERROR] Failed to store encrypted data to Arweave.`);
    console.error(e.error);
  }
});
