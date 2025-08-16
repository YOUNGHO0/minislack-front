'use client';

import * as React from 'react';
import Image from "next/image";
import {Button, Card, TextField, Text, Avatar} from '@radix-ui/themes';
import CardContent from '@mui/material/CardContent';
import {useEffect} from "react";
import axios from "axios";
import {UserInfo} from "@/types/type";
import {useRouter} from "next/navigation";


export default function ProfilePage() {
    const [nickname, setNickname] = React.useState("");
    const [email,setEmail] = React.useState("");
    const router = useRouter()
    const handleImageChange = () => {
        alert("준비중입니다.");
    };

    const handleNicknameChange = () => {
        router.push("/profile/change/nickname");
    };

    useEffect(() => {
        axios.get<UserInfo>(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/info`,{withCredentials : true}).then((res)=>{
            setNickname(res.data.nickName);
            setEmail(res.data.email);

        })
    }, []);

    return (
        <div className="flex flex-col sm:px-6 lg:px-[15%] py-4 px-2">
        <main className="w-full justify-center flex flex-col ">
            <Card>
                <CardContent className="p-6 space-y-6 mx-2">
                    {/* 프로필 이미지 */}
                    <div className="flex items-center gap-4">
                        <Avatar
                            src=""
                            fallback="A"
                        />
                        <Button ml={"auto"} variant="outline" onClick={handleImageChange}>프로필 이미지 변경</Button>
                    </div>

                    {/* 닉네임 */}
                    <div className="flex items-center gap-4">
                        <div className="w-20">닉네임</div>
                        <span className="flex-1">{nickname}</span>
                        <Button variant="outline" onClick={handleNicknameChange}>변경</Button>
                    </div>

                    {/* 이메일 */}
                    <div className="flex items-center gap-4">
                        <div className="w-20">이메일</div>
                        <TextField.Root readOnly value={email} className="flex-1 bg-gray-100" />
                    </div>
                </CardContent>


            </Card>
            {/* 탈퇴 버튼 */}
            <button className="flex text-xs">

                <Text color={"red"} onClick={()=>router.push("/delete")}>
                    탈퇴하기
                </Text>
            </button>

        </main>
        </div>
    );
}
