'use client';

import {useAccount} from "wagmi";
import {UploadForm} from "@/components/upload-form";
import {FetchAllFileIds} from "@/components/fetch-all-file-ids";
import {FileIdsList} from "@/components/file-ids-list";
import {ConnectWallet} from "@/components/connect-wallet";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import Image from "next/image";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import {Account} from "@/components/account";
import {DisconnectWallet} from "@/components/disconnect-wallet";
import {cn} from "@/lib/utils";


export default function UploadPage() {
    const { isConnected } = useAccount();

    if( ! isConnected ) {
        return(
            <main className="flex-1 flex justify-center items-center">
                <ConnectWallet />
            </main>
        )
    }

    return (
        <>
            <FetchAllFileIds>
                {({fetchAllFileIds, fileIds, loading, error}) => {

                    const connectClasses = cn('flex items-center gap-2', {
                        'opacity-30 line-through': isConnected,
                    });

                    const storeClasses = cn('flex items-center gap-2', {
                        'opacity-30 line-through': fileIds.length > 0,
                    });

                    return(
                        <>
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
                                    <Account />
                                    <DisconnectWallet>
                                        Disconnect
                                    </DisconnectWallet>
                                </div>
                            </header>
                            <main className="flex-1 grid grid-cols-2 divide-x">
                                <UploadForm />
                                <div>
                                    {loading && <div className="h-full w-full flex items-center justify-center">Loading...</div>}
                                    {error && (
                                        <div className="h-full w-full flex flex-col gap-4 items-center justify-center">
                                            <Badge variant="destructive">Error</Badge>
                                            {error.message}
                                            <Button onClick={fetchAllFileIds}>Try again</Button>
                                        </div>
                                    )}
                                    {fileIds.length > 0 ? (
                                        <div className="p-8">
                                            <FileIdsList fileIds={fileIds}/>
                                        </div>
                                    ) : (
                                        <div className="h-full w-full flex flex-col gap-4 items-center justify-center">
                                            <h2>You're not upload document yet.</h2>
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
