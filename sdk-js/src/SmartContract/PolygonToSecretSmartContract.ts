import { IReceiveMessageEvm } from "./IQueryPayload";
import ISecretNetworkSmartContract from "./ISecretNetworkSmartContract";
import ViemClient from "./ViemClient";
import AxelarClient from "./AxelarClient";
import IEncryptedData from "../Encryption/IEncryptedData";

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

  async estimatedGas(): Promise<number> {
    const gasEstimate = await this.axelarClient.getEstimateFee({
      destinationContractAddress: this.secretContract.address,
      sourceContractAddress: this.viemClient.getContract().address,
    });

    const gasEstimateInt =
      parseInt(gasEstimate.baseFee, 10) +
      parseInt(gasEstimate.executionFeeWithMultiplier, 10);

    return gasEstimateInt;
  }

  async send(payload: IEncryptedData): Promise<`0x${string}`> {
    const gasEstimateInt = await this.estimatedGas();

    return await this.viemClient.writeContract({
      functionName: "send",
      args: [
        'secret',
        this.secretContract.address,
        JSON.stringify(payload), // Send a string and not an object
      ],
      value: this.viemClient.parseGwei(gasEstimateInt.toString()),
    });
  }
}

export default PolygonToSecretSmartContract;
