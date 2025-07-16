import {ReceivedMessage} from "@/types/type";

export default function ({message}: {
    message: ReceivedMessage | undefined
}) {
    if (!message) return null;

    return (
        <div className="flex items-center justify-between bg-gray-100 p-2 rounded-md mb-2">

            <div className="text-sm text-gray-800 max-w-[90%] line-clamp-2">
                <div className={"font-bold"}>{message.user?.nickName}</div>
                <div className={"px-2"}>{message.text}</div>
            </div>
        </div>
    );
}
