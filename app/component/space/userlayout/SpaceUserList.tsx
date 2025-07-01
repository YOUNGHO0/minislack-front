import {User} from "@/types/type";
import {Avatar} from "@radix-ui/themes";
import React from "react";

export default ({ userList }: { userList: User[] }) => {
    return (
        <div className="flex flex-col gap-2 p-4">
            {userList.map((user) => (
                <div key={user.id} className="flex gap-2 gap-x-4 items-center text-sm">
                    <Avatar
                        size={"2"}
                        variant="solid"
                        fallback={user?.nickName[0] || 'U'}
                        className="w-3 h-3" // 크기 조절
                    />
                    <div className=" font-bold">{user.nickName}</div>
                </div>
            ))}
        </div>
    );
};