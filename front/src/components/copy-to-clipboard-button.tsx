import { PropsWithChildren } from "react";
import {CopyToClipboardCopiable} from "@/components/copy-to-clipboard-copiable";
import {Button} from "@/components/ui/button";
import {Check, Copy} from "lucide-react";
import {cn} from "@/lib/utils";
interface Props extends PropsWithChildren {
    text: string;
    className?: string;
    onCopy?: (text: string) => void;
    withIcon?: boolean;
    withAnimation?: boolean;
    direction?: "left";
}

export function CopyToClipboardButton({
                                          text,
                                          onCopy,
                                          className,
                                          children,
                                          withAnimation = true,
                                          withIcon = true,
                                          direction = "left",
                                      }: Props) {
    const classes = cn("relative", className?.toString());

    return (
        <CopyToClipboardCopiable text={text} onCopy={onCopy}>
            {({ hasCopied }) => {
                const copiedClassname = cn(
                    "absolute transition-all duration-300 ease-in-out rounded-sm bg-gray-900 font-normal text-white text-xs px-4 py-2 z-20",
                    {
                        "-translate-y-1/2 top-1/2 right-full":
                            direction === "left" && withAnimation,
                        "opacity-100 translate-x-0 pointer-events-auto":
                            hasCopied && withAnimation,
                        "opacity-0 translate-x-[10px] pointer-events-none":
                            !hasCopied && withAnimation,
                        "opacity-0": !withAnimation,
                    }
                );

                return (
                    <Button variant="link" size="icon" className={classes}>
                        {withIcon && (
                            <>
                                {hasCopied ? (
                                    <>
                                        <Check className="flex-none w-4 h-4 opacity-50" />
                                    </>
                                ) : (
                                    <>
                                        <Copy className="flex-none w-4 h-4 opacity-50" />
                                    </>
                                )}
                            </>
                        )}
                        <span className={copiedClassname}>Copied</span>
                        {children}
                    </Button>
                );
            }}
        </CopyToClipboardCopiable>
    );
}
