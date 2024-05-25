'use client';

import { Connector, useConnect } from 'wagmi'
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ConnectWallet() {
    const { connectors, connect } = useConnect()

    return connectors.map((connector) => (
        <WalletOption
            key={connector.uid}
            connector={connector}
            onClick={() => connect({ connector })}
        />
    ))
}

function WalletOption({
    connector,
    onClick,
}: {
    connector: Connector
    onClick: () => void
}) {
    const [ready, setReady] = useState<boolean>(false)

    useEffect(() => {
        ; (async () => {
            const provider = await connector.getProvider()
            setReady(!!provider)
        })()
    }, [connector])

    return (
        <Button disabled={!ready} onClick={onClick}>
            Connect with {connector.name}
        </Button>
    )
}
