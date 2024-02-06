import { expect, test } from "@jest/globals";
import path from "node:path";
import SecretNetworkIntegration from "../src/SmartContract/SecretNetworkIntegration";
import { SecretNetworkClient } from "secretjs";

test("Initialize a client", async () => {
  const client = SecretNetworkIntegration.initializeClient({
    endpoint: "http://localhost:1317",
    chainId: "secretdev-1",
  });

  expect(client).toBeDefined();
  expect(client).toBeInstanceOf(SecretNetworkClient);
});

test("Initialize a contract", async () => {
  const client = SecretNetworkIntegration.initializeClient({
    endpoint: "http://localhost:1317",
    chainId: "secretdev-1",
  });

  console.log(`Initialized client with wallet address: ${client.address}`);

  SecretNetworkIntegration.fillUpFromFaucet(client, 100_000_000);

  const contract = await SecretNetworkIntegration.initializeContract({
    client: client,
    contractPath: path.resolve("../contract/contract.wasm"),
  });

  console.log(`Initialized contract with: ${contract}`);

  expect(contract).toBeDefined();
});
