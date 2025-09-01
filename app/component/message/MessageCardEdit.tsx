import React, {useEffect, useRef} from "react";
import DOMPurify from "dompurify";
import {MessageEditSendEvent} from "@/types/events";
import {useWebSocket} from "@/WebSocket/WebSocketProvider";
import {ReceivedMessage} from "@/types/type";

export default (props: {
    data: ReceivedMessage, channel: number, isEditing: boolean;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}) => {

    const quillRef = useRef<any>(null);
    const editorRef = useRef<HTMLDivElement>(null);
    const {sendMessage} = useWebSocket()
    // Quill 초기화
    useEffect(() => {
        import('quill').then((QuillModule) => {
            if (!editorRef.current) return;
            const quill = new QuillModule.default(editorRef.current, {
                theme: 'bubble',
                modules: {toolbar: false}
            });
            quillRef.current = quill;

            if (props.data.text) {
                const safeHTML = DOMPurify.sanitize(props.data.text);
                if (quillRef.current)
                    quillRef.current.clipboard.dangerouslyPasteHTML(safeHTML)
                editorRef.current.focus()
                // 마지막 글자에 커서 이동
                const length = quillRef.current.getLength(); // 문서 길이
                quillRef.current.setSelection(length, 0);    // 커서 위치 지정
            }

        });
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSaveEdit();
        } else if (e.key === 'Escape') handleCancelEdit();
    };


    const handleCancelEdit = () => {
    };

    const handleSaveEdit = () => {
        console.log("save")
        if (!editorRef.current) {
            props.setIsEditing(false);
            return;
        }

        const message: MessageEditSendEvent = {
            message: {channelId: Number(props.channel), chatId: props.data.id, text: editorRef.current?.innerHTML},
            type: "chatUpdate"
        };
        sendMessage(JSON.stringify(message));
        props.setIsEditing(false);
    };

    return <div className="space-y-2">
        <div
            ref={editorRef}
            className="text-xs w-full p-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="flex justify-between gap-2 mt-2">
            <button onClick={handleCancelEdit}
                    className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-colors">취소
            </button>
            <button onClick={handleSaveEdit}
                    className="px-3 py-1 text-sm bg-orange-400 hover:bg-orange-600 text-white rounded-md transition-colors">저장
            </button>
        </div>
    </div>
}