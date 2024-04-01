"use client";

import React, { ReactNode } from "react";
import { config, projectId } from "@/config";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { State, WagmiProvider } from "wagmi";
import { SecretDocumentProvider } from "./SecretDocumentProvider";
import Environment from "../../../sdk-js/src/Environment";
import Config from "../../../sdk-js/src/Config";
import IpfsStorage from "../../../sdk-js/src/StoreDocument/Storage/IPFSStorage";

// Setup queryClient
const queryClient = new QueryClient();

// Create modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
});

// start SDK configuration
const configSecretDocument = new Config({ env: Environment.MAINNET });

const authorization =
  "Basic " +
  Buffer.from(
    process.env.NEXT_PUBLIC_INFURA_ID +
      ":" +
      process.env.NEXT_PUBLIC_INFURA_SECRET
  ).toString("base64");

const ipfsStorage = new IpfsStorage({
  gateway: "https://ipfs.infura.io:5001",
  config: {
    headers: {
      authorization,
    },
  },
});

configSecretDocument.useStorage(ipfsStorage);

export function ContextProvider({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState?: State;
}) {
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <SecretDocumentProvider config={configSecretDocument}>
          {children}
        </SecretDocumentProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
