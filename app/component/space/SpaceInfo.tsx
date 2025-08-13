import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {ClipboardCopyIcon, PersonIcon, ExitIcon, HamburgerMenuIcon, Link2Icon} from "@radix-ui/react-icons";
import * as React from "react";
import {useState} from "react";
import SpaceExitDialog from "@/app/component/space/SpaceExitDialog";
import SpaceUserExitErrorDialog from "@/app/component/space/SpaceUserExitErrorDialog";
import axios from "axios";
import {useParams, useRouter} from "next/navigation";
import AdminChangeDialog from "@/app/component/space/adminchange/AdminDialog";
import SpaceInviteDialog from "@/app/component/space/invite/SpaceInviteDialog";

export default ({isUser } : {isUser:boolean}) => {
    const {space} = useParams();
    const [alertState , setAlertState] = useState(false);
    const [errorState , setErrorState] = useState(false);
    const [changeAdminState, setChangeAdminState] = useState(false);
    const [inviteState, setInviteState] = useState(false);
    const router = useRouter();
    const leaveSpace = ()=>{
        axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/space/leave`,
            {spaceId : space}, // 사용자 입력값 사용
            {
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(response => {
                if (response.status === 200) {
                    router.push(`/space`);
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
            <SpaceUserExitErrorDialog alertState={errorState} closeWindow={()=>setErrorState(false)}></SpaceUserExitErrorDialog>
            <SpaceExitDialog leave={leaveSpace}  alertState={alertState} closeWindow={()=>setAlertState(false)} ></SpaceExitDialog>
            <AdminChangeDialog open={changeAdminState} closeWindow={()=>setChangeAdminState(false)}></AdminChangeDialog>
            <SpaceInviteDialog closeWindow={()=>setInviteState(false)} open={inviteState} ></SpaceInviteDialog>
            <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                    <button
                        className="hover:bg-gray-200 hover:shadow-md font-bold text-white flex items-center justify-center w-8 h-8 rounded items-center">
                        <HamburgerMenuIcon className="w-6 h-6" />
                    </button>
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                    <DropdownMenu.Content
                        className="min-w-[160px] bg-white rounded-md border border-gray-200 shadow-lg p-1 z-50"
                        sideOffset={5}
                    >
                        <DropdownMenu.Item
                            className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-red-50 rounded cursor-pointer outline-none"
                            onSelect={(event) => {
                                setInviteState(true);
                            }}
                        >
                            <Link2Icon className="w-4 h-4" />
                            공유
                        </DropdownMenu.Item>
                        <DropdownMenu.Separator className="h-px bg-gray-200 my-1"/>
                        {isUser && (
                            <>
                            <DropdownMenu.Item
                                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-50 rounded cursor-pointer outline-none"
                                onSelect={(event) => {
                                    setChangeAdminState(true);
                                }}
                            >
                                <PersonIcon className="w-4 h-4" />
                                관리자 변경
                            </DropdownMenu.Item>
                            <DropdownMenu.Separator className="h-px bg-gray-200 my-1"/>
                            </>
                        )}

                        <DropdownMenu.Item
                            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded cursor-pointer outline-none"
                            onSelect={(event) => {
                                setAlertState(true);
                            }}
                        >
                            <ExitIcon className="w-4 h-4" />
                            방 나가기
                        </DropdownMenu.Item>



                    </DropdownMenu.Content>
                </DropdownMenu.Portal>
            </DropdownMenu.Root>
        </div>

    );
};