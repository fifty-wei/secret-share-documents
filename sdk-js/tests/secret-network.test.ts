import path from "node:path";
import { expect, test } from "@jest/globals";
import SecretNetworkIntergration from "../src/SmartContract/SecretNetworkIntegration";
import { SecretNetworkClient, Wallet } from "secretjs";

const wallet = new Wallet();
const secretNetwork = new SecretNetworkIntergration({
  endpoint: "http://localhost:1317",
  chainId: "secretdev-1",
  faucetEndpoint: 'http://localhost:5000',
  wallet: wallet,
});

test("Initialize a client", async () => {
  expect(secretNetwork.getClient()).toBeDefined();
  expect(secretNetwork.getClient()).toBeInstanceOf(SecretNetworkClient);
});

test("Initialize a contract", async () => {
  await secretNetwork.fillUpFromFaucet(100_000_000);
  const contractPath = path.resolve(__dirname, "../../contract/contract.wasm");
  const contract = await secretNetwork.initializeContract(contractPath);

  expect(contract).toBeDefined();
}, 1_000_000);
