import IEncryptedData from "../Encryption/IEncryptedData";
import { IReceiveMessageEvm } from "./IQueryPayload";
import ISecretNetworkSmartContract from "./ISecretNetworkSmartContract";
import ViemClient from "./ViemClient";
import {
  AxelarQueryAPI,
  AxelarQueryAPIFeeResponse,
  Environment,
  EvmChain,
  GasToken,
} from "@axelar-network/axelarjs-sdk";

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

  async getEstimateFee(): Promise<AxelarQueryAPIFeeResponse> {
    const axelar = new AxelarQueryAPI({
      environment: Environment.TESTNET,
    });

    const gmpParams = {
      showDetailedFees: true,
      destinationContractAddress: this.secretContract.address,
      sourceContractAddress: this.viemClient.getContract().address,
      tokenSymbol: GasToken.MATIC,
    };

    return (await axelar.estimateGasFee(
      EvmChain.POLYGON,
      "secret",
      GasToken.MATIC,
      BigInt(100000),
      "auto",
      "0",
      gmpParams,
    )) as AxelarQueryAPIFeeResponse;
  }

  async send(message: IReceiveMessageEvm): Promise<`0x${string}`> {
    const gasEstimate = await this.getEstimateFee();

    return await this.viemClient.writeContract({
      functionName: "send",
      args: ["secret", this.secretContract.address, message],
      value: this.viemClient.formatEther(BigInt(gasEstimate.executionFee)),
    });
  }
}

export default PolygonToSecretSmartContrat;
