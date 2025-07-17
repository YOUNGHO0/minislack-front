'use client'
import {useParams, usePathname, useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import axios, {HttpStatusCode} from "axios";
import {Space} from "@/types/channel";
import {Button, Heading} from "@radix-ui/themes";
import SpaceJoinDialog from "@/app/component/space/join/SpaceJoinDialog";
import * as React from "react";

export default  ()=> {
    const {space} = useParams();
    const path = usePathname();
    const [userSpaceInfo, setUserSpaceInfo] = useState<Space>();
    const router = useRouter()
    const [openCodeDialog, setOpenCodeDialog] = useState<boolean>(false);
    const joinWithInviteCode = (inviteCode: string): Promise<void> => {
        if (!userSpaceInfo) {
            return Promise.reject(new Error("userSpaceInfo is undefined"));
        }
        return axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/space/join?id=${userSpaceInfo.id}&inviteCode=${inviteCode}`
            ,{withCredentials: true}).then(response => {
            if (response.status === 200) {
                router.push(`/space/${userSpaceInfo.id}`);
            }
        }).catch(error => {
            if(error.response?.status == HttpStatusCode.Conflict){
                router.push(`/space/${userSpaceInfo.id}/main`);
                return Promise.resolve();
            }
            return Promise.reject(error);
        });
    };

    useEffect(() => {
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/space/info?spaceId=${space}`, {withCredentials: true})
            .then(response => {
                if (response.status === 200) {
                    setUserSpaceInfo(response.data);
                }
            })
            .catch((res)=>{
                if(res.status == HttpStatusCode.Unauthorized) {
                    const currentUrl = window.location.pathname + window.location.search;
                    document.cookie = `redirect=${encodeURIComponent(currentUrl)}; path=/`;
                    router.push(`/login?redirect=${path}`)
                }
                else{
                     router.push("/404")
                }
            })

    }, []);

    const checkJoin = (space:Space|undefined)=>{
        if (!space) return; // space가 undefined면 아무 동작도 하지 않음
        if(userSpaceInfo?.codeRequired){
            if(code === null){
                setOpenCodeDialog(true);
            }
            else{
                joinWithInviteCode(code);
            }

        }
        else{
            joinWithInviteCode("").catch((res)=>{
                if(res.status === HttpStatusCode.Conflict){
                    router.push(`/space/${userSpaceInfo?.id}/main`);
                }
            })
        }
    }

    return (
        <div className="px-4 sm:px-6 lg:px-[30%] py-10  w-full ">
            <div className="flex flex-col gap-2">
                <SpaceJoinDialog
                    open={openCodeDialog}
                    joinWithInviteCode={joinWithInviteCode}
                    close={() => {
                        setOpenCodeDialog(false);
                    }}
                />
                <Heading className="pb-5">채팅방 초대</Heading>
                <div className={"flex"}>
                    입장하기를 클릭하면
                    <div className={"font-bold pl-2 pr-2"}>{userSpaceInfo?.name}</div>
                    에 입장합니다
                </div>
                <div>
                    버튼을 눌러 Echat을 시작해 보세요!
                </div>
                <div className="w-full flex mt-10">
                    <Button style={{marginLeft:"auto" ,marginRight:"10px"}} onClick={() => checkJoin(userSpaceInfo)}>
                        입장하기
                    </Button>
                </div>
            </div>
        </div>
    );
}