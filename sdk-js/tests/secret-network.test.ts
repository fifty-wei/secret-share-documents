import { expect, test } from "@jest/globals";
import path from "node:path";
import SecretNetworkIntergration from "../src/SmartContract/SecretNetworkIntegration";
import { SecretNetworkClient } from "secretjs";

const secretNetwork = new SecretNetworkIntergration({
  endpoint: "http://localhost:1317",
  chainId: "secretdev-1",
  faucetEndpoint: 'http://localhost:5000'
});

test("Initialize a client", async () => {
  expect(secretNetwork.getClient()).toBeDefined();
  expect(secretNetwork.getClient()).toBeInstanceOf(SecretNetworkClient);
});

test("Initialize a contract", async () => {
  console.log(`Initialized client with wallet address: ${secretNetwork.getClient().address}`);

  await secretNetwork.fillUpFromFaucet(100_000_000);

  const contractPath = path.resolve(__dirname, "../../contract/contract.wasm");
  const contract = await secretNetwork.initializeContract(contractPath);

  console.log(`Initialized contract with address: ${contract.address}`);
  console.log(`Initialized contract with hash: ${contract.hash}`);

  expect(contract).toBeDefined();
}, 100_000_000);
