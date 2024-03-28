import { IReceiveMessageEvm } from "./IQueryPayload";
import ISecretNetworkSmartContract from "./ISecretNetworkSmartContract";
import ViemClient from "./ViemClient";
import AxelarClient from "./AxelarClient";

interface Props {
  secretContract: ISecretNetworkSmartContract;
  viemClient: ViemClient;
  axelarClient: AxelarClient;
}

class PolygonToSecretSmartContract {
  secretContract: ISecretNetworkSmartContract;
  viemClient: ViemClient;
  axelarClient: AxelarClient;

  constructor({ secretContract, viemClient, axelarClient }: Props) {
    this.viemClient = viemClient;
    this.secretContract = secretContract;
    this.axelarClient = axelarClient;
  }

  async send(message: IReceiveMessageEvm): Promise<`0x${string}`> {
    const gasEstimate = await this.axelarClient.getEstimateFee({
      destinationContractAddress: this.secretContract.address,
      sourceContractAddress: this.viemClient.getContract().address,
    });

    console.log("Gas Estimate", gasEstimate);

    const gasEstimateInt =
      parseInt(gasEstimate.baseFee, 10) +
      parseInt(gasEstimate.executionFeeWithMultiplier, 10);

    return await this.viemClient.writeContract({
      functionName: "send",
      args: [
        this.axelarClient.getDestinationChain(),
        this.secretContract.address,
        message,
      ],
      value: this.viemClient.parseGwei(gasEstimateInt.toString()),
    });
  }
}

export default PolygonToSecretSmartContract;
