import { jest, expect, test } from "@jest/globals";
import PolygonToSecretSmartContrat from "../src/SmartContract/PolygonToSecretSmartContract";
import ViemClient from "../src/SmartContract/ViemClient";

// Mock ISymmetricEncryptedData
const encryptedMessageMock = jest.mock(
  "../src/Encryption/ISymmetricEncryptedData",
  () => ({
    payload: [1, 2, 3], // Mock payload array
    public_key: [4, 5, 6], // Mock public_key array
  }),
);

test("Send message from Polygon to Secret Network", async () => {
  const config = globalThis.__SECRET_DOCUMENT_CONFIG__;

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
