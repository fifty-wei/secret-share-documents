'use client';

import {ArrowDownToLine} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card, CardHeader, CardTitle} from "@/components/ui/card";
import {FileIcon} from "@/components/file-icon";
import {useContext} from "react";
import {SecretDocumentContext} from "@/context/SecretDocumentContext";

interface Props {
    fileIds: string[];
}

export function FileIdsList({fileIds}: Props) {
    const { client } = useContext(SecretDocumentContext);
    async function downloadFile(fileId: string) {

        if (!client) {
            console.error("No SecretDocumentClient init.");
            return;
        }

        try {
            const blob = await client.viewDocument().download(fileId);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            // tx = await walletClient?.writeContract({
            //   address: config.contracts.talentLayerId,
            //   abi: PolygonToSecret.abi,
            //   functionName: "send",
            //   args: [
            //     process.env.NEXT_PUBLIC_DESTINATION_CHAIN,
            //     config.contracts.polygonToSecret,
            //     values.file?.name,
            //   ],
            //   account: address,
            // });

            console.log(tx);
        } catch (error) {
            console.error(error);
        }
    }

    return fileIds && fileIds.map(fileId => (
        <Card key={fileId} className="w-full flex flex-row items-center">
            <CardHeader className="pr-0">
                <FileIcon className="w-6 h-6 text-gray-500" />
            </CardHeader>
            <CardHeader>
                <CardTitle className="text-sm font-medium">{fileId}</CardTitle>
                {/*<span className="text-xs text-gray-500">{uploadFileSize(uploadedFile.size)}</span>*/}
            </CardHeader>
            <CardHeader className="ml-auto">
                <Button onClick={() => downloadFile(fileId)} className="gap-2">
                    <ArrowDownToLine className="w-4 h-4" />
                    Download
                </Button>
            </CardHeader>
        </Card>
    ))
}
