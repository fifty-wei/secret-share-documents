import { expect, test } from "@jest/globals";
import ShareDocumentSmartContract from "../src/SmartContract/ShareDocumentSmartContract";
import SecretNetworkIntegration from "../src/SmartContract/SecretNetworkIntegration";
import { Wallet } from "secretjs";
import StoreDocument from "../src/StoreDocument";
import FakeStorage from "../src/StoreDocument/Storage/FakeStorage";
import { getConfig } from "../config";
import PolygonToSecretSmartContrat from "../src/SmartContract/PolygonToSecretSmartContract";
import ViemClient from "../src/SmartContract/ViemClient";
import { getChain, getChainId } from "../config/chains";
import Environment from "../config/Environment";

test("Get Encrypted Payload from PDF", async () => {
  const config = await getConfig(Environment.TESTNET);

  const wallet = new Wallet(process.env.SECRET_NETWORK_WALLET_MNEMONIC);

  const secretNetwork = new SecretNetworkIntergration({
    endpoint: config.chains.secretNetwork.endpoint,
    chainId: config.chains.secretNetwork.chainId,
    faucetEndpoint: config.chains.secretNetwork.faucetEndpoint,
    wallet: wallet,
  });

  const shareDocument = new ShareDocumentSmartContract({
    client: secretNetwork.getClient(),
    contract: config.contracts.ShareDocument,
    wallet: wallet,
  });

  const storeDocument = new StoreDocument({
    storage: new FakeStorage(),
    shareDocument: shareDocument,
  });

  const encrytedMessage = await storeDocument.getEncryptedMessage(
    "https://school.truchot.co/ressources/brief-arolles-bis.pdf",
  );

  console.log("[INFO] Encrypted message:", { encrytedMessage });

  expect(encrytedMessage).toBeDefined();
  expect(encrytedMessage).toHaveProperty("payload");
  expect(encrytedMessage).toHaveProperty("public_key");
}, 1_000_000);

test("Store Encrypted Payload from PDF", async () => {
  const config = await getConfig(Environment.TESTNET);

  const wallet = new Wallet(process.env.SECRET_NETWORK_WALLET_MNEMONIC);

  const secretNetwork = new SecretNetworkIntegration({
    endpoint: config.chains.secretNetwork.endpoint,
    chainId: config.chains.secretNetwork.chainId,
    faucetEndpoint: config.chains.secretNetwork.faucetEndpoint,
    wallet: wallet,
  });

  const shareDocument = new ShareDocumentSmartContract({
    chainId: config.chains.secretNetwork.chainId,
    client: secretNetwork.getClient(),
    contract: config.contracts.ShareDocument,
    wallet: wallet,
  });

  const viemClient = new ViemClient({
    chain: getChain(getChainId(Environment.TESTNET)),
    walletConfig: {
      mnemonic: process.env.POLYGON_WALLET_MNEMONIC,
    },
    contract: config.contracts.PolygonToSecret,
  });

  const polygonToSecret = new PolygonToSecretSmartContrat({
    secretContract: config.contracts.ShareDocument,
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

  const { data } = await storeDocument.fetchDocument(fileUrl);
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
