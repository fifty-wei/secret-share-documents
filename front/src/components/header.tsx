'use client';

import {useAccount, useDisconnect} from "wagmi";
import {Button} from "@/components/ui/button";
import Image from "next/image";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import {Badge} from "@/components/ui/badge";
import {AccountSecretNetwork} from "@/components/account-secret-network";
import {AccountMetamask} from "@/components/account-metamask";
import {DisconnectWallet} from "@/components/disconnect-wallet";
import {cn} from "@/lib/utils";

interface Props {
    children: (props: { fileIds: string[]; loading: boolean; error: Error | null }) => JSX.Element;
    className?: string;
}

export function Header({children, fileIds}: Props) {
    const { isConnected } = useAccount();

    const connectClasses = cn('flex items-center gap-2', {
        'opacity-30 line-through': isConnected,
    });

    const storeClasses = cn('flex items-center gap-2', {
        'opacity-30 line-through': fileIds.length > 0,
    });

    return (
        <header className="flex justify-between items-center px-4 py-4 sm px-6 md justify-start md space-x-10 lg px-8 border-b">
            <span className="flex gap-2 items-center">
                <Image
                    className=""
                    src="/logo.png"
                    width={56}
                    height={56}
                    alt=""
                />
                <span className="text-xl font-semibold">Secret Document</span>
            </span>

            <Breadcrumb className="absolute left-1/2 -translate-x-1/2">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbPage className={connectClasses}>
                            <Badge variant="secondary" className="w-6 h-6 inline-flex justify-center items-center">1</Badge>
                            Connect with Metamask
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage className={storeClasses}>
                            <Badge variant="secondary" className="w-6 h-6 inline-flex justify-center items-center">2</Badge>
                            Store your document
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage className={storeClasses}>
                            <Badge variant="secondary" className="w-6 h-6 inline-flex justify-center items-center">3</Badge>
                            Get all your private documents
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage className="flex items-center gap-2">
                            <Badge variant="secondary" className="w-6 h-6 inline-flex justify-center items-center">4</Badge>
                            Share it
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center gap-4">
                <AccountSecretNetwork />
                <AccountMetamask />
                <DisconnectWallet>
                    Disconnect
                </DisconnectWallet>
            </div>
        </header>
    )
}
