import { Wallet } from "secretjs";
import SecretNetworkIntergration from "../../sdk-js/src/SmartContract/SecretNetworkIntegration";
import path from "node:path";
import dotenv from "dotenv";
dotenv.config();

(async () => {
  const wallet = new Wallet(process.env.MNEMONIC);

  const secretNetwork = new SecretNetworkIntergration({
    wallet: wallet,
    endpoint: "https://api.pulsar.scrttestnet.com",
    chainId: "pulsar-3",
    faucetEndpoint: "http://localhost:5000",
  });

  const contractPath = path.resolve(__dirname, "../contract.wasm.gz");
  const contract = await secretNetwork.initializeContract(contractPath);

  console.log(contract);

  // console.log(secretjs);
})();