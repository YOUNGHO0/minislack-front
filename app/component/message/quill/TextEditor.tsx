'use cline'
import React, {useEffect, useRef, useState} from 'react';
import {useParams} from "next/navigation";
import {useWebSocket} from "@/WebSocket/WebSocketProvider";
import {ReceivedMessage} from "@/types/type";
import MessageReplyBar from "@/app/component/message/MessageReplyBar";
import "quill/dist/quill.snow.css";
import Quill from "quill";

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
    const editorRef = useRef<HTMLDivElement>(null);
    const quillRef = useRef<Quill>(null);
    const params = useParams();
    const channelId = params.channel;
    const { sendMessage } = useWebSocket();

    const [isQuillReady, setIsQuillReady] = useState(false);

    useEffect(() => {
        if (!editorRef.current) return;

        // 클라이언트 사이드에서만 import하기 위해 useEffect 안에서 import
        import('quill').then((QuillModule) => {
            const quill = new QuillModule.default(editorRef.current!, {
                theme: 'snow',
                modules:{
                    toolbar:false,

                }
            });
            quillRef.current = quill;
            setIsQuillReady(true);
        });
    }, []);


    const createChat = () => {
        const plainText = quillRef.current?.getText().trim() || '';

        if (plainText === '') {
            quillRef.current?.setText('');
            setValue('');
            return;
        }

        const parent = replyMessageId

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
                            e.preventDefault();
                        }
                    }}
                    onKeyUp={(e)=>{
                        if(e.key == 'Enter' && !e.shiftKey){
                            e.preventDefault();
                            createChat();
                            return;
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
