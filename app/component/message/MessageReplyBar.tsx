'use client'

import dynamic from 'next/dynamic';
import React from 'react';
import {ReceivedMessage} from "@/types/type";
import {Cross2Icon} from "@radix-ui/react-icons";

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function MessageReplyBar({
                                            message,
                                            onCancel,
                                        }: {
    message: ReceivedMessage | undefined;
    onCancel: () => void;
}) {
    if (!message) return null;

    return (
        <div className="flex items-center justify-between bg-gray-100 p-2 rounded-md mb-2">
            <div className="text-gray-800 max-w-[90%] px-1">
                <div className="text-sm font-bold mb-2">{message.user?.nickName} 에게 답장</div>

                {/* Quill 읽기전용으로 렌더링 */}
                <ReactQuill
                    value={message.text}
                    readOnly={true}
                    theme="bubble"   // 'snow' 도 가능하지만 bubble이 깔끔함
                    modules={{ toolbar: false }}
                    className="ql-container ql-bubble p-0 font-bold"  // 필요하면 스타일 조절
                />
            </div>

            <button onClick={onCancel}>
                <Cross2Icon className="w-5 h-5 text-gray-600 hover:text-black" />
            </button>
        </div>
    );
}
