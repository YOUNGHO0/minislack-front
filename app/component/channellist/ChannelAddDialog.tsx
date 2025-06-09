'use client'
import * as React from "react";
import { Dialog } from "radix-ui";
import { Cross2Icon } from "@radix-ui/react-icons";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { User } from "@/types/type";

const ChannelAddDialog = () => {
    const [selectedUsers, setSelectedUsers] = React.useState<User[]>([]);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [userList, setUserList] = React.useState<User[]>([]);

    const sampleUsers: User[] = [
        {
            id: 1,
            profile: 101,
            username: "김철수",
            email: "chulsoo.kim@example.com"
        },
        {
            id: 2,
            profile: 102,
            username: "이영희",
            email: "younghee.lee@example.com"
        },
        {
            id: 3,
            profile: 103,
            username: "박민수",
            email: "minsu.park@example.com"
        },
        {
            id: 4,
            profile: 104,
            username: "최지은",
            email: "jieun.choi@example.com"
        },
        {
            id: 5,
            profile: 105,
            username: "정우진",
            email: "woojin.jung@example.com"
        }
    ];

    const fetchUsers = () => {
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/space/users/without?spaceId=${space}`, { withCredentials: true })
            .then((res) => {
                setSampleUsers(res.data);
            });
    };
    // 검색어에 따라 사용자 필터링
    const filteredUsers = sampleUsers.filter(user =>
        user.nickName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // 사용자 선택/해제
    const toggleUser = (user: User) => {
        const isSelected = selectedUsers.some(selected => selected.id === user.id);
        if (isSelected) {
            setSelectedUsers(selectedUsers.filter(selected => selected.id !== user.id));
        } else {
            setSelectedUsers([...selectedUsers, user]);
        }
    };

    // 선택된 사용자 제거
    const removeUser = (userId: number) => {
        setSelectedUsers(selectedUsers.filter(user => user.id !== userId));
    };

    // 다이얼로그 초기화
    const resetDialog = () => {
        setSelectedUsers([]);
        setSearchQuery("");
    };

    return (
        <Dialog.Root
            onOpenChange={(open) => {
                if (open) {
                    fetchUsers(); // 다이얼로그 열릴 때 데이터 새로고침
                } else {
                    resetDialog(); // 닫힐 때 초기화
                }
            }}
        >
            <Dialog.Trigger asChild>
                <button className="inline-flex  items-center justify-center rounded font-medium leading-none  outline-none outline-offset-1 hover:bg-mauve3 focus-visible:outline-2 focus-visible:outline-violet6 select-none">
                    <PlusIcon className={"w-6 "} />
                </button>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-gray-300/60 data-[state=open]:animate-overlayShow" />
                <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-md bg-gray1 p-[25px] shadow-[var(--shadow-6)] focus:outline-none data-[state=open]:animate-contentShow">
                    <Dialog.Title className="m-0 text-[17px] font-medium text-mauve12">
                        Create New Channel
                    </Dialog.Title>

                    {/* 채널명 입력 */}
                    <fieldset className="pt-2 mb-[15px] flex flex-col ">
                        <label className="text-[15px] mb-2 text-violet11">
                            Channel
                        </label>
                        <input
                            className="inline-flex h-[35px] w-full items-center justify-center rounded px-2.5 text-[15px] leading-none text-violet11 shadow-[0_0_0_1px] shadow-violet7 outline-none focus:shadow-[0_0_0_2px] focus:shadow-violet8"
                            placeholder="Channel Name"

                        />
                    </fieldset>

                    {/* 사용자 추가 섹션 */}
                    <fieldset className="mb-[15px] flex flex-col gap-3">
                        <label className="text-[15px] text-violet11">
                            Add Members
                        </label>

                        {/* 사용자 검색 */}
                        <input
                            className="inline-flex h-[35px] w-full items-center justify-center rounded px-2.5 text-[15px] leading-none text-violet11 shadow-[0_0_0_1px] shadow-violet7 outline-none focus:shadow-[0_0_0_2px] focus:shadow-violet8"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />

                        {/* 선택된 사용자 태그들 */}
                        {selectedUsers.length > 0 && (
                            <div className="flex flex-wrap gap-2 p-2 bg-gray2 rounded-md min-h-[40px]">
                                {selectedUsers.map((user) => (
                                    <span
                                        key={user.id}
                                        className="inline-flex items-center gap-1 px-2 py-1 bg-violet9 text-white text-sm rounded-full"
                                    >
                                        {user.nickName}
                                        <button
                                            onClick={() => removeUser(user.id)}
                                            className="inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-violet10"
                                        >
                                            <XMarkIcon className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* 사용자 목록 */}
                        <div className="max-h-[200px] overflow-y-auto border border-violet7 rounded-md">
                            {filteredUsers.map((user) => {
                                const isSelected = selectedUsers.some(selected => selected.id === user.id);
                                return (
                                    <div
                                        key={user.id}
                                        className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-violet2 border-b border-violet6 last:border-b-0 ${
                                            isSelected ? 'bg-violet3' : ''
                                        }`}
                                        onClick={() => toggleUser(user)}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => {}}
                                            className="w-4 h-4 accent-violet9"
                                        />
                                        <div className="flex-1">
                                            <div className="text-[15px] font-medium text-mauve12">
                                                {user.nickName}
                                            </div>
                                            <div className="text-[13px] text-mauve11">
                                                {user.email}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {filteredUsers.length === 0 && (
                                <div className="p-3 text-center text-mauve11">
                                    No users found
                                </div>
                            )}
                        </div>
                    </fieldset>

                    <div className="mt-[25px] flex justify-end">
                        <Dialog.Close asChild>
                            <button className="inline-flex h-[35px] items-center justify-center rounded bg-green4 px-[15px] font-medium leading-none text-green11 outline-none outline-offset-1 hover:bg-green5 focus-visible:outline-2 focus-visible:outline-green6 select-none">
                                Create Channel
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

export default ChannelAddDialog;