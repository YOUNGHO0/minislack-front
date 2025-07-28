'use client'
import axios, {AxiosResponse} from "axios";
import {useParams, usePathname, useRouter} from "next/navigation";
import {useEffect} from "react";
import {AppRouterInstance} from "next/dist/shared/lib/app-router-context.shared-runtime";
import {checkUserAuth} from "@/utils/auth"


export default ()=>{
    const router = useRouter();
    const pathname = usePathname();
    useEffect(() => {
        checkUserAuth(router, pathname);
    }, []);

}