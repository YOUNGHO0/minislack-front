import {ReceivedMessage} from "@/types/type";
import {Cross2Icon} from "@radix-ui/react-icons";

export default function ({message, onCancel}: {
    message: ReceivedMessage | undefined;
    onCancel: () => void;
}) {
    if (!message) return null;

    return (
        <div className="flex items-center justify-between bg-gray-100 p-2 rounded-md mb-2">
            <div className="text-sm text-gray-800 max-w-[90%] line-clamp-2">
                {message.text}
            </div>
            <button onClick={onCancel}>
                <Cross2Icon className="w-5 h-5 text-gray-600 hover:text-black"/>
            </button>
        </div>
    );
}
