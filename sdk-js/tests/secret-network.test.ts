import path from "node:path";
import { expect, test } from "@jest/globals";
import SecretNetworkIntegration from "../src/SmartContract/SecretNetworkIntegration";
import { SecretNetworkClient, Wallet } from "secretjs";
import { getConfig } from "../config";
import Environment from "../config/Environment";

test("Initialize a client", async () => {
  const config = await getConfig(Environment.LOCAL);
  console.log({ config });
  const wallet = new Wallet();
  const secretNetwork = new SecretNetworkIntegration({
    endpoint: config.chains.secretNetwork.endpoint,
    chainId: config.chains.secretNetwork.chainId,
    faucetEndpoint: config.chains.secretNetwork.faucetEndpoint,
    wallet: wallet,
  });
  expect(secretNetwork.getClient()).toBeDefined();
  expect(secretNetwork.getClient()).toBeInstanceOf(SecretNetworkClient);
}, 1_000_000);

test("Initialize a contract", async () => {
  const config = await getConfig(Environment.LOCAL);
  const wallet = new Wallet();
  const secretNetwork = new SecretNetworkIntegration({
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
