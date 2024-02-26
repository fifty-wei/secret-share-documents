import { expect, test } from "@jest/globals";
import SecretDocumentSmartContract from "../src/SmartContract/SecretDocumentSmartContract";
import { SecretNetworkClient, Wallet } from "secretjs";
import Config from "../src/Config";
import dotenv from "dotenv";
import ViewDocument from "../src/ViewDocument";
import initLocalSecretNetworkSmartContract from "./init-local-secret-document";
import Environment from "../src/Environment";
import ViemClient from "../src/SmartContract/ViemClient";
import StoreDocument from "../src/StoreDocument";
import PolygonToSecretSmartContract from "../src/SmartContract/PolygonToSecretSmartContract";
import FakeStorage from "../src/StoreDocument/Storage/FakeStorage";

dotenv.config();

const config = new Config();
const wallet = new Wallet(process.env.SECRET_NETWORK_WALLET_MNEMONIC);

async function init() {
  if (config.getEnv() === Environment.LOCAL) {
    const contract = await initLocalSecretNetworkSmartContract(config);
    config.useShareDocument(contract);
  }

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

  return {
    storeDocument,
    secretDocument,
    viewDocument,
  };
}

async function store({ secretDocument, storeDocument, fileUrl }) {
  let uploadOptions = {
    contentType: "application/pdf",
  };
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

  return await secretDocument.store(payload);
}

test("Get all files the user is allowed acces to", async () => {
  const { viewDocument, secretDocument, storeDocument } = await init();

  const document = await store({
    secretDocument: secretDocument,
    storeDocument: storeDocument,
    fileUrl: "https://school.truchot.co/ressources/brief-arolles-bis.pdf",
  });
  const data = await viewDocument.all();

  expect(data).toBeDefined();
  expect(data).toHaveLength(1);
}, 100_000);

test("Find file content from fileId", async () => {
  const { viewDocument, secretDocument, storeDocument } = await init();

  const document = await store({
    secretDocument: secretDocument,
    storeDocument: storeDocument,
    fileUrl: "https://school.truchot.co/ressources/brief-arolles-bis.pdf",
  });

  const allData = await viewDocument.all();
  const data = await viewDocument.get(allData[0]);

  expect(data).toBeDefined();
  expect(data).toHaveProperty("url");
}, 100_000);
