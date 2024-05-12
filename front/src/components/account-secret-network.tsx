'use client';

import {SecretDocumentContext} from "@/context/SecretDocumentContext";
import {useContext} from "react";
import {CopyToClipboardButton} from "@/components/copy-to-clipboard-button";

const formatAddress = (address: string) => {
    return `${address.slice(0, 7)}…${address.slice(-3)}`;
};

export function AccountSecretNetwork() {
    const { secretNetworkAddress } = useContext(SecretDocumentContext);

    if( !secretNetworkAddress ) {
        return null;
    }

    return (
        <div className="inline-flex items-center font-mono">
            {formatAddress(secretNetworkAddress.toString())}
            <CopyToClipboardButton text={secretNetworkAddress.toString()} />
        </div>
    )
}
