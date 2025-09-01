import {useEffect, useState} from "react";
import {User} from "@/types/type";
import {Avatar} from "@radix-ui/themes";
import {useParams} from "next/navigation";

export default function UserTagPage({onSelectUser, searchTerm}: {
    onSelectUser: (user: User) => void,
    searchTerm: string
}) {
    const [userList, setUserList] = useState<User[]>([]);
    const {space} = useParams();

    // useEffect(() => {
    //     axios
    //         .get<User[]>(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/space/users/without?spaceId=${space}`, {
    //             withCredentials: true,
    //         })
    //         .then((res) => {
    //             setUserList(res.data);
    //         });ㄴ
    // }, [space]);

    useEffect(() => {
        // 샘플 데이터 20개 생성
        const sampleData: User[] = Array.from({length: 20}, (_, i) => ({
            id: i + 1,
            profile: i + 1,
            nickName: `사용자${i + 1}`,
        }));
        setUserList(sampleData);
    }, []);

    // 검색어에 맞는 사용자만 필터링
    const filteredUsers = userList.filter((user) =>
        user.nickName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-w-[220px] bg-white rounded-md border border-gray-200 shadow-lg p-2 z-50">
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
