import "dotenv/config";
import path from "node:path";
import { expect, test } from "@jest/globals";
import SecretNetworkIntergration from "../src/SmartContract/SecretNetworkIntegration";
import { SecretNetworkClient, Wallet } from "secretjs";

const wallet = new Wallet();
const secretNetwork = new SecretNetworkIntergration({
  endpoint: process.env.SECRET_NETWORK_ENDPOINT as string,
  chainId: process.env.SECRET_NETWORK_CHAIN_ID as string,
  faucetEndpoint: process.env.SECRET_NETWORK_FAUCET_ENDPOINT as string,
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
