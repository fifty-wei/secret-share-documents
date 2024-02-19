import { test, expect } from "@jest/globals";
import Config from "../src/Config";
import path from "node:path";
import { Wallet } from "secretjs";
import SecretNetworkIntegration from "../src/SmartContract/SecretNetworkIntegration";
import Environment from "../src/Environment";
import { polygonMumbai } from "viem/chains";
import { createWalletClient, http } from "viem";
import { mnemonicToAccount } from "viem/accounts";
import dotenv from "dotenv";

dotenv.config();

test("Configure an environment", async () => {
  const config = new Config({
    env: Environment.LOCAL,
  });

  expect(config.getEnv()).toEqual("local");
});

test("Configure an EVM wallet config with mnemonic", async () => {
  const config = new Config();
  config.useEvmWallet({
    mnemonic: "123",
  });

  expect(config.getEvmWallet()).toBeDefined();
  expect(config.getEvmWallet()).toHaveProperty("mnemonic");
  expect(config.getEvmWallet().mnemonic).toEqual("123");
});

test("Configure an EVM wallet config with client", async () => {
  const config = new Config();

  config.useEvmWallet({
    client: createWalletClient({
      account: mnemonicToAccount(process.env.POLYGON_WALLET_MNEMONIC as string),
      chain: polygonMumbai,
      transport: http(),
    }),
  });

  expect(config.getEvmWallet()).toBeDefined();
  expect(config.getEvmWallet()).toHaveProperty("client");
  expect(config.getEvmWallet().client).toBeDefined();
});

test("Configure an Secret Network wallet config", async () => {
  const config = new Config();

  config.useSecretWallet({
    mnemonic: "123",
  });

  expect(config.getSecretNetworkWallet()).toBeDefined();
  expect(config.getSecretNetworkWallet()).toHaveProperty("mnemonic");
  expect(config.getSecretNetworkWallet().mnemonic).toEqual("123");
});

test("Configure specific Share Document Smart Contract", async () => {
  const config = new Config();
  const wallet = new Wallet(process.env.SECRET_NETWORK_WALLET_MNEMONIC);

  const secretNetwork = new SecretNetworkIntegration({
    endpoint: "http://localhost:1317",
    chainId: "secretdev-1",
    faucetEndpoint: "http://localhost:5000",
    wallet: wallet,
  });

  await secretNetwork.fillUpFromFaucet(100_000_000);
  const contractPath = path.resolve(__dirname, "../../contract/contract.wasm");
  const contract = await secretNetwork.initializeContract(contractPath);

  config.useShareDocument(contract);

  expect(config.getShareDocument()).toEqual(contract);
}, 100_000);
