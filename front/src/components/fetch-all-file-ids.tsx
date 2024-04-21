'use client';

import {useContext, useEffect, useState} from "react";
import {SecretDocumentContext} from "@/context/SecretDocumentContext";

interface Props {
    children: (props: { fileIds: string[]; loading: boolean; error: Error | null }) => JSX.Element;
}

export function FetchAllFileIds({children}: Props) {
    const [fileIds, setFileIds] = useState<string[]>([]);
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const { client } = useContext(SecretDocumentContext);

    async function fetchAllFileIds() {
        setLoading(true);
        setError(null);

        try {
            const fileIds = await client?.viewDocument().getAllFileIds();
            setFileIds(fileIds);
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

        fetchAllFileIds();
    }, [client]);

    return children({
        fileIds: fileIds,
        loading: loading,
        error: error,
        fetchAllFileIds: fetchAllFileIds,
    });
}
