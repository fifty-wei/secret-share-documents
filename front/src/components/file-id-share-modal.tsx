'use client';

import {useFieldArray, useForm} from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Share2 } from "lucide-react";
import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
} from "@/components/ui/dialog";
import {useContext} from "react";
import {SecretDocumentContext} from "@/context/SecretDocumentContext";
import {FetchFileAccess} from "@/components/fetch-file-access";
import {Badge} from "@/components/ui/badge";
import {FileIdShareForm} from "@/components/file-id-share-form";

interface Props {
    fileIds: string[];
}

const FormSchema = z.object({
    access: z.array(z.object({
            address: z.string().min(1).regex(
                /^secret1[a-z0-9]{38}$/,
                { message: "Invalid address" }
            ),
            permission: z.string(),
        })
    ).nonempty(),
})

const accessControl = [
    { label: "Can view", value: "addViewing" },
    { label: "Remove access", value: "deleteViewing" },
    { label: "Owner", value: "changeOwner" },
];

export function FileIdShareModal({fileId, ownerAddress}: Props) {
    const { client } = useContext(SecretDocumentContext);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            access: [
                { address: ownerAddress, permission: "changeOwner" },
            ]
        }
    })


    function onSubmit(data: z.infer<typeof FormSchema>) {
        // toast({
        //     title: "You submitted the following values:",
        //     description: (
        //         <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
        //   <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        // </pre>
        //     ),
        // })
        console.log('onsubmit');
        const addressesToDelete = data.access
            .filter(access => access.permission === "changeOwner")
            .map(access => {
                return access.address
            });

        const addressesToAdd = data.access
            .filter(access => access.permission === "addViewing")
            .map(access => {
                return access.address
            });

        const addressesToChangeOwner = data.access
            .filter(access => access.permission === "changeOwner")
            .map(access => {
                return access.address
            });

        try{
            client.shareDocument(fileId).share({
                changeOwner: addressesToChangeOwner[0],
                addViewing: addressesToAdd,
                deleteViewing: addressesToDelete,
            })
        } catch (error) {
            console.error(error);
        }
    }

    const {fields, append} = useFieldArray({
        control: form.control,
        name: "access",
    });

    console.log(form.formState.errors);

    return(
        <Dialog>
            <DialogTrigger asChild>
                <Button size="sm" variant="link" className="gap-2">
                    <Share2 className="w-4 h-4 flex-none"/>
                    Share
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <FetchFileAccess fileId={fileId}>
                    {
                        ({fileAccess, loading, error}) => {
                            if( loading ) {
                                return <p>Loading...</p>
                            }

                            if( error ) {
                                return (
                                    <div className="flex flex-col items-center gap-4">
                                        <Badge variant="destructive">Error</Badge>
                                        <p className="font-mono text-center">{error.message}</p>
                                    </div>
                                )
                            }

                            const fileAccessMapped = [];

                            fileAccessMapped.push({
                                address: fileAccess.owner,
                                permission: 'changeOwner',
                            })

                            fileAccess.viewers.forEach(address => {
                                fileAccessMapped.push({
                                    address: address,
                                    permission: 'addViewing',
                                })
                            });

                            console.log({fileAccessMapped});

                            return fileAccessMapped.length > 0 && (
                                <FileIdShareForm fileId={fileId} fileAccess={fileAccessMapped} />
                            )
                        }
                    }
                </FetchFileAccess>
            </DialogContent>
        </Dialog>
    )
}
