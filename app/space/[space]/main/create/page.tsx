'use client';

import * as React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { User } from "@/types/type";
import axios from "axios";
import {useParams, usePathname, useRouter} from "next/navigation";
import { useWebSocket } from "@/WebSocket/WebSocketProvider";
import { ChannelCreateSendEvent } from "@/types/events";

import {
    Button,
    Checkbox,
    Flex,
    Text,
    Heading,
    Box,
    ScrollArea,
    TextField,
} from "@radix-ui/themes";

const ChannelCreatePage = () => {
    const router = useRouter();
    const path = usePathname();
    const [selectedUsers, setSelectedUsers] = React.useState<User[]>([]);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [userList, setUserList] = React.useState<User[]>([]);
    const [isPrivate, setIsPrivate] = React.useState(false);
    const [isExternalBlocked, setIsExternalBlocked] = React.useState(false);
    const channelNameRef = React.useRef<HTMLInputElement>(null);
    const { sendMessage } = useWebSocket();
    const { space } = useParams();

    React.useEffect(() => {
        axios
            .get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/space/users/without?spaceId=${space}`, {
                withCredentials: true,
            })
            .then((res) => {
                setUserList(res.data);
            });
    }, [space]);

    const filteredUsers = userList.filter(user =>
        user.nickName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleUser = (user: User) => {
        const isSelected = selectedUsers.some(selected => selected.id === user.id);
        if (isSelected) {
            setSelectedUsers(selectedUsers.filter(selected => selected.id !== user.id));
        } else {
            setSelectedUsers([...selectedUsers, user]);
        }
    };

    const removeUser = (userId: number) => {
        setSelectedUsers(selectedUsers.filter(user => user.id !== userId));
    };

    const createChannel = () => {
        const userIds: number[] = selectedUsers.map((user) => user.id);

        if (channelNameRef.current && channelNameRef.current.value) {

            axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/channel/create?spaceId=${space}`,
                { name: channelNameRef.current.value,
                userList: userIds,
                privateChannel: isPrivate,
                externalBlocked: isExternalBlocked},
                {withCredentials : true})
                .then(res =>{
                    const newPath = path.replace(/\/create$/, '') + "/" + res.data;
                    router.push(newPath);
                })
        } else {
            console.error("채널 이름이 비어있거나 null입니다.");
        }
    };

    return (
        <Box style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '40px', paddingBottom: '40px', paddingLeft: '16px', paddingRight: '16px' }}>
            <Heading as="h1" size="6" mb="5">
                Create New Channel
            </Heading>

            {/* 채널명 입력 */}
            <Box mb="4">
                <Text as="label" size="2" weight="medium" color="violet" mb="1" style={{ display: 'block' }}>
                    Channel Name
                </Text>
                <TextField.Root ref={channelNameRef} placeholder="Channel Name" />
            </Box>

            {/* 채널 옵션 */}
            <Box mb="4">
                <Text size="2" weight="medium" color="violet" mb="2" style={{ display: 'block' }}>
                    Channel Options
                </Text>

                <Flex direction="column" gap="2">
                    <Flex align="center" gap="2">
                        <Checkbox
                            checked={isExternalBlocked}
                            onCheckedChange={(checked) => setIsExternalBlocked(checked === true)}
                            disabled={isPrivate}
                        />
                        <Text size="2">외부 참여 불가</Text>
                        {isPrivate && (
                            <Text size="1" color="gray">
                                (비공개 채널에서는 자동 적용됨)
                            </Text>
                        )}
                    </Flex>

                    <Flex align="center" gap="2">
                        <Checkbox
                            checked={isPrivate}
                            onCheckedChange={(checked) => {
                                const newIsPrivate = checked === true;
                                setIsPrivate(newIsPrivate);
                                if (newIsPrivate) setIsExternalBlocked(true);
                            }}
                        />
                        <Text size="2">비공개 채널</Text>
                    </Flex>
                </Flex>
            </Box>

            {/* 사용자 검색 */}
            <Box mb="4">
                <Text as="label" size="2" weight="medium" color="violet" mb="1" style={{ display: 'block' }}>
                    Search Users
                </Text>
                <TextField.Root
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </Box>

            {/* 선택된 사용자 */}
            {selectedUsers.length > 0 && (
                <Flex wrap="wrap" gap="2" p="2" mb="4" style={{ backgroundColor: 'var(--gray-2)', borderRadius: '6px' }}>
                    {selectedUsers.map((user) => (
                        <Flex
                            key={user.id}
                            align="center"
                            gap="1"
                            style={{
                                backgroundColor: 'var(--violet-9)',
                                color: 'white',
                                fontSize: '14px',
                                paddingLeft: '8px',
                                paddingRight: '8px',
                                paddingTop: '4px',
                                paddingBottom: '4px',
                                borderRadius: '9999px'
                            }}
                        >
                            <Text style={{ color: 'white' }}>{user.nickName}</Text>
                            <Box
                                asChild
                                style={{
                                    cursor: 'pointer',
                                    padding: '4px',
                                    borderRadius: '9999px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                onClick={() => removeUser(user.id)}
                            >
                                <button style={{ background: 'none', border: 'none', color: 'inherit' }}>
                                    <XMarkIcon style={{ width: '12px', height: '12px' }} />
                                </button>
                            </Box>
                        </Flex>
                    ))}
                </Flex>
            )}

            {/* 사용자 리스트 */}
            <Box mb="6">
                <ScrollArea
                    type="auto"
                    style={{
                        maxHeight: '200px',
                        border: '1px solid var(--violet-6)',
                        borderRadius: '6px'
                    }}
                >
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => {
                            const isSelected = selectedUsers.some((u) => u.id === user.id);
                            return (
                                <Flex
                                    key={user.id}
                                    align="center"
                                    gap="3"
                                    px="3"
                                    py="2"
                                    style={{
                                        cursor: 'pointer',
                                        borderBottom: '1px solid var(--gray-6)',
                                        backgroundColor: isSelected ? 'var(--violet-3)' : 'transparent'
                                    }}
                                    onClick={() => toggleUser(user)}
                                    onMouseEnter={(e) => {
                                        if (!isSelected) {
                                            e.currentTarget.style.backgroundColor = 'var(--violet-2)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isSelected) {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }
                                    }}
                                >
                                    <Checkbox checked={isSelected}  />
                                    <Text size="2">{user.nickName}</Text>
                                </Flex>
                            );
                        })
                    ) : (
                        <Box style={{ textAlign: 'center', padding: '12px 0' }}>
                            <Text color="gray">No users found</Text>
                        </Box>
                    )}
                </ScrollArea>
            </Box>

            {/* 생성 버튼 */}
            <Flex justify="end">
                <Button onClick={createChannel} color="green" radius="full">
                    Create Channel
                </Button>
            </Flex>
        </Box>
    );
};

export default ChannelCreatePage;