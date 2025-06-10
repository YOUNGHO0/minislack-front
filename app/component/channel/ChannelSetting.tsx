import {Button, DropdownMenu, Separator} from "@radix-ui/themes";
import {DotsHorizontalIcon, DotsVerticalIcon, Pencil1Icon, TrashIcon} from "@radix-ui/react-icons";
import * as React from "react";
import {useWebSocket} from "@/WebSocket/WebSocketProvider";
import {ChannelDeleteSendEvent, ChannelUpdateSendEvent} from "@/types/events";

export default ({openWindow,closeWindow,channelId}:{channelId:number, closeWindow : ()=>void, openWindow:()=>void }) => {
    const {sendMessage} = useWebSocket()

    const sendDeleteMessage = ()=>{
        let channelDeleteSendEvent :ChannelDeleteSendEvent = {message: {id: channelId}, type: "channelDelete"}
        sendMessage(JSON.stringify(channelDeleteSendEvent))
        console.log(channelDeleteSendEvent)
        closeWindow();
    }
    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger>
                <DotsVerticalIcon className="w-4 h-4 font-bold"/>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
                <DropdownMenu.Item onClick={openWindow}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded cursor-pointer outline-none">
                    <Pencil1Icon className="w-4 h-4"/>
                    변경
                </DropdownMenu.Item>

                <DropdownMenu.Separator className="h-px bg-gray-200 my-1"/>

                <DropdownMenu.Item onClick={sendDeleteMessage}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded cursor-pointer outline-none">
                    <TrashIcon className="w-4 h-4"/>
                    삭제
                </DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    );
};
