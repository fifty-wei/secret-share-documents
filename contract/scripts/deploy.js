import { SecretNetworkClient, Wallet } from "secretjs";
import * as fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const wallet = new Wallet(process.env.MNEMONIC);
const contract_wasm = fs.readFileSync("../contract.wasm.gz");

function getSecretNetworkClient() {
  if (process.env.DEPLOY_ENV == "testnet") {
    console.log("[*] Deploy the smart contract on Testnet...");
    return new SecretNetworkClient({
      chainId: "pulsar-3",
      url: "https://api.pulsar.scrttestnet.com",
      wallet: wallet,
      walletAddress: wallet.address,
    });
  } else if (process.env.DEPLOY_ENV == "mainnet") {
    console.log("[*] Deploy the smart contract on Mainnet...");
    return new SecretNetworkClient({
      chainId: "secret-4",
      url: "https://lcd.mainnet.secretsaturn.net",
      wallet: wallet,
      walletAddress: wallet.address,
    });
  }
  throw new Error('Invalid parameter for `DEPLOY_ENV`. Accept `testnet` or `mainnet`.');
}

const secretjs = getSecretNetworkClient();

const upload_contract = async () => {
  let tx = await secretjs.tx.compute.storeCode(
    {
      sender: wallet.address,
      wasm_byte_code: contract_wasm,
      source: "",
      builder: "",
    },
    {
      gasLimit: 4_000_000,
    }
  );

  let codeId = Number(
    tx.arrayLog.find((log) => log.type === "message" && log.key === "code_id")
      .value
  );

  let contractCodeHash = (
    await secretjs.query.compute.codeHashByCodeId({ code_id: codeId })
  ).code_hash;

  return [codeId, contractCodeHash];
};

let [codeId, contractCodeHash] = await upload_contract();

// let codeId = "4890";
// let contractCodeHash = "28aa8b90638e8f47240695b4f0c4a027f7e2991373c618da6d3d8b1daf7dbc0a";

let instantiate_contract = async (codeId, contractCodeHash) => {

  console.log("Code ID: ", codeId)
  console.log("Contract Hash: ", contractCodeHash)

  const initMsg = {};
  let tx = await secretjs.tx.compute.instantiateContract(
    {
      code_id: codeId,
      sender: wallet.address,
      code_hash: contractCodeHash,
      init_msg: initMsg,
      label: "Secret Contract" + Math.ceil(Math.random() * 10000),
    },
    {
      gasLimit: 400_000,
    }
  );

  //Find the contract_address in the logs
  const contractAddress = tx.arrayLog.find(
    (log) => log.type === "message" && log.key === "contract_address"
  ).value;

  console.log("Contract address: ", contractAddress);
};

await instantiate_contract(codeId, contractCodeHash);
