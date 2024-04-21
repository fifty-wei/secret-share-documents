'use client';

import {Card, CardHeader, CardTitle} from "@/components/ui/card";
import {FileIcon} from "@/components/file-icon";

interface Props {
    fileIds: string[];
}

export function FileIdsList({fileIds}: Props) {
    return fileIds && fileIds.map(fileId => (
        <Card key={fileId} className="w-full flex flex-row items-center">
            <CardHeader className="pr-0">
                <FileIcon className="w-6 h-6 text-gray-500" />
            </CardHeader>
            <CardHeader>
                <CardTitle className="text-sm font-medium">{fileId}</CardTitle>
                {/*<span className="text-xs text-gray-500">{uploadFileSize(uploadedFile.size)}</span>*/}
            </CardHeader>
        </Card>
    ))
}
