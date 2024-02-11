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
      args: [0, "secret", this.secretContract.address, message],
      value: undefined,
    });
  }
}

export default PolygonToSecretSmartContrat;
