import ArweaveStorage from "../src/StoreDocument/ArweaveStorage";
import { test, expect } from "@jest/globals";

test("Arweave Storage exist", async () => {
  const storage = new ArweaveStorage();
  expect(storage).toBeDefined();
});

test("Upload an image from url", async () => {
  const storage = new ArweaveStorage();
  const data = await storage.uploadFile('https://school.truchot.co/ressources/sci-v2.jpg');
  console.log({ data });
  expect(data).toBeDefined();
});
