"use client";

import React, { PropsWithChildren, ReactNode, useState } from "react";
import { SecretDocumentContext } from "./SecretDocumentContext";
import Config from "../../../sdk-js/src/config";
import { useWalletClient } from "wagmi";
import IpfsStorage from "../../../sdk-js/src/StoreDocument/Storage/IPFSStorage";
import SecretDocumentClient from "../../../sdk-js/src";
import { useEffect } from "react";
import { MetaMaskWallet } from "secretjs";
import { useClient, useAccount } from "wagmi";
import Environment from "../../../sdk-js/src/Environment";

export const SecretDocumentProvider = ({ children }: PropsWithChildren) => {
  const wagmiClient = useClient();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [client, setClient] = useState<SecretDocumentClient>();

  // start SDK configuration
  const config = new Config({ env: Environment.MAINNET });
  config.useEvmWallet({
    client: walletClient,
  });

  const ipfsStorage = new IpfsStorage({
    gateway: "https://your-ipfs-node.tld/",
  });

  // const client = new SecretDocumentClient(config);

  useEffect(() => {
    if (!address) {
      return;
    }

    const init = async () => {
      const wallet = await MetaMaskWallet.create(
        window.ethereum,
        address || ""
      );

      config.useSecretWallet(wallet);
      console.log("config", config);
      setClient(new SecretDocumentClient(config));
    };

    init();
  }, [address]);
  // end SDK configuration

  return (
    <SecretDocumentContext.Provider value={{ client }}>
      {children}
    </SecretDocumentContext.Provider>
  );
};
