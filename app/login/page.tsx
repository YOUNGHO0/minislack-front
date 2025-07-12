'use client';
import React from 'react';
import GoogleIcon from "@/app/login/GoogleIcon";
import {Heading, Separator} from "@radix-ui/themes";
import {useSearchParams} from "next/navigation";

export default function LoginPage() {
    const handleGoogleLogin = () => {
        console.log('Google 로그인 클릭됨');
    };
    const searchParams = useSearchParams()
    const redirect = searchParams.get('redirect')
    const href = `${process.env.NEXT_PUBLIC_API_URL}/oauth2/authorization/google${redirect ? `?redirect=${redirect}` : ''}`

    return (
        <div className="w-full flex items-center justify-center">

            <div className="pt-10 px-5 w-full max-w-md flex flex-col justify-center">

                <Heading className="pb-5">로그인</Heading>
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
