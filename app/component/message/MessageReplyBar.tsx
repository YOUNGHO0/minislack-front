import {ReceivedMessage} from "@/types/type";
import {Cross2Icon} from "@radix-ui/react-icons";
import {Separator} from "@radix-ui/themes";
import React from "react";

export default function ({message, onCancel}: {
    message: ReceivedMessage | undefined;
    onCancel: () => void;
}) {
    if (!message) return null;

    return (
        <div className="flex items-center justify-between bg-gray-100 p-2 rounded-md mb-2">

            <div className="text-gray-800 max-w-[90%] line-clamp-2 px-1">
                <div className={"text-sm font-bold mb-2"} >{message.user?.nickName} 에게 답장</div>
                <div>{message.text}</div>
            </div>
            <button onClick={onCancel}>
                <Cross2Icon className="w-5 h-5 text-gray-600 hover:text-black"/>
            </button>
        </div>
    );
}
