import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";

import { cookieStorage, createStorage, createConfig } from "wagmi";
import { mainnet, polygon, polygonMumbai, sepolia } from "wagmi/chains";

// Get projectId at https://cloud.walletconnect.com
// export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

// if (!projectId) throw new Error("Project ID is not defined");
//
// const metadata = {
//   name: "Web3Modal",
//   description: "Web3Modal Example",
//   url: "https://web3modal.com", // origin must match your domain & subdomain
//   icons: ["https://avatars.githubusercontent.com/u/37784886"],
// };

// Create wagmiConfig
// export const config = defaultWagmiConfig({
//   chains: [mainnet, sepolia, polygon, polygonMumbai], // required
//   projectId, // required
//   metadata, // required
//   ssr: true,
//   storage: createStorage({
//     storage: cookieStorage,
//   }),
//   // enableWalletConnect: true, // Optional - true by default
//   // enableInjected: true, // Optional - true by default
//   // enableEIP6963: true, // Optional - true by default
//   // enableCoinbase: true, // Optional - true by default
// });

export const config = createConfig({
  chains: [polygon],
  // connectors: {
  //   metamask: true,
  // },
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  // transports: {
  //   [mainnet.id]: http(),
  //   [sepolia.id]: http(),
  // },
});;
