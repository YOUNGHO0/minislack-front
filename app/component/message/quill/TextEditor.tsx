import React, { useEffect, useRef, useState } from 'react';
import { useParams } from "next/navigation";
import { useWebSocket } from "@/WebSocket/WebSocketProvider";
import { ReceivedMessage } from "@/types/type";
import MessageReplyBar from "@/app/component/message/MessageReplyBar";
import "quill/dist/quill.core.css";
export default ({
                    messages,
                    replyMessageId,
                    setReplyMessageId
                }: {
    messages: ReceivedMessage[],
    replyMessageId: number | null,
    setReplyMessageId: React.Dispatch<React.SetStateAction<number | null>>
}) => {
    const [value, setValue] = useState('');
    const replyMessageIdRef = useRef(replyMessageId);
    const editorRef = useRef<HTMLDivElement>(null);
    const quillRef = useRef<any>(null); // Quill 타입 임포트 안 해서 any

    const params = useParams();
    const channelId = params.channel;
    const { sendMessage } = useWebSocket();

    useEffect(() => {
        replyMessageIdRef.current = replyMessageId;
    }, [replyMessageId]);

    useEffect(() => {
        let Quill: any;
        let quillInstance: any;

        async function setupQuill() {
            if (!editorRef.current) return;

            // 동적 import - 클라이언트에서만
            Quill = (await import('quill')).default;

            quillInstance = new Quill(editorRef.current, {
                theme: 'snow',
                modules: { toolbar: false },
                mentions:{

                }
            });

            quillInstance.on('text-change', () => {
                setValue(quillInstance.root.innerHTML);
            });

            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    createChat();
                }
            };

            quillInstance.root.addEventListener('keyup', handleKeyDown);

            quillRef.current = quillInstance;
        }

        setupQuill();

        return () => {
            if (quillRef.current) {
                quillRef.current.root.removeEventListener('keyup', createChat);
                quillRef.current = null;
            }
        };
    }, []);

    const createChat = () => {
        const plainText = quillRef.current?.getText().trim() || '';

        if (plainText === '') {
            quillRef.current?.setText('');
            setValue('');
            return;
        }

        const parent = replyMessageIdRef.current || 0;

        const chatCreateSendEvent = {
            message: { channelId: Number(channelId), parent, text: quillRef.current?.root.innerHTML || '' },
            type: "chatCreate",
        };

        sendMessage(JSON.stringify(chatCreateSendEvent));

        quillRef.current?.setText('');
        setValue('');
        setReplyMessageId(null);
    };

    return (
        <div className={"w-full flex flex-col"}>
            <div className={"w-full mx-2"}>
                {replyMessageId !== null && (
                    <MessageReplyBar
                        onCancel={() => setReplyMessageId(null)}
                        message={messages.find(msg => msg.id === replyMessageId)}
                    />
                )}
            </div>

            <div className={"px-2 flex w-full items-center"}>
                <div
                    className="w-full min-h-13 max-h-30 px-2 py-1 rounded border-2"
                    style={{ height: 'auto', overflowY: 'auto' }}
                    ref={editorRef}
                    onKeyDownCapture={(e) => {
                        if (e.code === 'Enter') {
                            e.preventDefault()
                        }
                    }}
                />
                <input
                    type="button"
                    value="전송"
                    className="m-2 h-10 lg:hidden px-4 py-2 bg-blue-600 text-white rounded"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        createChat();
                    }}
                />
            </div>
        </div>
    );
};
