import { expect, test } from "@jest/globals";
import ShareDocumentSmartContract from "../src/SmartContract/ShareDocumentSmartContract";
import SecretNetworkIntergration from "../src/SmartContract/SecretNetworkIntegration";
import { Wallet } from "secretjs";
import StoreDocument from "../src/StoreDocument";
import FakeStorage from "../src/StoreDocument/Storage/FakeStorage";
import { Environment, getConfig } from "../config";

test("Get Encrypted Payload from PDF", async () => {
  const config = await getConfig(Environment.LOCAL);

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

  // IEncryptedMessage {
  //   payload: Uint8Array;
  //   public_key: Uint8Array;
  // }

  const payload = {
    source_chain: "test-chain",
    source_address: "test-address",
    payload: encrytedMessage,
  };

  const response = await shareDocument.store(payload);

  console.log("[INFO] Store document on Secret Network:", { response });

  console.log(response.tx.body);

  expect(response).toBeDefined();
  expect(response.code).toEqual(0);
}, 1_000_000);
