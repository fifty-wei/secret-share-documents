import { Wallet } from "secretjs";
import SecretNetworkIntegration from "../src/SmartContract/SecretNetworkIntegration";
import path from "path";
import Config from "../src/Config";

export default async function initLocalSecretNetworkSmartContract(
  config: Config,
) {
  const secretNetwork = new SecretNetworkIntegration({
    wallet: new Wallet(process.env.SECRET_NETWORK_WALLET_MNEMONIC),
    chainId: config.getSecretNetwork().chainId,
    endpoint: config.getSecretNetwork().endpoint,
    faucetEndpoint: config.getSecretNetwork().faucetEndpoint,
  });
  await secretNetwork.fillUpFromFaucet(100_000);
  const contractPath = path.resolve(__dirname, "../contract/contract.wasm");
  return secretNetwork.initializeContract(contractPath);
}
