"use client";

import React, { PropsWithChildren, ReactNode, useState } from "react";
import { SecretDocumentContext } from "./SecretDocumentContext";
import Config from "../../../sdk-js/src/Config";
import { useWalletClient } from "wagmi";
import IpfsStorage from "../../../sdk-js/src/StoreDocument/Storage/IPFSStorage";
import SecretDocumentClient from "../../../sdk-js/src";
import { useEffect } from "react";
import { MetaMaskWallet } from "secretjs";
import { useClient, useAccount } from "wagmi";
import Environment from "../../../sdk-js/src/Environment";

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

  console.log("client", client);
  console.log("secretNetworkAddress", secretNetworkAddress);

  return (
    <SecretDocumentContext.Provider value={{ client, secretNetworkAddress }}>
      {children}
    </SecretDocumentContext.Provider>
  );
};
