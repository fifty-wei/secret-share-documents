import { Chain } from "viem";
import IPolygonSmartContract from "../src/SmartContract/IPolygonSmartContract";
import ISecretNetworkSmartContract from "../src/SmartContract/ISecretNetworkSmartContract";
import IViemWallet from "./SmartContract/IViemWallet";

export default interface IConfig {
  chains: {
    polygon: {
      chainId: string;
    };
    secretNetwork: {
      chainId: string;
      endpoint: string;
      faucetEndpoint: string;
    };
  };
  contracts: {
    PolygonToSecret: IPolygonSmartContract;
    ShareDocument: ISecretNetworkSmartContract;
  };
}
