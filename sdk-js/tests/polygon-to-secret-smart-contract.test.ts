import { jest, expect, test } from "@jest/globals";
import PolygonToSecretSmartContrat from "../src/SmartContract/PolygonToSecretSmartContract";
import ViemClient from "../src/SmartContract/ViemClient";
import Config from "../src/Config";
import dotenv from "dotenv";
import Environment from "../src/Environment";

dotenv.config();

// Mock IEncryptedMessage
const encryptedMessageMock = jest.mock(
  "../src/StoreDocument/IEncryptedMessage",
  () => ({
    payload: [1, 2, 3], // Mock payload array
    public_key: [4, 5, 6], // Mock public_key array
  }),
);

test("Send message from Polygon to Secret Network", async () => {
  const config = new Config({
    env: Environment.TESTNET,
  });

  const viemClient = new ViemClient({
    chain: config.getChain(config.getChainId()),
    walletConfig: config.getEvmWallet(),
    contract: config.getPolygonToSecret(),
  });

  const polygonToSecret = new PolygonToSecretSmartContrat({
    secretContract: config.getShareDocument(),
    viemClient: viemClient,
  });

  const payload = {
    source_chain: "test-chain",
    source_address: "test-address",
    payload: encryptedMessageMock,
  };

  const response = await polygonToSecret.send(payload);

  console.log("[INFO] Send Polygon to Secret Network:", { response });

  expect(response).toBeDefined();
});
