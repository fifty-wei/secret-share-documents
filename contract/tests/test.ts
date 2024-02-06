import { SecretNetworkClient } from "secretjs";

export async function runTestFunction(
  tester: (
    client: SecretNetworkClient,
    contractHash: string,
    contractAddress: string,
  ) => void,
  client: SecretNetworkClient,
  contractHash: string,
  contractAddress: string,
) {
  console.log(`Testing ${tester.name}`);
  await tester(client, contractHash, contractAddress);
  console.log(`[SUCCESS] ${tester.name}`);
}
