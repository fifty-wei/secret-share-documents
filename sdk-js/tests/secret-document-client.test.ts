import { test, expect } from "@jest/globals";
import SecretDocumentClient from "../src";
import FakeStorage from "../src/StoreDocument/Storage/FakeStorage";
import Environment from "../src/Environment";

function init() {
  const config = globalThis.__SECRET_DOCUMENT_CONFIG__;
  config.useStorage(new FakeStorage());
  const client = new SecretDocumentClient(config);

  return {
    client,
  };
}

test("Store Document use case", async () => {
  const { client } = init();

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

test("View Document use case", async () => {
  const { client } = init();

  const fileIds = await client.viewDocument().all();

  const fileContent = await client.viewDocument().get(fileIds[0]);

  expect(fileIds).toBeDefined();
  expect(fileIds.length).toBeGreaterThan(0);
  expect(fileContent).toBeDefined();
});
