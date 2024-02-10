import { SecretNetworkClient, Wallet } from "secretjs";
import assert from "assert";
import path from "path";

// https://docs.rs/getrandom/latest/getrandom/#webassembly-support
import { runTestFunction } from "./test";
import SecretNetworkIntergration from "../../sdk-js/src/SmartContract/SecretNetworkIntegration";
import ShareDocumentSmartContract from "../../sdk-js/src/SmartContract/ShareDocumentSmartContract";
import FakeStorage from "../../sdk-js/src/StoreDocument/Storage/FakeStorage";
import StoreDocument from "../../sdk-js/src/StoreDocument";

// TODO
// More info: https://docs.scrt.network/secret-network-documentation/development/tools-and-libraries/local-secret

async function queryCount(
  client: SecretNetworkClient,
  contractHash: string,
  contractAddress: string,
): Promise<number> {
  type CountResponse = { count: number };

  const countResponse = (await client.query.compute.queryContract({
    contract_address: contractAddress,
    code_hash: contractHash,
    query: { get_count: {} },
  })) as CountResponse;

  if ('err"' in countResponse) {
    throw new Error(
      `Query failed with the following err: ${JSON.stringify(countResponse)}`,
    );
  }

  return countResponse.count;
}

async function incrementTx(
  client: SecretNetworkClient,
  contractHash: string,
  contractAddess: string,
) {
  const tx = await client.tx.compute.executeContract(
    {
      sender: client.address,
      contract_address: contractAddess,
      code_hash: contractHash,
      msg: {
        increment: {},
      },
      sent_funds: [],
    },
    {
      gasLimit: 200000,
    },
  );

  //let parsedTransactionData = JSON.parse(fromUtf8(tx.data[0])); // In our case we don't really need to access transaction data
  console.log(`Increment TX used ${tx.gasUsed} gas`);
}

async function resetTx(
  client: SecretNetworkClient,
  contractHash: string,
  contractAddess: string,
) {
  const tx = await client.tx.compute.executeContract(
    {
      sender: client.address,
      contract_address: contractAddess,
      code_hash: contractHash,
      msg: {
        reser: { count: 0 },
      },
      sent_funds: [],
    },
    {
      gasLimit: 200000,
    },
  );

  console.log(`Reset TX used ${tx.gasUsed} gas`);
}

// The following functions are only some examples of how to write integration tests, there are many tests that we might want to write here.
async function test_count_on_intialization(
  client: SecretNetworkClient,
  contractHash: string,
  contractAddress: string,
) {
  const onInitializationCounter: number = await queryCount(
    client,
    contractHash,
    contractAddress,
  );
  assert(
    onInitializationCounter === 0,
    `The counter on initialization expected to be 0 instead of ${onInitializationCounter}`,
  );
}

async function test_increment_stress(
  client: SecretNetworkClient,
  contractHash: string,
  contractAddress: string,
) {
  const onStartCounter: number = await queryCount(
    client,
    contractHash,
    contractAddress,
  );

  let stressLoad: number = 10;
  for (let i = 0; i < stressLoad; ++i) {
    await incrementTx(client, contractHash, contractAddress);
  }

  const afterStressCounter: number = await queryCount(
    client,
    contractHash,
    contractAddress,
  );
  assert(
    afterStressCounter - onStartCounter === stressLoad,
    `After running stress test the counter expected to be ${onStartCounter + 10} instead of ${afterStressCounter}`,
  );
}

async function test_gas_limits() {
  // There is no accurate way to measue gas limits but it is actually very recommended to make sure that the gas that is used by a specific tx makes sense
}

(async () => {
  const fileToStore =
    "https://school.truchot.co/ressources/brief-arolles-bis.pdf";
  const wallet = new Wallet();

  const secretNetwork = new SecretNetworkIntergration({
    wallet: wallet,
    endpoint: "http://localhost:1317",
    chainId: "secretdev-1",
    faucetEndpoint: "http://localhost:5000",
  });

  console.log(
    `[INFO] Initialized client with wallet address: ${secretNetwork.getClient().address}`,
  );

  await secretNetwork.fillUpFromFaucet(100_000_000);

  const contractPath = path.resolve(__dirname, "../contract.wasm");
  const contract = await secretNetwork.initializeContract(contractPath);

  console.log("[INFO] Initialized contract with:");
  console.log({ contract });

  // const jwk = await arweave.wallets.generate();
  // const storage = new ArweaveStorage({
  //   key: jwk,
  //   host: 'arweave.net',
  //   port: 443,
  //   protocol: 'https'
  // });

  const storage = new FakeStorage();

  const shareDocument = new ShareDocumentSmartContract({
    client: secretNetwork.getClient(),
    contract: contract,
    wallet: wallet,
  });

  const storeDocument = new StoreDocument({
    shareDocument: shareDocument,
    storage: storage,
  });

  const url = await storeDocument.store(fileToStore);

  console.log("[INFO] Get storage URL:");
  console.log({ url });

  // const shareDocumentPublickKey = await shareDocument.getPublicKey();
  const shareDocumentPermit = await shareDocument.generatePermit();

  console.log("[INFO] Get permit from Smart contract:");
  console.log({ shareDocumentPermit });

  // const localPublicKey = SymmetricKey.generate();

  // console.log('[INFO] Get local symmetric key:');
  // console.log({ localPublicKey });

  // const res = await fetch(fileToStore);

  // console.log('[INFO] We have fetched the file to store');

  // const data = await res.arrayBuffer();
  // const bufferData = Buffer.from(data);
  // const encryptedData = SymmetricKey.encrypt(bufferData, localPublicKey);

  // console.log('[INFO] We have encrypted the data');

  await runTestFunction(
    test_gas_limits,
    secretNetwork.getClient(),
    contract.hash,
    contract.address,
  );
})();
