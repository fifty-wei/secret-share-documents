import { test, expect } from "@jest/globals";
import Config from "../src/Config";
import path from "node:path";
import { Wallet } from "secretjs";
import SecretNetworkIntegration from "../src/SmartContract/SecretNetworkIntegration";

test("Store a wallet config", async () => {
  const config = new Config();
  config.useWallet({
    mnemonic: process.env.POLYGON_WALLET_MNEMONIC,
  });

  expect(config.getWallet()).toBeDefined();
  expect(config.getWallet()).toHaveProperty("mnemonic");
  expect(config.getWallet().mnemonic).toEqual(
    process.env.POLYGON_WALLET_MNEMONIC,
  );
});

test("Use specific Share Document Smart Contract", async () => {
  const config = new Config();
  const wallet = new Wallet(process.env.SECRET_NETWORK_WALLET_MNEMONIC);
  const secretNetwork = new SecretNetworkIntegration({
    endpoint: config.getSecretNetwork().endpoint,
    chainId: config.getSecretNetwork().chainId,
    faucetEndpoint: config.getSecretNetwork().faucetEndpoint,
    wallet: wallet,
  });
  await secretNetwork.fillUpFromFaucet(100_000_000);
  const contractPath = path.resolve(__dirname, "../../contract/contract.wasm");
  const contract = await secretNetwork.initializeContract(contractPath);

  config.useShareDocument(contract);

  expect(config.getShareDocument()).toEqual(contract);
}, 100_000);
