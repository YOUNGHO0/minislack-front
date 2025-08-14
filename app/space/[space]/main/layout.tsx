"use client";

import React, {useEffect, useRef, useState} from "react";
import {Channel, Space} from "@/types/channel";
import ChannelList from "@/app/component/channellist/ChannelList";
import ChannelAndAddButton from "@/app/component/channellist/ChannelAddDialog";

import {ChevronDoubleDownIcon, ChevronDoubleUpIcon, PlusIcon,} from "@heroicons/react/24/outline";
import axios from "axios";
import emitter from "@/WebSocket/Emitter";
import {
    ChannelCreateReceiveEvent,
    ChannelDeleteReceiveEvent,
    ChannelUpdateReceiveEvent,
    SpaceJoinReceiveEvent, SpaceOutReceiveEvent
} from "@/types/events";
import {useParams, usePathname, useRouter} from "next/navigation";
import {User} from "@/types/type";
import SpaceUserList from "@/app/component/space/userlayout/SpaceUserList";
import SpaceInfo from "@/app/component/space/SpaceInfo";
import {router} from "next/client";

export default function RootLayout({
                                       children,
                                   }: Readonly<{ children: React.ReactNode }>) {
    const router = useRouter();
    const [showSidebar, setShowSidebar] = useState(true);
    const [data, setData] = React.useState<Channel[]>([]);
    const {space}= useParams()
    const path = usePathname();
    const segments = path.split('/');
    const lastSegment = segments[segments.length - 1];
    const isParent = lastSegment === 'main';
    const [currentEnrolledUserList , setCurrentEnrolledUserList] = React.useState<User[]>([]);
    const [showUserList, setShowUserList] = useState(true);
    const [userSpaceInfo , setUserSpaceInfo] = useState<Space>();
    const contentRef = useRef<HTMLDivElement>(null);
    useEffect(() => {

        emitter.on('spaceJoin', (message: SpaceJoinReceiveEvent)=>
            setCurrentEnrolledUserList((prevData)=> [...prevData,message.dto])
        )
        emitter.on('spaceOut', (message:SpaceOutReceiveEvent) =>{
            setCurrentEnrolledUserList((prevData)=> prevData.filter(prevData => prevData.id !== message.dto.id))
        })

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
        // 사용자 목록 받아오기
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/space/users?spaceId=${space}`, {withCredentials:true})
            .then(response => {
                if(response.status ===200){
                    setCurrentEnrolledUserList(response.data);
                }
            })


        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/channel?spaceId=${space}`, {withCredentials:true})
            .then(response => {
               if(response.status ===200){
                   setData(response.data);
               }
            })

        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/space/info?spaceId=${space}`, {withCredentials:true})
            .then(response => {
                if(response.status ===200){
                    setUserSpaceInfo(response.data);
                }
            })

        return ()=>{
            emitter.off('channelCreate')
            emitter.off('channelUpdate')
            emitter.off('channelDelete')
            emitter.off('spaceJoin')
            emitter.off('spaceOut')
        }
    }, []);


    // PC/모바일 구분 없이 위아래 화살표로 통일 - 애니메이션 효과 추가
    const renderToggleIcon = () => {
        const baseClass = "w-5 h-5 transition-transform duration-300 ease-in-out";
        return showSidebar ? (
            <ChevronDoubleUpIcon className={`${baseClass} transform rotate-0`} />
        ) : (
            <ChevronDoubleDownIcon className={`${baseClass} transform rotate-0`} />
        );
    };

    const parentComponentStyle = isParent ? "" : "hidden md:block"
    const childComponentStyle = isParent ?  "hidden md:block" : ""

    return (


        <div className={`w-full h-full flex flex-col md:flex-row`}>
            {/* 사이드바 전체 */}
            <div className={`${parentComponentStyle} w-full rounded-br-md md:w-80 lg:bg-[#f77915] bg-[#f77915]/90 flex flex-col`}>

                {/*방 정보*/}
                <div className=" bg-[#f77915]  flex p-4  items-center gap-2">
                    <div className="text-white text-center font-bold text-2xl mb-1">{userSpaceInfo?.name}</div>
                    <SpaceInfo isUser={userSpaceInfo?.mine === true ? true : false }/>
                </div>

                {/* 헤더 */}
                <div className="flex items-center justify-between p-4">
                    <div className=" text-white text-3sm font-extrabold flex align-middle items-center gap-2">
                        채널 목록
                        <button
                            onClick={() => setShowSidebar((prev) => !prev)}
                            className="transition-all duration-200 hover:bg-white hover:text-neutral-600 rounded p-1"
                        >
                            {renderToggleIcon()}
                        </button>
                    </div>
                    <button
                        onClick={() => router.push(`/space/${space}/main/create`)}
                        className="inline-flex  items-center justify-center rounded font-medium leading-none  outline-none outline-offset-1 hover:bg-mauve3 focus-visible:outline-2 focus-visible:outline-violet6 select-none">
                        <PlusIcon className={"font-bold text-white w-6 "}/>
                    </button>
                </div>

                {/* 본문 */}
                <div
                    ref={contentRef}
                    className={`px-4 pb-4 overflow-hidden transition-all duration-500 ease-in-out ${
                        showSidebar
                            ? 'max-h-96 opacity-100'
                            : 'max-h-0 opacity-0'
                    }`}
                    style={{
                        transform: showSidebar ? 'translateY(0)' : 'translateY(-20px)',
                        transition: 'all 0.3s ease-in-out'
                    }}
                >
                    <div className="overflow-auto min-h-50">
                        <ChannelList data={data}/>
                    </div>
                </div>
            </div>

            {/* 메인 콘텐츠 */}
            <div className={`${childComponentStyle} flex-4 min-h-0 overflow-y-hidden`}>{children}</div>

            {/* 사용자 목록 컴포넌트 */}
            <div className={`${parentComponentStyle} flex-1 w-full h-full bg-[#f77915]/90 flex flex-col`}>
                {/* 헤더: 사용자 목록 제목 + 토글 버튼 */}
                <div className="flex items-center justify-between p-4">
                    <div className="text-white text-lg font-extrabold">사용자 목록</div>
                </div>

                {/* 사용자 목록 본문 */}
                {showUserList && (
                    <div className="flex-grow overflow-auto">
                        <SpaceUserList userList={currentEnrolledUserList} />
                    </div>
                )}
            </div>

        </div>
    );
}
