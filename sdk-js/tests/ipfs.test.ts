import SymmetricKeyEncryption from "../src/StoreDocument/Encryption/SymmetricKeyEncryption";
import IPFSStorage from "../src/StoreDocument/Storage/IpfsStorage";
import { test, expect, beforeAll, afterAll } from "@jest/globals";
import fs from "fs";
import IUploadOptions from "../src/StoreDocument/Storage/IUploadOptions";

const infuraID = "2Er6nLb2S8XDPrZ370KJogG1eur";
const infuraSecret = "e5ce1a9a99c3dc1e8f2f10b370169577";
const gateway = "https://ipfs.infura.io";

const ipfsStorage = new IPFSStorage({
  infuraId: infuraID,
  infuraSecret: infuraSecret,
  gateway: gateway,
});

test("uploads encrypted data to IPFS and returns a CID", async () => {
  const encryptedData = {
    data: Buffer.from("Hello, world!"), // Simulate encrypted data as a Buffer
    initialVector: "iv",
    authTag: "authTag",
  };
  const options = {}; // Assuming IUploadOptions can be empty for this test
  const cid = await ipfsStorage.upload(encryptedData, options);

  expect(cid).toEqual(
    `https://ipfs.infura.io/ipfs/bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efm3dqk6nghqg5hakj234hqe`
  );
  expect(add).toHaveBeenCalledWith(encryptedData.data); // Ensure the IPFS add function was called with correct data
});
