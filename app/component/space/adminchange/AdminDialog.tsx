'use client'
import * as React from "react";
import {Dialog} from "radix-ui";
import {Cross2Icon} from "@radix-ui/react-icons";
import {User} from "@/types/type";
import axios from "axios";
import {useParams} from "next/navigation";
import {useWebSocket} from "@/WebSocket/WebSocketProvider";
import {useEffect} from "react";

const AdminChangeDialog = ({open, closeWindow} : {open : boolean , closeWindow : ()=>void } ) => {
    const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [userList, setUserList] = React.useState<User[]>([]);
    const {sendMessage} = useWebSocket();

    const { space } = useParams();

    const fetchUsers = () => {
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/space/users/without?spaceId=${space}`, { withCredentials: true })
            .then((res) => {
                setUserList(res.data);
            });
    };

    useEffect(() => {
        if (open) {
            fetchUsers(); // 외부에서 open이 true로 바뀔 때 실행됨
        } else {
            resetDialog(); // 닫힐 때 초기화
        }
    }, [open]);
    // 검색어에 따라 사용자 필터링
    const filteredUsers = userList.filter(user =>
        user.nickName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // 사용자 선택 (단일 선택)
    const selectUser = (user: User) => {
        setSelectedUser(user);
    };

    // 다이얼로그 초기화
    const resetDialog = () => {
        setSelectedUser(null);
        setSearchQuery("");
    };

    // 관리자 변경 처리
    const changeAdmin = () => {
        if (selectedUser) {
            axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/v1/space/yield`,
                {spaceId: space,userId: selectedUser.id}, // 사용자 입력값 사용
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
                // .then(()=>)
        }
    };

    return (
        <Dialog.Root open={open}
        >
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-gray-300/60 data-[state=open]:animate-overlayShow" />
                <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-md bg-gray1 p-[25px] shadow-[var(--shadow-6)] focus:outline-none data-[state=open]:animate-contentShow">
                    <Dialog.Title className="m-0 text-[17px] font-medium text-mauve12">
                        관리자 변경
                    </Dialog.Title>

                    <div className="mt-4 mb-6 text-[14px] text-mauve11">
                        새로운 관리자를 선택해주세요. 선택한 사용자가 새로운 관리자가 됩니다.
                    </div>

                    {/* 사용자 선택 섹션 */}
                    <fieldset className="mb-[15px] flex flex-col gap-3">
                        <label className="text-[15px] text-violet11">
                            사용자 선택
                        </label>

                        {/* 사용자 검색 */}
                        <input
                            className="inline-flex h-[35px] w-full items-center justify-center rounded px-2.5 text-[15px] leading-none text-violet11 shadow-[0_0_0_1px] shadow-violet7 outline-none focus:shadow-[0_0_0_2px] focus:shadow-violet8"
                            placeholder="사용자 검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />

                        {/* 선택된 사용자 표시 */}
                        {selectedUser && (
                            <div className="p-3 bg-violet3 border border-violet7 rounded-md">
                                <div className="text-[14px] text-mauve11 mb-1">선택된 사용자:</div>
                                <div className="text-[15px] font-medium text-mauve12">
                                    {selectedUser.nickName}
                                </div>
                            </div>
                        )}

                        {/* 사용자 목록 */}
                        <div className="max-h-[250px] overflow-y-auto border border-violet7 rounded-md">
                            {filteredUsers.map((user) => {
                                const isSelected = selectedUser?.id === user.id;
                                return (
                                    <div
                                        key={user.id}
                                        className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-violet2 border-b border-violet6 last:border-b-0 ${
                                            isSelected ? 'bg-violet3' : ''
                                        }`}
                                        onClick={() => selectUser(user)}
                                    >
                                        <input
                                            type="radio"
                                            checked={isSelected}
                                            onChange={() => {}}
                                            className="w-4 h-4 accent-violet9"
                                        />
                                        <div className="flex-1">
                                            <div className="text-[15px] font-medium text-mauve12">
                                                {user.nickName}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {filteredUsers.length === 0 && (
                                <div className="p-3 text-center text-mauve11">
                                    사용자를 찾을 수 없습니다
                                </div>
                            )}
                        </div>
                    </fieldset>

                    {/* 버튼 영역 */}
                    <div className="mt-[25px] flex justify-end gap-2">
                        <Dialog.Close asChild>
                            <button className="inline-flex h-[35px] items-center justify-center rounded bg-mauve4 px-[15px] font-medium leading-none text-mauve11 outline-none outline-offset-1 hover:bg-mauve5 focus-visible:outline-2 focus-visible:outline-mauve6 select-none"
                            onClick={closeWindow}
                            >
                                취소
                            </button>
                        </Dialog.Close>
                        <Dialog.Close asChild>
                            <button
                                onClick={changeAdmin}
                                disabled={!selectedUser}
                                className="inline-flex h-[35px] items-center justify-center rounded bg-violet9 px-[15px] font-medium leading-none text-white outline-none outline-offset-1 hover:bg-violet10 focus-visible:outline-2 focus-visible:outline-violet11 select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-violet9">
                                변경
                            </button>
                        </Dialog.Close>
                    </div>

                    <Dialog.Close asChild>
                        <button
                            className="absolute right-2.5 top-2.5 inline-flex size-[25px] appearance-none items-center justify-center rounded-full text-violet11 bg-gray3 hover:bg-violet4 focus:shadow-[0_0_0_2px] focus:shadow-violet7 focus:outline-none"
                            aria-label="Close"
                        >
                            <Cross2Icon />
                        </button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default AdminChangeDialog;