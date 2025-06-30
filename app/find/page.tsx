'use client'

import * as React from "react";
import {useEffect, useState} from "react";
import {Button, Heading} from "@radix-ui/themes";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {DotsVerticalIcon, Pencil1Icon, TrashIcon} from "@radix-ui/react-icons";
import axios from "axios";
import {Channel} from "@/types/channel";
import {useRouter} from "next/navigation";
import {SearchIcon} from "lucide-react";
import {HomeIcon} from "@radix-ui/react-icons";
import SpaceUpdateButton from "@/app/component/space/SpaceUpdateButton";
import SpaceJoinDialog from "@/app/component/space/join/SpaceJoinDialog";
import {channel} from "node:diagnostics_channel";
import {responseCookiesToRequestCookies} from "next/dist/server/web/spec-extension/adapters/request-cookies";

export default () => {

    const router = useRouter();
    const [channelList, setChannelList] = useState<Channel[]>([]);
    const [updateShow, setUpdateShow] = useState<boolean>(false);
    const [activeSpaceNumber, setActiveSpaceNumber] = useState(0);
    const [openCodeDialog, setOpenCodeDialog] = useState<boolean>(false);

    const fetchChannels = () => {
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/space/joinable`, {
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

    const handleJoin = (index : number)=>{
        setActiveSpaceNumber(index);
        if(channelList[index].codeRequired){
            setOpenCodeDialog(true);
        }
        else{
            joinWithInviteCode("").catch(()=>{console.log("hello")})

        }
    }


    const joinWithInviteCode = (inviteCode: string): Promise<void> => {
        return axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/space/join?id=${channelList[activeSpaceNumber].id}&inviteCode=${inviteCode}`
        ,{withCredentials: true}).then(response => {
            if (response.status === 200) {
                router.push(`/space/${channelList[activeSpaceNumber].id}`);
            }
        }).catch(error => {
            // 호출한 쪽에서 catch로 처리할 수 있도록 다시 던져줌
            return Promise.reject(error);
        });
    };


    return (
        <div className="px-4 sm:px-6 lg:px-[15%] py-10">
            <div className="flex items-center justify-between mb-6">
                <Heading className="flex-shrink-0 text-2xl font-semibold text-gray-900">
                    채팅방 찾기
                </Heading>
                <Button onClick={() => {
                    router.push('/space')
                }}
                        className="h-8 px-3 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 cursor-pointer">
                    <HomeIcon className="mr-2 w-4 h-4"/>
                    홈으로
                </Button>
            </div>

            <SpaceJoinDialog open={openCodeDialog} joinWithInviteCode={joinWithInviteCode} close={()=>{setOpenCodeDialog(false)}}/>

            {/* 반응형 그리드 레이아웃 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {channelList.map((channel: Channel,index : number) => (
                    <div
                        key={channel.id}
                        className="relative bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                        onClick={() => handleJoin(index)}>
                        {/* 채널 이름 */}
                        <div className="pr-8">
                            <h3 className="font-medium text-gray-900 truncate">
                                {channel.name}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                채널 • ID: {channel.id}
                            </p>
                        </div>

                    </div>
                ))}
                {channelList.length == 0 ? <div> 참가 가능한 방이 없습니다 </div> : <></>}
            </div>
        </div>
    );
}