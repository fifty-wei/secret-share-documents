"use client";

import React, { PropsWithChildren, ReactNode, useState } from "react";
import { SecretDocumentContext } from "./SecretDocumentContext";
import { useWalletClient } from "wagmi";
import { Config, SecretDocumentClient } from "../../../sdk-js/src";
import { useEffect } from "react";
import { MetaMaskWallet } from "secretjs";
import { useClient, useAccount } from "wagmi";

interface Props extends PropsWithChildren {
  config: Config;
}

export const SecretDocumentProvider = ({
  config,
  children,
}: PropsWithChildren) => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [client, setClient] = useState<SecretDocumentClient>();
  const [secretNetworkAddress, setSecretNetworkAddress] = useState<string>('');

  useEffect(() => {
    if (!walletClient) {
      return;
    }
    config.useEvmWallet({
      client: walletClient,
    });
  }, [walletClient]);

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

      setSecretNetworkAddress(wallet.address);
      setClient(new SecretDocumentClient(config));
    };

    init();
  }, [address]);
  // end SDK configuration
  
  return (
    <SecretDocumentContext.Provider value={{ client, secretNetworkAddress }}>
      {children}
    </SecretDocumentContext.Provider>
  );
};
