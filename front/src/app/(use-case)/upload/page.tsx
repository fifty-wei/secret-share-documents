'use client';

import {useAccount, useSwitchChain} from "wagmi";
import {Header} from "@/components/header";
import {UploadForm} from "@/components/upload-form";
import {FetchAllFileIds} from "@/components/fetch-all-file-ids";
import {FileIdsList} from "@/components/file-ids-list";
import {ConnectWallet} from "@/components/connect-wallet";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";


export default function UploadPage() {
    const { chainId, isConnected } = useAccount();
    const { chains, switchChain } = useSwitchChain();

    if( ! isConnected ) {
        return(
            <main className="flex-1 flex justify-center items-center">
                <ConnectWallet />
            </main>
        )
    }

    // Switch to polygon network
    if (chains[0].id !== chainId) {
        return (
            <main className="flex-1 flex justify-center items-center">
                 <Button key={chains[0].id} onClick={() => switchChain({ chainId: chains[0].id })}>
                    Switch to {chains[0].name}
                </Button>
            </main>
        )
    }

    return (
        <>
            <FetchAllFileIds>
                {({fetchAllFileIds, fileIds, loading, error}) => {

                    return(
                        <>
                            <Header fileIds={fileIds} />
                            <main className="flex-1 grid grid-cols-2 divide-x">
                                <UploadForm />
                                <div>
                                    {loading && <div className="h-full w-full flex items-center justify-center">Loading...</div>}
                                    {error && (
                                        <div className="h-full w-full flex flex-col gap-4 items-center justify-center">
                                            <Badge variant="destructive">Error</Badge>
                                            <p className="font-mono">{error.message}</p>
                                            <Button onClick={fetchAllFileIds}>Try again</Button>
                                        </div>
                                    )}
                                    {fileIds.length > 0 ? (
                                        <div className="p-8 flex flex-col gap-4">
                                            <FileIdsList fileIds={fileIds}/>
                                        </div>
                                    ) : (
                                        <div className="h-full w-full flex flex-col gap-4 items-center justify-center">
                                            <h2>You&apos;re not upload document yet.</h2>
                                            <p>Please drag and drop your first document on the left side.</p>
                                        </div>
                                    )}
                                </div>
                            </main>
                        </>
                    )
                }}
            </FetchAllFileIds>
        </>
    )
}
