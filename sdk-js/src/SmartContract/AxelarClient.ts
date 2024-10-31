import {
  AxelarQueryAPI,
  AxelarQueryAPIFeeResponse,
  GasToken,
  EvmChain,
  Environment as AxelarEnvironement,
} from "@axelar-network/axelarjs-sdk";
import Environment from "../Environment";

interface Props {
  env: Environment;
  sourceChain?: EvmChain;
}

export default class AxelarClient {
  private env: Environment;
  private axelar: AxelarQueryAPI;
  private sourceChain: EvmChain;

  constructor({ env, sourceChain = EvmChain.POLYGON }: Props) {
    this.env = env;
    this.sourceChain = sourceChain;
    this.axelar = new AxelarQueryAPI({
      environment: this.getEnv(),
    });
  }

  getEnv() {
    const environments = {
      [Environment.MAINNET]: AxelarEnvironement.MAINNET,
      [Environment.TESTNET]: AxelarEnvironement.TESTNET,
      [Environment.LOCAL]: AxelarEnvironement.DEVNET,
    };

    return environments[this.env] || AxelarEnvironement.MAINNET;
  }

  getSourceChain() {
    return this.sourceChain;
  }

  async getEstimateFee({
    destinationContractAddress,
    sourceContractAddress,
  }): Promise<AxelarQueryAPIFeeResponse> {
    const axelar = this.axelar;

    const gmpParams = {
      showDetailedFees: true,
      destinationContractAddress: destinationContractAddress,
      sourceContractAddress: sourceContractAddress,
      tokenSymbol: GasToken.MATIC,
    };

    return (await axelar.estimateGasFee(
      this.getSourceChain(),
      'secret-snip',
      GasToken.MATIC,
      BigInt(7_000_000),
      "auto",
      "0",
      gmpParams
    )) as AxelarQueryAPIFeeResponse;
  }
}
