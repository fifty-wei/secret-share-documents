import { expect, test } from "@jest/globals";
import SecretDocumentSmartContract from "../src/SmartContract/SecretDocumentSmartContract";
import { SecretNetworkClient, Wallet } from "secretjs";
import Config from "../src/Config";
import dotenv from "dotenv";
import Environment from "../src/Environment";

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

test("Get ShareDocument public key", async () => {
  const shareDocument = new SecretDocumentSmartContract({
    chainId: config.getSecretNetwork().chainId,
    client: secretNetworkClient,
    contract: config.getShareDocument(),
    wallet: wallet,
  });

  const publicKey = await shareDocument.getPublicKey();

  expect(publicKey).toBeDefined();
}, 1_000_000);

test("Get ShareDocument permit", async () => {
  const shareDocument = new SecretDocumentSmartContract({
    chainId: config.getSecretNetwork().chainId,
    client: secretNetworkClient,
    contract: config.getShareDocument(),
    wallet: wallet,
  });

  const permit = await shareDocument.generatePermit();

  expect(permit).toBeDefined();
  expect(permit).toHaveProperty("signature");
  expect(permit).toHaveProperty("params");
}, 1_000_000);
