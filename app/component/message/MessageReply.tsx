import {ReceivedMessage} from "@/types/type";
import React from "react";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function ({message, scroll}: {
    message: ReceivedMessage | undefined
    scroll : (id:number)=> void
}) {
    if (!message) return null;

    return (
        <div onClick={()=>scroll(message?.id)}
            className="flex items-center justify-between bg-gray-100 p-2 rounded-md mb-2">

            <div className="text-gray-800 max-w-[90%] line-clamp-2">
                <div className={"font-bold"}>{message.user?.nickName}</div>
                {/* Quill 읽기전용으로 렌더링 */}
                <ReactQuill
                    value={message.text}
                    readOnly={true}
                    theme="bubble"
                    modules={{ toolbar: false }}
                    className="font-bold"
                />
            </div>

        </div>
    );
}
