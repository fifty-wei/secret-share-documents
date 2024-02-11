import { expect, test } from "@jest/globals";
import ShareDocumentSmartContract from "../src/SmartContract/ShareDocumentSmartContract";
import SecretNetworkIntegration from "../src/SmartContract/SecretNetworkIntegration";
import { Wallet } from "secretjs";
import { getConfig } from "../config";

test("Get public key", async () => {
  const config = await getConfig();

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

  const publicKey = await shareDocument.getPublicKey();
  console.log("[INFO] Get publicKey:", { publicKey });

  expect(publicKey).toBeDefined();
}, 1_000_000);

test("Get permit", async () => {
  const config = await getConfig();

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

  const permit = await shareDocument.generatePermit();

  console.log("[INFO] Get permit:", { permit });

  expect(permit).toBeDefined();
}, 1_000_000);
