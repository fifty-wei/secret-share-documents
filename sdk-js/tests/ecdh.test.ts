import path from "node:path";
import { test, expect } from "@jest/globals";
import ECDHEncryption from "../src/StoreDocument/Encryption/ECDHEncryption";
import SecretNetworkIntergration from "../src/SmartContract/SecretNetworkIntegration";
import { Wallet } from "secretjs";


test("Generate ECDH Key Pairs", async () => {
  const ECDHKeys = ECDHEncryption.generate();

  console.log('[INFO] ECDH Keys:', { ECDHKeys });
  expect(ECDHKeys).toBeDefined();
  expect(ECDHKeys).toHaveProperty('privateKey');
  expect(ECDHKeys).toHaveProperty('publicKey');
});
