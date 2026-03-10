'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, Loader2 } from 'lucide-react';

interface FileUploadProps {
    sessionId: string;
    onUploadSuccess: (chunkCount: number) => void;
    onUploadError: (message: string) => void;
}

export default function FileUpload({ sessionId, onUploadSuccess, onUploadError }: FileUploadProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState<boolean>(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];
        setSelectedFile(file);
        setIsUploading(true);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('session_id', sessionId);

        try {
            const res = await fetch('http://localhost:8000/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                let errorMsg = `HTTP Error ${res.status}`;
                try {
                    const errorData = await res.json();
                    errorMsg = errorData.detail || errorData.message || errorMsg;
                } catch (_) {
                    // Fall back
                }
                setIsUploading(false);
                onUploadError(errorMsg);
                return;
            }

            const data = await res.json();

            if (!data.chunk_count) {
                setIsUploading(false);
                onUploadError('Invalid response from server: Missing chunk_count data.');
                return;
            }

            setIsUploading(false);
            onUploadSuccess(data.chunk_count);

        } catch (err: any) {
            console.error('[Upload Error]', err);
            setIsUploading(false);
            onUploadError('Connection failed. Check your network or verify the backend is running.');
        }
    }, [sessionId, onUploadSuccess, onUploadError]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'text/plain': ['.txt']
        },
        maxFiles: 1,
        disabled: isUploading
    });

    return (
        <div className="w-full">
            {!selectedFile ? (
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${isDragActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-300 hover:border-slate-400 bg-slate-50'
                        }`}
                >
                    <input {...getInputProps()} />
                    <UploadCloud className={`h-8 w-8 mb-2 ${isDragActive ? 'text-blue-500' : 'text-slate-400'}`} />
                    <p className="text-sm font-medium text-slate-700">
                        {isDragActive ? "Drop the file here..." : "Drag & drop a file here"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                        Supports PDF and TXT
                    </p>
                </div>
            ) : (
                <div className="border border-slate-200 bg-white rounded-lg p-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="bg-blue-100 p-2 rounded text-blue-600 shrink-0">
                            <FileText className="h-6 w-6" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium text-slate-800 truncate">
                                {selectedFile.name}
                            </p>
                            <p className="text-xs text-slate-500">
                                {(selectedFile.size / 1024).toFixed(1)} KB
                            </p>
                        </div>
                    </div>
                    {isUploading && (
                        <div className="flex items-center gap-2 text-blue-600 px-2 shrink-0">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span className="text-sm font-medium">Uploading...</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
