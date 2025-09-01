'use client';

import * as React from 'react';
import {useEffect, useState} from 'react';
import {Button, Flex, Text, TextField} from '@radix-ui/themes';
import {useRouter} from "next/navigation";
import axios from "axios";
import {UserInfo} from "@/types/type";

const NicknameEditPage = () => {
    const [currentNickname, setCurrentNickname] = useState('기존닉네임');
    const [newNickname, setNewNickname] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const handleChange = () => {
        if (newNickname.trim() === '') {
            setError('닉네임은 공백일 수 없습니다.');
            return;
        }

        axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/change/nickname?nickname=${newNickname}`, {}, {withCredentials: true})
            .then(() => router.back())
            .catch(() => setError('닉네임은 공백일 수 없습니다.'))
        // 실제 변경 처리 (API 호출 등)
        setCurrentNickname(newNickname);
    };

    useEffect(() => {
        axios.get<UserInfo>(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/info`, {withCredentials: true}).then((res) => {
            setCurrentNickname(res.data.nickName);
        })
    }, []);

    return (
        <Flex direction="column" gap="4" px="4" py="6" maxWidth="400px" mx="auto">
            <Text size="5" weight="bold">닉네임 변경</Text>

            <Flex direction="column" gap="1">
                <Text size="2" color="gray">현재 닉네임</Text>
                <Text>{currentNickname}</Text>
            </Flex>

            <Flex direction="column" gap="1">
                <Text size="2" color="gray">새 닉네임</Text>
                <TextField.Root
                    placeholder="새 닉네임 입력"
                    value={newNickname}
                    onChange={(e) => setNewNickname(e.target.value)}
                >
                </TextField.Root>
                {error && <Text color="red" size="1">{error}</Text>}
            </Flex>

            <Button onClick={handleChange} color="blue">
                변경
            </Button>
        </Flex>
    );
};

export default NicknameEditPage;
