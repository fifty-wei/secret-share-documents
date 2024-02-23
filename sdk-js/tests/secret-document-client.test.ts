import { test, expect } from "@jest/globals";
import SecretDocumentClient from "../src";
import FakeStorage from "../src/StoreDocument/Storage/FakeStorage";
import Config from "../src/Config";

const config = new Config();
config.useStorage(new FakeStorage());
const client = new SecretDocumentClient(config);

test("Store Document use case", async () => {
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
  const fileIds = await client.viewDocument().all();

  const fileContent = await client.viewDocument().get(fileIds[0]);

  expect(fileIds).toBeDefined();
  expect(fileIds.length).toBeGreaterThan(0);
  expect(fileContent).toBeDefined();
});
