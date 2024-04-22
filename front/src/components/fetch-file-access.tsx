'use client';

import {useContext, useEffect, useState} from "react";
import {SecretDocumentContext} from "@/context/SecretDocumentContext";

interface Props {
    children: (props: { fileIds: string[]; loading: boolean; error: Error | null }) => JSX.Element;
}

export function FetchFileAccess({children, fileId}: Props) {
    const [fileAccess, setFileAccess] = useState<string[]>([]);
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const { client } = useContext(SecretDocumentContext);

    async function fetchFileAccess() {
        setLoading(true);
        setError(null);

        if( ! client ) {
            setLoading(false);
            return;
        }

        try {
            const fileAccessData = await client.shareDocument(fileId).getFileAccess();
            setFileAccess(fileAccessData);
        } catch (error) {
            setError(error);
            console.error(error);
        }
        setLoading(false);
    }

    useEffect(() => {
        if (!client) {
            return;
        }

        fetchFileAccess();
    }, [client]);

    return children({
        fileAccess: fileAccess,
        loading: loading,
        error: error,
    });
}
