import dotenv from "dotenv";
import SecretDocumentConfig from "../src/Config";
import Environment from "../src/Environment";
import { Wallet } from "secretjs";
import SecretNetworkIntegration from "../src/SmartContract/SecretNetworkIntegration";
import path from "node:path";
import type { Config } from "@jest/types";

dotenv.config();

async function initLocalSecretNetworkSmartContract(
  config: SecretDocumentConfig,
) {
  const secretNetwork = new SecretNetworkIntegration({
    wallet: new Wallet(process.env.SECRET_NETWORK_WALLET_MNEMONIC),
    chainId: config.getSecretNetwork().chainId,
    endpoint: config.getSecretNetwork().endpoint,
    faucetEndpoint: config.getSecretNetwork().faucetEndpoint,
  });
  await secretNetwork.fillUpFromFaucet(100_000);
  const contractPath = path.resolve(__dirname, "../contract/contract.wasm");
  return secretNetwork.initializeContract(contractPath);
}

global.__SECRET_DOCUMENT_CONFIG__;

export default async function (
  globalConfig: Config.GlobalConfig,
  projectConfig: Config.ProjectConfig,
) {
  console.log("");
  const config = new SecretDocumentConfig({
    env: process.env.ENVIRONMENT as Environment
  });

  if (config.getEnv() === Environment.LOCAL) {
    console.log("Deploy Secret Network smart contract in local...");
    const contract = await initLocalSecretNetworkSmartContract(config);
    config.useShareDocument(contract);
  }

  globalThis.__SECRET_DOCUMENT_CONFIG__ = config;
  global.__SECRET_DOCUMENT_CONFIG__ = config;
}
