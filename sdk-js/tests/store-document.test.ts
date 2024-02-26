import { expect, test } from "@jest/globals";
import SecretDocumentSmartContract from "../src/SmartContract/SecretDocumentSmartContract";
import { SecretNetworkClient, Wallet } from "secretjs";
import StoreDocument from "../src/StoreDocument";
import FakeStorage from "../src/StoreDocument/Storage/FakeStorage";
import PolygonToSecretSmartContract from "../src/SmartContract/PolygonToSecretSmartContract";
import ViemClient from "../src/SmartContract/ViemClient";
import { store } from "./utils";

const fileUrl = "https://school.truchot.co/ressources/brief-arolles-bis.pdf";

const uploadOptions = {
  contentType: "application/pdf",
};

const wallet = new Wallet(process.env.SECRET_NETWORK_WALLET_MNEMONIC);

const config = globalThis.__SECRET_DOCUMENT_CONFIG__;

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
}, 100_000);

test("Store PDF from URL", async () => {
  const response = await store({
    secretDocument: secretDocument,
    storeDocument: storeDocument,
    fileUrl: fileUrl,
  });

  expect(response).toBeDefined();
  expect(response.code).toEqual(0);
}, 100_000);
