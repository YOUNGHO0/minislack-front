'use client'
import {useRouter} from "next/router";
import {router} from "next/client";

export const routeTo = (number: number, pathname: string, path: string) => {

    // pathname을 '/' 기준으로 분리
    const parts = pathname.split('/').filter(Boolean); // 빈 문자열 제거

    const baseParts = parts.slice(0, number );
    const base = '/' + baseParts.join('/');
    const targetPath = `${base}/${path}`;
    console.log(targetPath)
    return targetPath;
};