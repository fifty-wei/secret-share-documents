import { expect, test } from "@jest/globals";
import SecretDocumentSmartContract from "../src/SmartContract/SecretDocumentSmartContract";
import { SecretNetworkClient, Wallet } from "secretjs";

function init() {
  const config = globalThis.__SECRET_DOCUMENT_CONFIG__;

  const wallet = new Wallet(process.env.SECRET_NETWORK_WALLET_MNEMONIC);
  const secretNetworkClient = new SecretNetworkClient({
    url: config.getSecretNetwork().endpoint,
    chainId: config.getSecretNetwork().chainId,
    wallet: wallet,
    walletAddress: wallet.address,
  });

  const shareDocument = new SecretDocumentSmartContract({
    chainId: config.getSecretNetwork().chainId,
    client: secretNetworkClient,
    contract: config.getShareDocument(),
    wallet: wallet,
  });

  return {
    shareDocument,
  };
}

test("Get ShareDocument public key", async () => {
  const { shareDocument } = init();

  const publicKey = await shareDocument.getPublicKey();

  expect(publicKey).toBeDefined();
}, 100_000);

test("Get ShareDocument permit", async () => {
  const { shareDocument } = init();

  const permit = await shareDocument.generatePermit();

  expect(permit).toBeDefined();
  expect(permit).toHaveProperty("signature");
  expect(permit).toHaveProperty("params");
}, 100_000);
