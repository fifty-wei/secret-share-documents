import { expect, test, beforeAll } from "@jest/globals";
import { SecretNetworkClient, Wallet } from "secretjs";
import SecretDocumentSmartContract from "../src/SmartContract/SecretDocumentSmartContract";
import SecretNetworkIntegration from "../src/SmartContract/SecretNetworkIntegration";
import ShareDocument from "../src/ShareDocument";
import Config from "../src/Config";
import Environment from "../src/Environment";
import path from "node:path";
import initLocalSecretNetworkSmartContract from "./init-local-secret-document";
import ViewDocument from "../src/ViewDocument";

const config = new Config();
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
  }

  const secretDocument = new SecretDocumentSmartContract({
    chainId: config.getSecretNetwork().chainId,
    client: secretNetworkClient,
    contract: config.getShareDocument(),
    wallet: walletOwner,
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
  };
}

test("Get Share Encrypted Payload", async () => {
  const { viewDocument, shareDocument } = await init();
  const filesId = await viewDocument.all();
  const encryptedMessage = await shareDocument.getEncryptedMessage(filesId[0], {
    addViewing: [walletViewer.address],
    deleteViewing: [],
  });

  expect(encryptedMessage).toBeDefined();
  expect(encryptedMessage).toHaveProperty("payload");
  expect(encryptedMessage).toHaveProperty("public_key");
}, 100_000);

test("Share Encrypted Payload", async () => {
  const { viewDocument, secretDocument, shareDocument } = await init();
  const filesId = await viewDocument.all();
  const encryptedMessage = await shareDocument.getEncryptedMessage(filesId[0], {
    addViewing: [walletViewer.address],
    deleteViewing: [],
  });

  const payload = {
    source_chain: "test-chain",
    source_address: "test-address",
    payload: encryptedMessage,
  };

  const response = await secretDocument.share(payload);

  console.log({ response });

  expect(response).toBeDefined();
  expect(response.code).toEqual(0);
}, 100_000);
