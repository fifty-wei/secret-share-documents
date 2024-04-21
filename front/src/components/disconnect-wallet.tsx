'use client';

import {useAccount, useDisconnect} from "wagmi";
import {Button} from "@/components/ui/button";

interface Props {
    children: (props: { fileIds: string[]; loading: boolean; error: Error | null }) => JSX.Element;
    className?: string;
}

export function DisconnectWallet({children, className}: Props) {
    const { isConnected } = useAccount();
    const { disconnect } = useDisconnect();

    return isConnected && (
        <Button
            variant="outline"
            className={className}
            onClick={() => disconnect()}
        >
            {children}
        </Button>
    )
}
