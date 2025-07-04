import {Button, DropdownMenu, Separator} from "@radix-ui/themes";
import {DotsHorizontalIcon, DotsVerticalIcon, ExitIcon, Pencil1Icon, TrashIcon} from "@radix-ui/react-icons";
import * as React from "react";
import {useWebSocket} from "@/WebSocket/WebSocketProvider";
import {ChannelDeleteSendEvent, ChannelUpdateSendEvent} from "@/types/events";
import ChannelLeaveDialog from "@/app/component/channel/ChannelLeaveDialog";
import axios from "axios";
import {useParams} from "next/navigation";
import {useState} from "react";
import ChannelLeaveErrorDialog from "@/app/component/error/ChannelLeaveErrorDialog";

function getUpdateAndDelete(openWindow: () => void, sendDeleteMessage: () => void) {
    return <>
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
    </>;
}

export default ({mine,openWindow,closeWindow,channelId}:{mine:boolean,channelId:number, closeWindow : ()=>void, openWindow:()=>void }) => {
    const {sendMessage} = useWebSocket()
    const {space} = useParams();
    const [errorState, setErrorState] = useState(false);
    const sendDeleteMessage = ()=>{
        let channelDeleteSendEvent :ChannelDeleteSendEvent = {message: {id: channelId}, type: "channelDelete"}
        sendMessage(JSON.stringify(channelDeleteSendEvent))
        console.log(channelDeleteSendEvent)
        closeWindow();
    }

    const [channelOutState, setChannelOutState] = React.useState(false);
    const leaveChannel = ()=>{
        axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/channel/leave`,
            {spaceId : space, channelId : channelId}, // 사용자 입력값 사용
            {
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(response => {
            if (response.status === 200) {
                console.log("이동 필요");
            }
        })
            .catch(reason => {
                if(reason.status === 403){
                    setErrorState(true);
                }
            })
    }

    return (
        <div>
            <ChannelLeaveErrorDialog alertState={errorState} closeWindow={()=>setErrorState(false)}></ChannelLeaveErrorDialog>
            <ChannelLeaveDialog alertState={channelOutState} closeWindow={()=>setChannelOutState(false)} leave={leaveChannel}></ChannelLeaveDialog>
            <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                    <DotsVerticalIcon className="w-4 h-4 font-bold"/>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                    <DropdownMenu.Item
                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded cursor-pointer outline-none"
                        onSelect={(event) => {
                            setChannelOutState(true)
                        }}
                    >
                        <ExitIcon className="w-4 h-4" />
                        채널 나가기
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator className="h-px bg-gray-200 my-1"/>
                    {mine && getUpdateAndDelete(openWindow, sendDeleteMessage)}
                </DropdownMenu.Content>
            </DropdownMenu.Root>
        </div>

    );
};
