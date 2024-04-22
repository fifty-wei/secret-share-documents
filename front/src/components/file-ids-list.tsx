'use client';

import { cn } from "@/lib/utils"
import {ArrowDownToLine, Share2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {FileIdShareModal} from "@/components/file-id-share-modal";
import {Separator} from "@/components/ui/separator";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {useContext} from "react";
import {SecretDocumentContext} from "@/context/SecretDocumentContext";

interface Props {
    fileIds: string[];
}

const languages = [
    { label: "Can view", value: "addViewing" },
    { label: "Remove access", value: "deleteViewing" },
    { label: "owner", value: "changeOwner" },
];

export function FileIdsList({fileIds}: Props) {
    const { client, secretNetworkAddress } = useContext(SecretDocumentContext);

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
            a.download = fileId;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);
        }
    }

    return !! secretNetworkAddress && fileIds.length > 0 && (
        <ul role="list" className="divide-y divide-gray-100 rounded-md border border-gray-200">
            {
                fileIds.map(fileId => {

                    return (
                        <li key={fileId} className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                            <figure className="flex w-0 flex-1 items-center">
                                <svg className="h-5 w-5 flex-shrink-0 text-gray-400" viewBox="0 0 20 20" fill="currentColor"
                                     aria-hidden="true">
                                    <path fillRule="evenodd"
                                          d="M15.621 4.379a3 3 0 00-4.242 0l-7 7a3 3 0 004.241 4.243h.001l.497-.5a.75.75 0 011.064 1.057l-.498.501-.002.002a4.5 4.5 0 01-6.364-6.364l7-7a4.5 4.5 0 016.368 6.36l-3.455 3.553A2.625 2.625 0 119.52 9.52l3.45-3.451a.75.75 0 111.061 1.06l-3.45 3.451a1.125 1.125 0 001.587 1.595l3.454-3.553a3 3 0 000-4.242z"
                                          clipRule="evenodd"></path>
                                </svg>

                                <figcaption className="ml-4 flex min-w-0 flex-1 gap-2">
                                    <span className="truncate font-medium">{fileId}</span>
                                </figcaption>
                            </figure>
                            <div className="ml-4 flex flex-shrink-0 gap-x-2 items-center">
                                <Button size="sm" variant="link" className="gap-2 text-accent-600 hover:text-accent-500" onClick={() => downloadFile(fileId)} >
                                    <ArrowDownToLine className="w-4 h-4 flex-none"/>
                                    Download
                                </Button>
                                <span className="text-gray-200" aria-hidden="true">|</span>

                                <FileIdShareModal fileId={fileId} ownerAddress={secretNetworkAddress} />
                            </div>
                        </li>
                    )
                })
            }
        </ul>
    )
}
