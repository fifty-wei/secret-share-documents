import { config } from "../../config/wagmi";
import IEncryptedMessage from "../StoreDocument/IEncryptedMessage";
import IPolygonSmartContract from "./IPolygonSmartContract";
import ISecretNetworkSmartContract from "./ISecretNetworkSmartContract";
import { writeContract } from "@wagmi/core";

interface Props {
  polygonContract: IPolygonSmartContract;
  secretContract: ISecretNetworkSmartContract;
}

class PolygonToSecretSmartContrat {
  polygonContract: IPolygonSmartContract;
  secretContract: ISecretNetworkSmartContract;

  constructor({ secretContract, polygonContract }: Props) {
    this.polygonContract = polygonContract;
    this.secretContract = secretContract;
  }

  async send(message: IEncryptedMessage) {
    return await writeContract(config, {
      abi: this.polygonContract.abi,
      address: this.polygonContract.address,
      functionName: "send",
      args: [0, "secret", this.secretContract.address, message],
    });
  }
}

export default PolygonToSecretSmartContrat;
