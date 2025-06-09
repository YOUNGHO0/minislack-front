'use client'

import {useEffect, useState} from "react";
import {Button, Heading} from "@radix-ui/themes";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {DotsVerticalIcon, Pencil1Icon, TrashIcon} from "@radix-ui/react-icons";
import axios from "axios";

import SpaceCreateButton from "@/app/component/space/SpaceCreateButton";
import {Channel} from "@/types/channel";
import {router} from "next/client";
import {useRouter} from "next/navigation";
import {SearchIcon} from "lucide-react";
import SpaceUpdateButton from "@/app/component/space/SpaceUpdateButton";
import * as React from "react";

export default () => {

    const router = useRouter();
    const [channelList, setChannelList] = useState<Channel[]>([]);
    const [updateShow, setUpdateShow] = useState<boolean>(false);
    const [activeChannelNumber, setActiveChannelNumber] = useState(0);

    const fetchChannels = () => {
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/space`, {
            withCredentials: true // 쿠키 포함
        }).then((response) => {
            console.log(response.data);
            setChannelList(response.data); // 실제 데이터로 상태 업데이트
        }).catch((err) => {
            console.error("GET 요청 오류:", err);
        });
    };

    useEffect(() => {
        fetchChannels();
    }, []); // 빈 배열 -> 컴포넌트 마운트 시 1회만 실행

    const hideUpdate = () => {
        setUpdateShow(false);
    }


    const handleDelete = (channel: Channel) => {
        console.log("Delete channel:", channel);
        // 삭제 로직 구현
        if (confirm(`"${channel.name}" 채널을 삭제하시겠습니까?`)) {
            // 삭제 API 호출
            axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/space`, {
                data: {id: channel.id},
                withCredentials: true
            }).then((response) => {
                if (response.status === 200) {
                    fetchChannels(); // 삭제 후 목록 새로고침
                }
            });
        }
    };

    return (
        <div className="px-4 sm:px-6 lg:px-[15%] py-10">
            <div className="flex items-center justify-between mb-6">
                <Heading className="flex-shrink-0 text-2xl font-semibold text-gray-900">
                    방 목록
                </Heading>
                <Button onClick={() => {
                    router.push('/find')
                }}
                        className="h-8 px-3 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 cursor-pointer">
                    <SearchIcon className="mr-2 w-4 h-4"/>
                    채팅방 찾기
                </Button>
            </div>

            {/* 채널 업데이트 팝업 뜨는 메뉴 */}
            {
                updateShow && <SpaceUpdateButton channelInfo={channelList[activeChannelNumber]}
                                                 fetchChannel={fetchChannels}
                                                 hideUpdate={hideUpdate}></SpaceUpdateButton>
            }


            {/* 반응형 그리드 레이아웃 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {channelList.map((channel: Channel) => (
                    <div
                        key={channel.id}
                        className="relative bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                        onClick={() => router.push(`/space/${channel.id}`)}
                    >
                        {/* 채널 이름 */}
                        <div className="pr-8">
                            <h3 className="font-medium text-gray-900 truncate">
                                {channel.name}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                채널 • ID: {channel.id}
                            </p>
                        </div>

                        {/* 점 세개 드롭다운 메뉴 */}
                        <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild>
                                <button
                                    className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 transition-colors">
                                    <DotsVerticalIcon className="w-4 h-4 text-gray-500"/>
                                </button>
                            </DropdownMenu.Trigger>

                            <DropdownMenu.Portal>
                                <DropdownMenu.Content
                                    className="min-w-[160px] bg-white rounded-md border border-gray-200 shadow-lg p-1 z-50"
                                    sideOffset={5}
                                >
                                    <DropdownMenu.Item
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setUpdateShow(true)
                                        }}
                                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded cursor-pointer outline-none"
                                    >
                                        <Pencil1Icon className="w-4 h-4"/>
                                        변경
                                    </DropdownMenu.Item>

                                    <DropdownMenu.Separator className="h-px bg-gray-200 my-1"/>

                                    <DropdownMenu.Item
                                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded cursor-pointer outline-none"
                                        onClick={() => handleDelete(channel)}
                                    >
                                        <TrashIcon className="w-4 h-4"/>
                                        삭제
                                    </DropdownMenu.Item>
                                </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                    </div>
                ))}

                <div
                    className="bg-white rounded-lg border border-dashed border-gray-300 p-4 shadow-sm hover:shadow-md hover:border-gray-400 transition-all duration-200 flex items-center justify-center min-h-[80px]">
                    <SpaceCreateButton fetchChannel={fetchChannels}/>
                </div>
            </div>
        </div>
    );
}