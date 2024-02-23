import { parseEther } from "viem";
import ISecretNetworkSmartContract from "./ISecretNetworkSmartContract";
import ViemClient from "./ViemClient";

interface Props {
  secretContract: ISecretNetworkSmartContract;
  viemClient: ViemClient;
}

class PolygonToSecretSmartContrat {
  secretContract: ISecretNetworkSmartContract;
  viemClient: ViemClient;

  constructor({ secretContract, viemClient }: Props) {
    this.viemClient = viemClient;
    this.secretContract = secretContract;
  }

  async send(message: any): Promise<`0x${string}`> {
    return await this.viemClient.writeContract({
      functionName: "send",
      args: ["secret", this.secretContract.address, message],
      value: parseEther("0"),
    });
  }
}

export default PolygonToSecretSmartContrat;
