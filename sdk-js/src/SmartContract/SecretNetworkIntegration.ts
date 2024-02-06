import { Wallet, SecretNetworkClient } from "secretjs";
import fs from "fs";

interface ClientProps {
  endpoint: string;
  chainId: string;
}

function initializeClient({ endpoint, chainId }: ClientProps) {
  // Use default constructor of wallet to generate random mnemonic.
  const wallet = new Wallet();

  // To create a signer secret.js client, also pass in a wallet
  return new SecretNetworkClient({
    url: endpoint,
    chainId: chainId,
    wallet: wallet,
    walletAddress: wallet.address,
  });
}

async function getScrtBalance(client: SecretNetworkClient): Promise<string> {
  const response = await client.query.bank.balance({
    address: client.address,
    denom: "uscrt",
  });

  return response.balance!.amount!;
}

async function getFromFaucet(address: string) {
  return fetch(`http://localhost:5000/faucet?address=${address}`);
}

async function fillUpFromFaucet(
  client: SecretNetworkClient,
  targetBalance: number,
) {
  let balance = await getScrtBalance(client);
  while (Number(balance) < targetBalance) {
    try {
      await getFromFaucet(client.address);
    } catch (e) {
      console.error(`[ERROR] — Failed to get tokens from faucet: ${e}`);
    }
    balance = await getScrtBalance(client);
  }
}

interface ContractProps {
  client: SecretNetworkClient;
  contractPath: string;
}

interface Contract {
  hash: string;
  address: string;
  codeId: number;
}

async function initializeContract({
  client,
  contractPath,
}: ContractProps): Promise<Contract> {
  const wasmCode = fs.readFileSync(contractPath);

  const uploadReceipt = await client.tx.compute.storeCode(
    {
      wasm_byte_code: wasmCode,
      sender: client.address,
      source: "",
      builder: "",
    },
    {
      gasLimit: 5000000,
    },
  );

  if (uploadReceipt.code !== 0) {
    console.log(
      `Failed to get code id: ${JSON.stringify(uploadReceipt.rawLog)}`,
    );
    throw new Error(`Failed to upload contract`);
  }

  const codeIdKv = uploadReceipt.jsonLog![0].events[0].attributes.find(
    (a: any) => {
      return a.key === "code_id";
    },
  );

  const codeId = Number(codeIdKv!.value);

  const { code_hash } = await client.query.compute.codeHashByCodeId({
    code_id: String(codeId),
  });

  const contract = await client.tx.compute.instantiateContract(
    {
      sender: client.address,
      code_id: codeId,
      code_hash: code_hash,
      init_msg: {},
      label: "secret-counter-" + Math.ceil(Math.random() * 10000), // The label should be unique for every contract, add random string in order to maintain uniqueness
    },
    {
      gasLimit: 1000000,
    },
  );

  console.log(contract);

  if (contract.code !== 0) {
    throw new Error(
      `Failed to instantiate the contract with the following error ${contract.rawLog}`,
    );
  }

  console.log(contract);

  const contractAddress = contract.arrayLog!.find(
    (log) => log.type === "message" && log.key === "contract_address",
  )!.value;

  return {
    hash: code_hash,
    address: contractAddress,
    codeId: codeId,
  };
}

const SecretNetworkIntegration = {
  initializeClient: initializeClient,
  fillUpFromFaucet: fillUpFromFaucet,
  getScrtBalance: getScrtBalance,
  initializeContract: initializeContract,
};

export default SecretNetworkIntegration;
