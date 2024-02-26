import { expect, test } from "@jest/globals";
import SecretDocumentSmartContract from "../src/SmartContract/SecretDocumentSmartContract";
import { SecretNetworkClient, Wallet } from "secretjs";
import StoreDocument from "../src/StoreDocument";
import FakeStorage from "../src/StoreDocument/Storage/FakeStorage";
import PolygonToSecretSmartContract from "../src/SmartContract/PolygonToSecretSmartContract";
import ViemClient from "../src/SmartContract/ViemClient";
import Config from "../src/Config";
import dotenv from "dotenv";
import { initLocalSecretNetworkSmartContract, store } from "./utils";
import Environment from "../src/Environment";

dotenv.config();

const fileUrl = "https://school.truchot.co/ressources/brief-arolles-bis.pdf";

const uploadOptions = {
  contentType: "application/pdf",
};

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
  };
}

test("Get Encrypted Payload from PDF", async () => {
  const { storeDocument } = await init();
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
}, 100_000);

test("Store PDF from URL", async () => {
  const { storeDocument, secretDocument } = await init();

  const response = await store({
    secretDocument: secretDocument,
    storeDocument: storeDocument,
    fileUrl: fileUrl,
  });

  expect(response).toBeDefined();
  expect(response.code).toEqual(0);
}, 100_000);
