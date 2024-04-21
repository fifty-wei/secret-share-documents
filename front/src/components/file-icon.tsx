'use client';

import { FileDown, FileAudio, FileImage } from "lucide-react";

interface Props {
    type?: string;
}

const FILE_ICONS = {
    // 'application/pdf': FilePdf,
    'audio/mpeg': FileAudio,
    'audio/ogg': FileAudio,
    'audio/wav': FileAudio,
    'audio/webm': FileAudio,
    'audio/aac': FileAudio,
    'audio/flac': FileAudio,
    'audio/mp4': FileAudio,
    'audio/midi': FileAudio,
    'audio/x-midi': FileAudio,
    'audio/x-wav': FileAudio,
    'audio/x-ms-wma': FileAudio,
    'audio/x-ms-wax': FileAudio,
    'audio/x-aiff': FileAudio,
    'audio/x-aac': FileAudio,
    'audio/x-caf': FileAudio,
    'audio/x-m4a': FileAudio,
    'image/jpeg': FileImage,
    'image/png': FileImage,
};

export function FileIcon({type}: Props) {

    const Icon = type && FILE_ICONS[type] || FileDown;

    return (
        <Icon className="w-6 h-6 text-gray-500" />
    )
}
