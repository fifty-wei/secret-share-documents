'use client';

import { useAccount, useEnsAvatar, useEnsName } from 'wagmi'
import {CopyToClipboardButton} from "@/components/copy-to-clipboard-button";

const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}…${address.slice(-4)}`;
};

export function AccountMetamask() {
    const { address } = useAccount()
    const { data: ensName } = useEnsName({ address })
    const { data: ensAvatar } = useEnsAvatar({ name: ensName! })

    return (
        <div className="inline-flex items-center gap-2">
            {ensAvatar && <img alt="ENS Avatar" src={ensAvatar} />}
            {address && (
                <div className="inline-flex items-center">
                    {ensName ? `${ensName} (${formatAddress(address.toString())})` : formatAddress(address.toString())}
                    <CopyToClipboardButton text={address.toString()} />
                </div>
            )}
        </div>
    )
}
