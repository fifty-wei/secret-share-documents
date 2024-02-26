import { expect, test, beforeAll } from "@jest/globals";
import { SecretNetworkClient, Wallet } from "secretjs";
import SecretDocumentSmartContract from "../src/SmartContract/SecretDocumentSmartContract";
import SecretNetworkIntegration from "../src/SmartContract/SecretNetworkIntegration";
import ShareDocument from "../src/ShareDocument";
import Config from "../src/Config";
import Environment from "../src/Environment";
import path from "node:path";
import { initLocalSecretNetworkSmartContract, store } from "./utils";
import ViewDocument from "../src/ViewDocument";
import StoreDocument from "../src/StoreDocument";
import FakeStorage from "../src/StoreDocument/Storage/FakeStorage";
import PolygonToSecretSmartContract from "../src/SmartContract/PolygonToSecretSmartContract";
import ViemClient from "../src/SmartContract/ViemClient";

const config = new Config({
  env: Environment.TESTNET,
});
const walletOwner = new Wallet(process.env.SECRET_NETWORK_WALLET_MNEMONIC);
const walletViewer = new Wallet();

const secretNetworkClient = new SecretNetworkClient({
  url: config.getSecretNetwork().endpoint,
  chainId: config.getSecretNetwork().chainId,
  wallet: walletOwner,
  walletAddress: walletOwner.address,
});

const fileId =
  "24b4bd2bd6495f74dc1fbd7473292f8fd658d6fede78e6343e2aceb0fdc2b967";

async function init() {
  if (config.getEnv() === Environment.LOCAL) {
    const contract = await initLocalSecretNetworkSmartContract(config);
    config.useShareDocument(contract);
    config.useEvmWallet({
      mnemonic: process.env.POLYGON_WALLET_MNEMONIC,
    });
  }

  const secretDocument = new SecretDocumentSmartContract({
    chainId: config.getSecretNetwork().chainId,
    client: secretNetworkClient,
    contract: config.getShareDocument(),
    wallet: walletOwner,
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

  const shareDocument = new ShareDocument({
    secretDocument: secretDocument,
  });

  const viewDocument = new ViewDocument({
    secretDocument: secretDocument,
  });

  return {
    secretDocument,
    viewDocument,
    shareDocument,
    storeDocument,
  };
}

test("Get Share Encrypted Payload", async () => {
  const { viewDocument, secretDocument, storeDocument, shareDocument } =
    await init();

  await store({
    secretDocument: secretDocument,
    storeDocument: storeDocument,
    fileUrl: "https://school.truchot.co/ressources/brief-arolles-bis.pdf",
  });

  const fileIds = await viewDocument.all();
  expect(fileIds.length).toBeGreaterThan(0);

  const encryptedMessage = await shareDocument.getEncryptedMessage(fileIds[0], {
    addViewing: [walletViewer.address],
    deleteViewing: [],
  });

  expect(encryptedMessage).toBeDefined();
  expect(encryptedMessage).toHaveProperty("payload");
  expect(encryptedMessage).toHaveProperty("public_key");
}, 100_000);

test("Share Encrypted Payload", async () => {
  const { viewDocument, secretDocument, storeDocument, shareDocument } =
    await init();
  await store({
    secretDocument: secretDocument,
    storeDocument: storeDocument,
    fileUrl: "https://school.truchot.co/ressources/brief-arolles-bis.pdf",
  });

  const fileIds = await viewDocument.all();
  expect(fileIds.length).toBeGreaterThan(0);

  const encryptedMessage = await shareDocument.getEncryptedMessage(fileIds[0], {
    addViewing: [walletViewer.address],
    deleteViewing: [],
  });

  const payload = {
    source_chain: "test-chain",
    source_address: "test-address",
    payload: encryptedMessage,
  };

  const response = await secretDocument.share(payload);

  expect(response).toBeDefined();
  expect(response.code).toEqual(0);
}, 100_000);
