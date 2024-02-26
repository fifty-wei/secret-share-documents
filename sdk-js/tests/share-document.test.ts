import { expect, test } from "@jest/globals";
import { SecretNetworkClient, Wallet } from "secretjs";
import SecretDocumentSmartContract from "../src/SmartContract/SecretDocumentSmartContract";
import ShareDocument from "../src/ShareDocument";
import { store } from "./utils";
import ViewDocument from "../src/ViewDocument";
import StoreDocument from "../src/StoreDocument";
import FakeStorage from "../src/StoreDocument/Storage/FakeStorage";
import PolygonToSecretSmartContract from "../src/SmartContract/PolygonToSecretSmartContract";
import ViemClient from "../src/SmartContract/ViemClient";

function init() {
  const walletOwner = new Wallet(process.env.SECRET_NETWORK_WALLET_MNEMONIC);
  const walletViewer = new Wallet();

  const config = globalThis.__SECRET_DOCUMENT_CONFIG__;

  const secretNetworkClient = new SecretNetworkClient({
    url: config.getSecretNetwork().endpoint,
    chainId: config.getSecretNetwork().chainId,
    wallet: walletOwner,
    walletAddress: walletOwner.address,
  });

  config.useEvmWallet({
    mnemonic: process.env.POLYGON_WALLET_MNEMONIC,
  });

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
    polygonToSecret: polygonToSecret,
  });

  const viewDocument = new ViewDocument({
    secretDocument: secretDocument,
  });

  return {
    walletOwner,
    walletViewer,
    secretDocument,
    viewDocument,
    shareDocument,
    storeDocument,
  };
}

test("Get Share Encrypted Payload", async () => {
  const {
    viewDocument,
    secretDocument,
    storeDocument,
    shareDocument,
    walletViewer,
  } = init();

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
  const {
    viewDocument,
    secretDocument,
    storeDocument,
    shareDocument,
    walletViewer,
  } = init();
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
