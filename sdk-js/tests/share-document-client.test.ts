import { test, expect } from "@jest/globals";
import { getConfig } from "../config";
import ShareDocumentClient from "../src";
import FakeStorage from "../src/StoreDocument/Storage/FakeStorage";
import StoreDocument from "../src/StoreDocument";

test("Get SDK with our configuration", async () => {
  const config = await getConfig();
  const client = new ShareDocumentClient({
    storage: new FakeStorage(),
    config: {
      ...config,
      evmWalletConfig: {
        mnemonic: process.env.POLYGON_WALLET_MNEMONIC,
      },
    },
  });

  const responseUrl = await client
    .storeDocument()
    .fromUrl("https://school.truchot.co/ressources/brief-arolles-bis.pdf");

  const responseFile = await client
    .storeDocument()
    .fromFile(
      new File([""], "brief-arolles-bis.pdf", { type: "application/pdf" }),
    );

  expect(responseUrl).toBeDefined();
  expect(responseFile).toBeDefined();
});
