'use client';

import React, { Suspense } from 'react';
import GoogleIcon from "@/app/login/GoogleIcon";
import { Heading, Separator } from "@radix-ui/themes";
import { useSearchParams } from "next/navigation";
import {Text} from "@radix-ui/themes"
function LoginContent() {
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect');
    const href = `${process.env.NEXT_PUBLIC_API_URL}/oauth2/authorization/google${redirect ? `?redirect=${redirect}` : ''}`;

    return (
        <div className="w-full flex-col items-center justify-center">
            <div className="pt-10 px-5 w-full max-w-md flex flex-col justify-center">
                <Heading className="pb-5">로그인</Heading>
                <p className="text-xs">
                    편리한 서비스를 위해 로그인이 필요해요.
                </p>
                <p className=" text-xs pb-5">
                    구글 이메일만으로 간단히 가입할 수 있습니다.
                </p>
                <div className="flex items-center w-full pb-3">
                    <Separator className="flex-grow border-t border-gray-300"/>
                    <span className="text-sm px-3 text-gray-500 font-bold whitespace-nowrap">간편로그인</span>
                    <Separator className="flex-grow border-t border-gray-300"/>
                </div>
                <a href={href}>
                    <GoogleIcon/>
                </a>
            </div>
        </div>

    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginContent/>
        </Suspense>
    );
}
