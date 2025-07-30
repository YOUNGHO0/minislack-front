'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Button, Card, TextField, Text, TextArea } from '@radix-ui/themes';
import CardContent from '@mui/material/CardContent';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {UserInfo} from "@/types/type";

type FeedbackPageProps = {
    isLoggedIn: boolean;
    userEmail?: string;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function FeedbackPage() {
    const [email, setEmail] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isLoggedIn,setIsLoggedIn] = useState(false);
    const router = useRouter();

    useEffect(() => {
            axios.get<UserInfo>(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/info`,{withCredentials:true}).then(res=>{
                setEmail(res.data.email);
                setIsLoggedIn(true);
            })
    }, []);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [content]);

    const handleSubmit = async () => {
        setError(null);
        setSuccess(false);

        if (!emailRegex.test(email)) {
            setError('올바른 이메일 형식이 아닙니다.');
            return;
        }

        if (content.trim().length === 0) {
            setError('피드백 내용을 입력해주세요.');
            return;
        }

        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/v1/feedback`,
                { email:email, content:content },
                { withCredentials: true }
            );

            setSuccess(true);
            setContent('');
            if (!isLoggedIn) setEmail('');
        } catch (err) {
            console.error(err);
            setError('피드백 제출 중 문제가 발생했습니다.');
        }
    };

    return (
        <div className="flex flex-col sm:px-6 lg:px-[15%] py-4 px-2">
            <main className="w-full justify-center flex flex-col">
                <Card>
                    <CardContent className="p-6 space-y-6 mx-2">
                        {/* 이메일 */}
                        <div className="flex flex-col gap-2">
                            <Text as="label" size="2" weight="medium">이메일</Text>
                            <TextField.Root
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                readOnly={isLoggedIn}
                                placeholder="you@example.com"
                                className="bg-gray-100"
                            />
                        </div>

                        {/* 내용 */}
                        <div className="flex flex-col gap-2">
                            <Text as="label" size="2" weight="medium">피드백 내용</Text>
                            <TextArea
                                ref={textareaRef}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="불편한 점이나 건의사항을 입력해주세요."
                                rows={3}
                                className="resize-none overflow-hidden"
                            />
                        </div>
                        <div>
                            {error && <Text color="red" size="2">{error}</Text>}
                            {success && <Text color="green" size="2">피드백이 성공적으로 제출되었습니다.</Text>}
                        </div>

                        {/* 제출 버튼 */}
                        <Button onClick={handleSubmit}>제출하기</Button>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
