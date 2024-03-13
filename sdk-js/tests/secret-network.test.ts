import path from "node:path";
import { expect, test } from "@jest/globals";
import SecretNetworkIntegration from "../src/SmartContract/SecretNetworkIntegration";
import { SecretNetworkClient, Wallet } from "secretjs";

const config = globalThis.__SECRET_DOCUMENT_CONFIG__;

const wallet = new Wallet();
const secretNetwork = new SecretNetworkIntegration({
  endpoint: config.getSecretNetwork().endpoint,
  chainId: config.getSecretNetwork().chainId,
  faucetEndpoint: config.getSecretNetwork().faucetEndpoint,
  wallet: wallet,
});

test("Initialize a Secret Network client", async () => {
  expect(secretNetwork.getClient()).toBeDefined();
  expect(secretNetwork.getClient()).toBeInstanceOf(SecretNetworkClient);
}, 100_000);

test("Initialize a contract", async () => {
  await secretNetwork.fillUpFromFaucet(100_000_000);
  const contractPath = path.resolve(__dirname, "../../contract/contract.wasm");
  const contract = await secretNetwork.initializeContract(contractPath);

  expect(contract).toBeDefined();
}, 100_000);
