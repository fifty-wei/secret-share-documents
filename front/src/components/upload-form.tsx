'use client';

import { useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CardTitle, CardHeader, Card } from "@/components/ui/card"
import { FormEvent, useContext, useState, useMemo } from "react";
import { FileIcon } from "@/components/file-icon";
import { ArrowDownToLine, FolderPlus } from "lucide-react";
import { SecretDocumentContext } from "@/context/SecretDocumentContext";

export function UploadForm() {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [estimatedGas, setEstimatedGas] = useState(null);
    const { client } = useContext(SecretDocumentContext);

    useEffect(() => {

        if( ! uploadedFile ) {
            return;
        }

        if (!client) {
            console.error("No SecretDocumentClient init.");
            return;
        }

        async function fetchEstimatedGas(){
            const estimatedGas = await client.storeDocument().estimatedGas();
            setEstimatedGas(estimatedGas);
        }

        fetchEstimatedGas();
    }, [uploadedFile]);
    async function handleSubmit(e: FormEvent<HTMLFormElement>){
        e.preventDefault()

        const formData = new FormData(e.target as HTMLFormElement);

        // console.log(formData.get('yourFile'));
        // console.log(formaData);


        if (!client) {
            console.error("No SecretDocumentClient init.");
            return;
        }

        try {
            const tx = await client.storeDocument().fromFile(formData.get('yourFile') as File);

            console.log(tx);
        } catch (error) {
            console.error(error);
        }
    }

    const handleDrag = function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragging(true);
        } else if (e.type === "dragleave") {
            setIsDragging(false);
        }
    };

    const handleDrop = function (e) {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files.length < 1) {
            return;
        }

        setUploadedFile(e.dataTransfer.files[0]);
    };

    const uploadFileSize = (size) => {
        if (size < 1024) {
            return size + ' bytes';
        } else if (size < 1024 * 1024) {
            return (size / 1024).toFixed(2) + ' KB';
        } else if (size < 1024 * 1024 * 1024) {
            return (size / 1024 / 1024).toFixed(2) + ' MB';
        } else {
            return (size / 1024 / 1024 / 1024).toFixed(2) + ' GB';
        }
    }

    return (
            <form
                onSubmit={handleSubmit}
                className={`flex flex-col p-8 h-full relative ${isDragging ? "bg-indigo-50 dark:bg-gray-900" : ""}`}
                method="post"
                onDragEnter={handleDrag}
            >
                <div
                    className={`flex flex-1 items-center justify-center p-8 border-2 border-dashed rounded-lg border-gray-200 dark:border-gray-800 ${isDragging ? "border-indigo-600 dark:border-gray-100" : ""}`}>
                    <div
                        className={`w-full max-w-sm  flex flex-col items-center space-y-4`}>
                        <div className="flex flex-col items-center space-y-1.5">
                            <FolderPlus strokeWidth={1.5} className="w-12 h-12" />
                            <h2 className="text-sm font-medium leading-none">Drag and drop your file</h2>
                            <span className="text-xs text-gray-500 dark:text-gray-400">or</span>
                        </div>
                        <div className="w-full">
                            <Button variant="outline" type="button" asChild>
                                <label htmlFor="toto" className="w-full">Browse Files</label>
                            </Button>
                            <Input className="sr-only" type="file" id="toto" name="your-file"/>
                        </div>
                        { !! uploadedFile && (
                            <>
                                <Card className="w-full flex flex-row items-center">
                                    <CardHeader className="pr-0">
                                        <FileIcon type={uploadedFile.type} className="w-6 h-6 text-gray-500" />
                                    </CardHeader>
                                    <CardHeader>
                                        <CardTitle className="text-sm font-medium">{uploadedFile.name}</CardTitle>
                                        <span className="text-xs text-gray-500">{uploadFileSize(uploadedFile.size)}</span>
                                    </CardHeader>
                                </Card>

                                <Button type="submit" className="gap-2">
                                    <ArrowDownToLine className="w-5 h-5" />
                                    Upload
                                </Button>

                                {estimatedGas !== null && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        Estimated gas: {estimatedGas}
                                    </span>
                                )}
                            </>
                        ) }
                    </div>
                </div>
                {isDragging && (
                    <div
                        className="absolute inset-0"
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    ></div>
                )}
            </form>
    )
}
