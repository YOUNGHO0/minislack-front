import { useEffect, useState } from "react";
import axios from "axios";
import { User } from "@/types/type";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Avatar } from "@radix-ui/themes";
import { useParams } from "next/navigation";

export default function UserTagPage({ onSelectUser }: { onSelectUser: (user: User) => void }) {
    const [userList, setUserList] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const { space } = useParams();

    useEffect(() => {
        axios
            .get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/space/users/without?spaceId=${space}`, {
                withCredentials: true,
            })
            .then((res) => {
                setUserList(res.data);
            });
    }, [space]);

    // 검색어에 맞는 사용자만 필터링
    const filteredUsers = userList.filter((user) =>
        user.nickName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-w-[220px] bg-white rounded-md border border-gray-200 shadow-lg p-2 z-50">
            <input
                type="text"
                placeholder="사용자 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full mb-2 px-2 py-1 border border-gray-300 rounded"
            />

            {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                    <div
                        key={user.id}
                        className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 cursor-pointer"
                        onClick={() => onSelectUser(user)}
                    >
                        <Avatar fallback={user.profile}/>
                        <span>{user.nickName}</span>
                    </div>
                ))
            ) : (
                <div className="px-2 py-1 text-gray-500 text-sm">검색 결과가 없습니다.</div>
            )}
        </div>

    );
};
