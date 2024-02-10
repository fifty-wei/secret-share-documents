import path from "node:path";
import { expect, test } from "@jest/globals";
import ShareDocumentSmartContract from "../src/SmartContract/ShareDocumentSmartContract";
import SecretNetworkIntergration from "../src/SmartContract/SecretNetworkIntegration";
import { SecretNetworkClient, Wallet } from "secretjs";

const wallet = new Wallet();
const secretNetwork = new SecretNetworkIntergration({
  endpoint: "http://localhost:1317",
  chainId: "secretdev-1",
  faucetEndpoint: "http://localhost:5000",
  wallet: wallet,
});

test("Get public key", async () => {
  await secretNetwork.fillUpFromFaucet(100_000_000);
  const contractPath = path.resolve(__dirname, "../../contract/contract.wasm");
  const contract = await secretNetwork.initializeContract(contractPath);

  const shareDocument = new ShareDocumentSmartContract({
    client: secretNetwork.getClient(),
    contract: contract,
    wallet: wallet,
  });

  const publicKey = await shareDocument.getPublicKey();
  console.log("[INFO] Get publicKey:", { publicKey });

  expect(publicKey).toBeDefined();
}, 1_000_000);

test("Get permit", async () => {
  await secretNetwork.fillUpFromFaucet(100_000_000);
  const contractPath = path.resolve(__dirname, "../../contract/contract.wasm");
  const contract = await secretNetwork.initializeContract(contractPath);

  const shareDocument = new ShareDocumentSmartContract({
    client: secretNetwork.getClient(),
    contract: contract,
    wallet: wallet,
  });

  const permit = await shareDocument.generatePermit();

  console.log("[INFO] Get permit:", { permit });

  expect(permit).toBeDefined();
}, 1_000_000);
