"use client";

import React, { ReactNode } from "react";
import { config, projectId } from "@/config";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { State, WagmiProvider } from "wagmi";
import { SecretDocumentProvider } from "./SecretDocumentProvider";
import Environment from "../../../sdk-js/src/Environment";
import Config from "../../../sdk-js/src/config";
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

const ipfsStorage = new IpfsStorage({
  gateway: "https://dweb.link",
});

configSecretDocument.useStorage(ipfsStorage);

export function ContextProvider({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState?: State;
}) {
  console.log({initialState})
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <SecretDocumentProvider config={configSecretDocument}>{children}</SecretDocumentProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
