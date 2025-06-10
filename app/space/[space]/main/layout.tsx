"use client";

import React, {useEffect, useState} from "react";
import { Channel } from "@/types/channel";
import ChannelList from "@/app/component/channellist/ChannelList";
import ChannelAndAddButton from "@/app/component/channellist/ChannelAddDialog";

import {
    ChevronDoubleUpIcon,
    ChevronDoubleDownIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import emitter from "@/WebSocket/Emitter";
import {ChannelCreateReceiveEvent, ChannelDeleteReceiveEvent, ChannelUpdateReceiveEvent} from "@/types/events";
import {channel} from "node:diagnostics_channel";
import {useParams} from "next/navigation";

export default function RootLayout({
                                       children,
                                   }: Readonly<{ children: React.ReactNode }>) {
    const [showSidebar, setShowSidebar] = useState(true);
    const [data, setData] = React.useState<Channel[]>([]);
    const {space}= useParams()
    useEffect(() => {

        emitter.on('channelCreate',(message : ChannelCreateReceiveEvent)=>{
            let createdChannel:Channel = {id: message.id, name: message.channelName}
            setData(prevData => [...prevData, createdChannel]);
            console.log(createdChannel);
            console.log("success");
        })
        emitter.on('channelUpdate', (message: ChannelUpdateReceiveEvent) => {
            const updatedChannel: Channel = {id: message.id, name: message.channelName};
            setData(prevData =>
                prevData.map(channel =>
                    channel.id === updatedChannel.id ? updatedChannel : channel
                )
            );
        });
        emitter.on('channelDelete', (message:ChannelDeleteReceiveEvent)=>{
            setData(prev => prev.filter(channel => channel.id !== message.id));
        })


        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/channel?spaceId=${space}`, {withCredentials:true})
            .then(response => {
               if(response.status ===200){
                   setData(response.data);
               }
            })

        return ()=>{
            emitter.off('channelCreate')
            emitter.off('channelUpdate')
            emitter.off('channelDelete')
        }
    }, []);


    // PC/모바일 구분 없이 위아래 화살표로 통일
    const renderToggleIcon = () => {
        const baseClass = "w-5 h-5";
        return showSidebar ? (
            <ChevronDoubleUpIcon className={baseClass} />
        ) : (
            <ChevronDoubleDownIcon className={baseClass} />
        );
    };

    return (
        <div className="w-full h-full flex flex-col md:flex-row">
            {/* 사이드바 전체 */}
            <div className="w-full md:w-80 bg-neutral-300 flex flex-col">
                {/* 헤더 */}
                <div className="flex items-center justify-between p-4">
                    <div className="text-lg font-extrabold flex items-center gap-2">
                        Channel List
                        <button onClick={() => setShowSidebar((prev) => !prev)}>
                            {renderToggleIcon()}
                        </button>
                    </div>
                    <ChannelAndAddButton />
                </div>

                {/* 본문 */}
                {showSidebar && (
                    <div className="px-4 pb-4 flex-grow overflow-auto">
                        <ChannelList data={data} />
                    </div>
                )}
            </div>

            {/* 메인 콘텐츠 */}
            <div className="flex-1 min-h-0">{children}</div>
        </div>
    );
}
