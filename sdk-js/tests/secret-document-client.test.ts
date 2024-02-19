import { test, expect } from "@jest/globals";
import SecretDocumentClient from "../src";
import FakeStorage from "../src/StoreDocument/Storage/FakeStorage";
import StoreDocument from "../src/StoreDocument";
import Config from "../src/Config";
import Environment from "../src/Environment";

test("Get SDK with our configuration", async () => {
  const config = new Config({
    env: Environment.TESTNET,
  });
  config.useStorage(new FakeStorage());
  const client = new SecretDocumentClient(config);

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
