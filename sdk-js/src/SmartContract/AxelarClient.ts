import { AxelarQueryAPI, AxelarQueryAPIFeeResponse, GasToken, EvmChain, Environment as AxelarEnvironement } from "@axelar-network/axelarjs-sdk";
import Environment from "../Environment";

interface Props{
    env: Environment;
}

export default class AxelarClient {

    private env: Environment;
    private axelar: AxelarQueryAPI;

    constructor({env}: Props){
        this.env = env
        this.axelar = new AxelarQueryAPI({
            environment: this.getEnv(),
        });
    }

    getEnv(){
        const environments = {
            [Environment.MAINNET]: AxelarEnvironement.MAINNET,
            [Environment.TESTNET]: AxelarEnvironement.TESTNET,
            [Environment.LOCAL]: AxelarEnvironement.DEVNET
        }

        return environments[this.env] || AxelarEnvironement.MAINNET;
    }


    getDestinationChain(){
        const destinationChain = {
            [Environment.LOCAL]: 'secret',
            [Environment.TESTNET]: 'secret',
            [Environment.MAINNET]: 'secret-snip',
        }

        return destinationChain[this.getEnv()] || destinationChain[Environment.MAINNET];
    }


    async getEstimateFee({destinationContractAddress, sourceContractAddress}): Promise<AxelarQueryAPIFeeResponse> {
        const axelar = this.axelar;

        const gmpParams = {
            showDetailedFees: true,
            destinationContractAddress: destinationContractAddress,
            sourceContractAddress: sourceContractAddress,
            tokenSymbol: GasToken.MATIC,
        };

        const gasPrice = await this.axelar.getGasInfo(EvmChain.POLYGON, this.getDestinationChain(), GasToken.MATIC);

        console.log({gasPrice});

        return (await axelar.estimateGasFee(
            EvmChain.POLYGON,
            this.getDestinationChain(),
            GasToken.MATIC,
            BigInt(7_000_000),
            "auto",
            "0",
            gmpParams,
        )) as AxelarQueryAPIFeeResponse;
    }
}