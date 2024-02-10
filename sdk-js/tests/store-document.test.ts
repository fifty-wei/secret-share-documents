import path from "node:path";
import { expect, test } from "@jest/globals";
import ShareDocumentSmartContract from "../src/SmartContract/ShareDocumentSmartContract";
import SecretNetworkIntergration from "../src/SmartContract/SecretNetworkIntegration";
import { Wallet } from "secretjs";
import StoreDocument from "../src/StoreDocument";
import FakeStorage from "../src/StoreDocument/Storage/FakeStorage";

const wallet = new Wallet();
const secretNetwork = new SecretNetworkIntergration({
  endpoint: "http://localhost:1317",
  chainId: "secretdev-1",
  faucetEndpoint: "http://localhost:5000",
  wallet: wallet,
});

test("Get Encrypted Payload from PDF", async () => {
  await secretNetwork.fillUpFromFaucet(100_000_000);
  const contractPath = path.resolve(__dirname, "../../contract/contract.wasm");
  const contract = await secretNetwork.initializeContract(contractPath);

  const shareDocument = new ShareDocumentSmartContract({
    client: secretNetwork.getClient(),
    contract: contract,
    wallet: wallet,
  });

  const storeDocument = new StoreDocument({
    storage: new FakeStorage(),
    shareDocument: shareDocument,
  });

  const encrytedMessage = await storeDocument.store(
    "https://school.truchot.co/ressources/brief-arolles-bis.pdf",
  );

  expect(encrytedMessage).toBeDefined();
  expect(encrytedMessage).toHaveProperty("payload");
  expect(encrytedMessage).toHaveProperty("publicKey");
}, 1_000_000);
