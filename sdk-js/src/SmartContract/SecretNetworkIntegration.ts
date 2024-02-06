import { Wallet, SecretNetworkClient } from "secretjs";

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
  return await fetch(`http://localhost:5000/faucet?address=${address}`);
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

function initializeContract({ client, contractPath }: ContractProps) {}

const SecretNetworkIntegration = {
  initializeClient: initializeClient,
  fillUpFromFaucet: fillUpFromFaucet,
  getScrtBalance: getScrtBalance,
  initializeContract: initializeContract,
};

export default SecretNetworkIntegration;
