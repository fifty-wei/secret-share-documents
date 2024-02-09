import { test, expect } from "@jest/globals";
import ECDHEncryption from "../src/StoreDocument/Encryption/ECDHEncryption";
import { Wallet } from "secretjs";

const contract = {
  hash: "86948e8c7f72343a4801bf6022aab4ca780b1ffa6cbb3423828f04562d7df3b0",
  address: "secret1zj4fuh42k6h2rpcnalq5wuzxys8gnqxcuhts33",
};

const wallet = new Wallet();

const ECDH = new ECDHEncryption({
  endpoint: "https://lcd.pulsar-3.secretsaturn.net",
  chainId: "pulsar-3",
  wallet: wallet,
  contract: contract,
});

test("Generate ECDH key with Secret Network", async () => {
  const txResponse = await ECDH.generate();
  console.log({ txResponse })
  // expect($key).toBeDefined();
});
