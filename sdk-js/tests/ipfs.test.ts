import SymmetricKeyEncryption from "../src/Encryption/SymmetricKeyEncryption";
import { test, expect } from "@jest/globals";
import IUploadOptions from "../src/StoreDocument/Storage/IUploadOptions";
import IPFSStorage from "../src/StoreDocument/Storage/IPFSStorage";


test("Upload encrypted image via IPFS", async () => {
  const storage = new IPFSStorage();
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
  } catch (e) {
    console.error(`[ERROR] Failed to store encrypted data via IPFS.`);
    console.error(e.error);
  }
  console.log({ res });

  expect(res).toBeDefined();
});
