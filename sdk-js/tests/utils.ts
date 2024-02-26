import { Wallet } from "secretjs";
import SecretNetworkIntegration from "../src/SmartContract/SecretNetworkIntegration";
import path from "path";
import Config from "../src/Config";

export async function initLocalSecretNetworkSmartContract(config: Config) {
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

export async function store({ secretDocument, storeDocument, fileUrl }) {
  let uploadOptions = {
    contentType: "toBeDefined",
  };
  const { data, contentType } = await storeDocument.fetchDocument(fileUrl);
  uploadOptions.contentType = contentType;
  const bufferData = Buffer.from(data);

  const encryptedMessage = await storeDocument.getEncryptedMessage(
    bufferData,
    uploadOptions,
  );

  const payload = {
    source_chain: "test-chain",
    source_address: "test-address",
    payload: encryptedMessage,
  };

  return await secretDocument.store(payload);
}
