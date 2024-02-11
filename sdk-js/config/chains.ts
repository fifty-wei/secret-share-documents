import { Chain, polygon, polygonMumbai } from "viem/chains";
import Network from "./Network";
import Environment from "./Environment";

const chains = {
  [Network.MUMBAI]: polygonMumbai,
  [Network.POLYGON]: polygon,
};

export function getChainId(env: Environment = null): Network {
  let nodeEnv = (process.env.ENVIRONMENT as Environment) || Environment.LOCAL;

  if (env !== null) {
    nodeEnv = env;
  }

  switch (nodeEnv) {
    case Environment.LOCAL:
    case Environment.TESTNET:
      return Network.MUMBAI;
    case Environment.MAINNET:
      return Network.POLYGON;
  }
}

export function getChain(networkId: Network): Chain {
  if (!networkId) {
    throw new Error(`Network ID needed`);
  }

  const chainKey = Object.keys(chains).find(
    (key) => key === networkId.toString(),
  );

  if (!chainKey) {
    throw new Error(`Chain ${networkId} not found`);
  }

  return chains[chainKey as keyof typeof Network];
}
