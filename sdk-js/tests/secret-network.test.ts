import "dotenv/config";
import path from "node:path";
import { expect, test } from "@jest/globals";
import SecretNetworkIntergration from "../src/SmartContract/SecretNetworkIntegration";
import { SecretNetworkClient, Wallet } from "secretjs";
import { Environment, getConfig } from "../config";

test("Initialize a client", async () => {
  const config = await getConfig(Environment.LOCAL);
  const wallet = new Wallet();
  const secretNetwork = new SecretNetworkIntergration({
    endpoint: config.chains.secretNetwork.endpoint,
    chainId: config.chains.secretNetwork.chainId,
    faucetEndpoint: config.chains.secretNetwork.faucetEndpoint,
    wallet: wallet,
  });
  expect(secretNetwork.getClient()).toBeDefined();
  expect(secretNetwork.getClient()).toBeInstanceOf(SecretNetworkClient);
});

test("Initialize a contract", async () => {
  const config = await getConfig(Environment.LOCAL);
  const wallet = new Wallet();
  const secretNetwork = new SecretNetworkIntergration({
    endpoint: config.chains.secretNetwork.endpoint,
    chainId: config.chains.secretNetwork.chainId,
    faucetEndpoint: config.chains.secretNetwork.faucetEndpoint,
    wallet: wallet,
  });
  await secretNetwork.fillUpFromFaucet(100_000_000);
  const contractPath = path.resolve(__dirname, "../../contract/contract.wasm");
  const contract = await secretNetwork.initializeContract(contractPath);

  expect(contract).toBeDefined();
}, 1_000_000);
