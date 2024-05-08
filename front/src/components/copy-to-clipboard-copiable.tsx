import { ReactNode, useCallback, useState } from "react";
import Copiable from "react-copy-to-clipboard";

interface Props {
    text: string;
    onCopy?: (text: string) => void;
    children: (props: { hasCopied: boolean; copy: () => void }) => ReactNode;
}

export function CopyToClipboardCopiable({ text, onCopy, children }: Props) {
    const [hasCopied, setHasCopied] = useState<boolean>(false);

    const copy = useCallback(() => {
        if (onCopy) {
            onCopy(text);
        }
        setHasCopied(true);
        setTimeout(() => {
            setHasCopied(false);
        }, 2000);
    }, [onCopy, text]);

    return (
        <Copiable text={text} onCopy={copy}>
            {children({
                hasCopied: hasCopied,
                copy: copy,
            })}
        </Copiable>
    );
}
