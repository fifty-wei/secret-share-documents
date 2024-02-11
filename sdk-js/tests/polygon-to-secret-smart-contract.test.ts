import { jest, expect, test } from "@jest/globals";
import PolygonToSecretSmartContrat from "../src/SmartContract/PolygonToSecretSmartContract";
import { getConfig } from "../config";
import ViemClient from "../src/SmartContract/ViemClient";
import { getChain, getChainId } from "../config/chains";

// Mock IEncryptedMessage
const encryptedMessageMock = jest.mock(
  "../src/StoreDocument/IEncryptedMessage",
  () => ({
    payload: [1, 2, 3], // Mock payload array
    public_key: [4, 5, 6], // Mock public_key array
  }),
);

test("Send message from Polygon to Secret Network", async () => {
  const config = await getConfig();

  const viemClient = new ViemClient({
    chain: getChain(getChainId()),
    walletConfig: {
      mnemonic: process.env.POLYGON_WALLET_MNEMONIC,
    },
    contract: config.contracts.PolygonToSecret,
  });

  const polygonToSecret = new PolygonToSecretSmartContrat({
    secretContract: config.contracts.ShareDocument,
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
