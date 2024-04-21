'use client';

import { useAccount, useEnsAvatar, useEnsName } from 'wagmi'

const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}…${address.slice(-4)}`;
};

export function Account() {
    const { address } = useAccount()
    const { data: ensName } = useEnsName({ address })
    const { data: ensAvatar } = useEnsAvatar({ name: ensName! })

    return (
        <div>
            {ensAvatar && <img alt="ENS Avatar" src={ensAvatar} />}
            {address && <div>{ensName ? `${ensName} (${formatAddress(address.toString())})` : formatAddress(address.toString())}</div>}
        </div>
    )

    return !! address && (
        <div className="font-mono">
            {formatAddress(address.toString())}
        </div>
    )
}
