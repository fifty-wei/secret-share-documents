import { expect, test } from "@jest/globals";
import SecretDocumentSmartContract from "../src/SmartContract/SecretDocumentSmartContract";
import { SecretNetworkClient, Wallet } from "secretjs";
import Config from "../src/Config";
import dotenv from "dotenv";
import Environment from "../src/Environment";
import ViewDocument from "../src/ViewDocument";

dotenv.config();

const config = new Config({
  env: Environment.TESTNET,
});

const wallet = new Wallet(process.env.SECRET_NETWORK_WALLET_MNEMONIC);

const secretNetworkClient = new SecretNetworkClient({
  url: config.getSecretNetwork().endpoint,
  chainId: config.getSecretNetwork().chainId,
  wallet: wallet,
  walletAddress: wallet.address,
});

const secretDocument = new SecretDocumentSmartContract({
  chainId: config.getSecretNetwork().chainId,
  client: secretNetworkClient,
  contract: config.getShareDocument(),
  wallet: wallet,
});

const viewDocument = new ViewDocument({
  secretDocument: secretDocument,
});

test("Get all files the user is allowed acces to", async () => {
  const data = await viewDocument.all();

  expect(data).toBeDefined();
  // expect(data).toHaveProperty("payload");
  // expect(data).toHaveProperty("public_key");
});

test("Find file content from fileId", async () => {
  const data = await viewDocument.get(
    "24b4bd2bd6495f74dc1fbd7473292f8fd658d6fede78e6343e2aceb0fdc2b967",
  );

  expect(data).toBeDefined();
  expect(data).toHaveProperty("url");
});
