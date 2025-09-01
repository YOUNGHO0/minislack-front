import {User} from "@/types/type";
import React from "react";
import ChatAvatar from "@/app/component/avatar/ChatAvatar";

export default ({userList}: { userList: User[] }) => {
    return (
        <div className="flex flex-col gap-2 p-4 ">
            {userList.map((user) => (
                <div key={user.id} className="text-white flex gap-2 gap-x-4 items-center rounded text-sm ">
                    <ChatAvatar
                        size={"1"}
                        variant="solid"
                        name={user?.nickName[0]}
                        className="w-3 h-3" // 크기 조절
                    />
                    <div className="text-white font-bold">{user.nickName}</div>
                </div>
            ))}
        </div>
    );
};