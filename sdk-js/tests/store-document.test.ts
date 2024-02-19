import { expect, test } from "@jest/globals";
import ShareDocumentSmartContract from "../src/SmartContract/ShareDocumentSmartContract";
import { SecretNetworkClient, Wallet } from "secretjs";
import StoreDocument from "../src/StoreDocument";
import FakeStorage from "../src/StoreDocument/Storage/FakeStorage";
import PolygonToSecretSmartContrat from "../src/SmartContract/PolygonToSecretSmartContract";
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

const shareDocument = new ShareDocumentSmartContract({
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

const polygonToSecret = new PolygonToSecretSmartContrat({
  secretContract: config.getShareDocument(),
  viemClient: viemClient,
});

const storeDocument = new StoreDocument({
  storage: new FakeStorage(),
  shareDocument: shareDocument,
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

  console.log("[INFO] Encrypted message:", { encryptedMessage });

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

  const response = await shareDocument.store(payload);

  console.log("[INFO] Store document on Secret Network:", { response });

  expect(response).toBeDefined();
  expect(response.code).toEqual(0);
}, 1_000_000);
