import path from "node:path";
import { expect, test } from "@jest/globals";
import { Wallet } from "secretjs";
import PolygonToSecretSmartContrat from "../src/SmartContract/PolygonToSecretSmartContract";
import SecretNetworkIntegration from "../src/SmartContract/SecretNetworkIntegration";
import ShareDocumentSmartContract from "../src/SmartContract/ShareDocumentSmartContract";
import StoreDocument from "../src/StoreDocument";
import FakeStorage from "../src/StoreDocument/Storage/FakeStorage";
import { getConfig } from "../config";

test("Send message from Polygon to Secret Network", async () => {
  const config = await getConfig();
  const wallet = new Wallet(process.env.SECRET_NETWORK_WALLET_MNEMONIC);
  const secretNetwork = new SecretNetworkIntegration({
    endpoint: config.chains.secretNetwork.endpoint,
    chainId: config.chains.secretNetwork.chainId,
    faucetEndpoint: config.chains.secretNetwork.faucetEndpoint,
    wallet: wallet,
  });

  const polygonToSecret = new PolygonToSecretSmartContrat({
    secretContract: config.contracts.ShareDocument,
    polygonContract: config.contracts.PolygonToSecret,
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

  const payload = {
    source_chain: "test-chain",
    source_address: "test-address",
    payload: encrytedMessage,
  };

  const response = await polygonToSecret.send(payload);

  console.log("[INFO] Send Polygon to Secret Network:", { response });

  expect(response).toBeDefined();
});
