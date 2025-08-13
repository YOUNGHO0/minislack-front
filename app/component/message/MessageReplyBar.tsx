'use client'

import React, { useEffect, useRef } from 'react';
import { ReceivedMessage } from "@/types/type";
import { Cross2Icon } from "@radix-ui/react-icons";
import DOMPurify from 'dompurify';
import Quill from "quill";

export default function MessageReplyBar({
                                            message,
                                            onCancel,
                                        }: {
    message: ReceivedMessage | undefined;
    onCancel: () => void;
}) {
    const editorRef = useRef<HTMLDivElement>(null);
    const quillRef = useRef<Quill>(null);

    // Quill 초기화 (한 번만 실행)
    useEffect(() => {

        import('quill').then((QuillModule)=>{
            if (!editorRef.current) return;

            const quill = new QuillModule.default(editorRef.current, {
                theme: 'bubble',
                readOnly: true,
                modules: { toolbar: false }
            });

            quillRef.current = quill;

            if (message?.text && quillRef.current) {
                const safeHTML = DOMPurify.sanitize(message.text);
                quillRef.current.clipboard.dangerouslyPasteHTML(safeHTML);
            }
        })
    }, []);

    // message 변경 시 내용 업데이트
    useEffect(() => {
        if (message?.text && quillRef.current) {
            const safeHTML = DOMPurify.sanitize(message.text);
            quillRef.current.clipboard.dangerouslyPasteHTML(safeHTML);
            console.log("수행")
        }
    }, [message]);

    if (!message) return null;

    return (
        <div className="flex items-center justify-between bg-gray-100 p-2 rounded-md mx-2 mb-2">
            <div className="text-gray-800 max-w-[90%] px-1">
                <div className="text-xs font-semibold mb-2">
                    {message.user?.nickName} 에게 답장
                </div>
                <div
                    ref={editorRef}
                    className="ql-container ql-bubble p-0 text-xl"
                />
            </div>
            <button onClick={onCancel}>
                <Cross2Icon className="w-5 h-5 text-gray-600 hover:text-black" />
            </button>

            <style jsx>{`
                .ql-container {
                    font-size: 17px;
                    font-weight: 600;
                }
            `}</style>
        </div>
    );
}
