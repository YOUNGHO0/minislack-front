'use client';
import React from 'react';
import GoogleIcon from "@/app/login/GoogleIcon";
import {Heading} from "@radix-ui/themes";

export default function LoginPage() {
    const handleGoogleLogin = () => {
        console.log('Google 로그인 클릭됨');
    };

    return (
        <div className="w-full flex items-center justify-center">
            <div className="pt-10 px-5 w-full max-w-md flex flex-col justify-center">
                <Heading className="pb-5">로그인</Heading>
                <GoogleIcon/>
            </div>
        </div>

    );
}
