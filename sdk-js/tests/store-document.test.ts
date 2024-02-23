import { expect, test } from "@jest/globals";
import SecretDocumentSmartContract from "../src/SmartContract/SecretDocumentSmartContract";
import { SecretNetworkClient, Wallet } from "secretjs";
import StoreDocument from "../src/StoreDocument";
import FakeStorage from "../src/StoreDocument/Storage/FakeStorage";
import PolygonToSecretSmartContract from "../src/SmartContract/PolygonToSecretSmartContract";
import ViemClient from "../src/SmartContract/ViemClient";
import Config from "../src/Config";
import dotenv from "dotenv";
import Environment from "../src/Environment";

dotenv.config();

const config = new Config({
  env: Environment.TESTNET,
});

config.useEvmWallet({
  mnemonic: process.env.POLYGON_WALLET_MNEMONIC,
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

const viemClient = new ViemClient({
  chain: config.getChain(config.getChainId()),
  walletConfig: config.getEvmWallet(),
  contract: config.getPolygonToSecret(),
});

const polygonToSecret = new PolygonToSecretSmartContract({
  secretContract: config.getShareDocument(),
  viemClient: viemClient,
});

const storeDocument = new StoreDocument({
  storage: new FakeStorage(),
  secretDocument: secretDocument,
  polygonToSecret: polygonToSecret,
});

const fileUrl = "https://school.truchot.co/ressources/brief-arolles-bis.pdf";

const uploadOptions = {
  contentType: "application/pdf",
};

test("Get Encrypted Payload from PDF", async () => {
  const { data, contentType } = await storeDocument.fetchDocument(fileUrl);
  uploadOptions.contentType = contentType;
  const bufferData = Buffer.from(data);

  const encryptedMessage = await storeDocument.getEncryptedMessage(
    bufferData,
    uploadOptions,
  );

  expect(encryptedMessage).toBeDefined();
  expect(encryptedMessage).toHaveProperty("payload");
  expect(encryptedMessage).toHaveProperty("public_key");
}, 1_000_000);

test("Store Encrypted Payload from PDF", async () => {
  const { data, contentType } = await storeDocument.fetchDocument(fileUrl);
  uploadOptions.contentType = contentType;
  const bufferData = Buffer.from(data);

  const encryptedMessage = await storeDocument.getEncryptedMessage(
    bufferData,
    uploadOptions,
  );

  const payload = {
    source_chain: "test-chain",
    source_address: "test-address",
    payload: encryptedMessage,
  };

  const response = await secretDocument.store(payload);

  expect(response).toBeDefined();
  expect(response.code).toEqual(0);
}, 1_000_000);
