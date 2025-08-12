'use client'

import dynamic from 'next/dynamic';
import React, {useState, useEffect, useRef} from 'react';
import 'react-quill-new/dist/quill.snow.css';
import {Box} from "@radix-ui/themes";
import {ChatCreateSendEvent} from "@/types/events";
import {useParams} from "next/navigation";
import {useWebSocket} from "@/WebSocket/WebSocketProvider";
import {ReceivedMessage} from "@/types/type";
import MessageReplyBar from "@/app/component/message/MessageReplyBar";



const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

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
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    const modules = {
        toolbar: false,
    };


    const replyMessageIdRef = useRef(replyMessageId);
    useEffect(() => {
        replyMessageIdRef.current = replyMessageId;
    }, [replyMessageId]);

    const params = useParams();
    const channelId = params.channel;
    const space = params.space;
    const { sendMessage } = useWebSocket();

    // 키보드 높이 감지
    useEffect(() => {
        const visualViewport = window.visualViewport;
        let debounceTimeout: NodeJS.Timeout | null = null;

        const handleResize = () => {
            if (!visualViewport) return;
            const heightDiff = window.innerHeight - visualViewport.height;
            const threshold = 150;

            if (debounceTimeout) clearTimeout(debounceTimeout);

            debounceTimeout = setTimeout(() => {
                setKeyboardHeight(heightDiff > threshold ? heightDiff : 0);
            }, 100);
        };

        if (visualViewport) {
            visualViewport.addEventListener("resize", handleResize);
            return () => {
                visualViewport.removeEventListener("resize", handleResize);
                if (debounceTimeout) clearTimeout(debounceTimeout);
            };
        }
    }, []);

    const createChat = () => {
        const plainText = value.replace(/<[^>]+>/g, '').trim(); // HTML 태그 제거 후 체크
        if (plainText === ""){
         setValue("")
         return;
        }

        let parent = replyMessageIdRef.current || 0;

        const chatCreateSendEvent: ChatCreateSendEvent = {
            message: { channelId: Number(channelId), parent, text: value },
            type: "chatCreate"
        };

        sendMessage(JSON.stringify(chatCreateSendEvent));

        // 입력창 초기화
        setValue("");
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

            <div className={"flex w-full items-center"}>
                <div
                    className="w-full min-h-13 max-h-30 px-2 py-1"
                    onKeyDownCapture={(e) => {
                        if (e.code === 'Enter') {
                            e.preventDefault()
                        }
                    }}
                >
                    <ReactQuill
                        theme="snow"
                        value={value}
                        onChange={setValue}
                        modules={modules}
                        className="h-full"
                        onKeyDown={(e)=>{
                            if(e.key === 'Enter' && !e.shiftKey){
                                e.preventDefault()
                            }
                        }}
                        onKeyUp={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) { // shift+enter는 줄바꿈, 그냥 enter는 전송
                                createChat();
                            }
                        }}
                    />
                </div>
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

            <style jsx global>{`
                .ql-container.ql-snow {
                    outline: none;
                    border-radius: 6px;
                    border: 2px solid #ccc;
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
}
