import { http, createConfig } from "@wagmi/core";
import { mainnet, polygonMumbai } from "@wagmi/core/chains";

export const config = createConfig({
  chains: [mainnet, polygonMumbai],
  transports: {
    [mainnet.id]: http(),
    [polygonMumbai.id]: http(),
  },
});