import {ReceivedMessage} from "@/types/type";
import React, {useEffect, useRef} from "react";
import dynamic from "next/dynamic";
import Quill from "quill";
import DOMPurify from "dompurify";

const ReactQuill = dynamic(() => import('react-quill-new'), {ssr: false});

export default function ({message, scroll}: {
    message: ReceivedMessage | undefined
    scroll: (id: number) => void
}) {
    const editorRef = useRef<HTMLDivElement>(null);
    const quillRef = useRef<Quill>(null);

    // Quill 초기화 (한 번만 실행)
    useEffect(() => {

        import('quill').then((QuillModule) => {
            if (!editorRef.current) return;

            const quill = new QuillModule.default(editorRef.current, {
                theme: 'bubble',
                readOnly: true,
                modules: {toolbar: false}
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
        <div onClick={() => scroll(message?.id)}
             className="flex items-center justify-between bg-gray-100 p-2 rounded-md mb-2">

            <div className="text-gray-800 max-w-[90%] line-clamp-2">
                <div className={"font-semibold text-xs"}>{message.user?.nickName}</div>
                {/* Quill 읽기전용으로 렌더링 */}
                <div
                    ref={editorRef}
                    className="ql-container ql-bubble p-0 text-xl"
                />
            </div>

            <style jsx>{`
                .ql-container {
                    font-size: 16px;
                    font-weight: 600;
                }
            `}</style>

        </div>
    );
}
