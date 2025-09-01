'use client'
import {usePathname, useRouter} from "next/navigation";
import {useEffect} from "react";
import {checkUserAuth} from "@/utils/auth"


export default () => {
    const router = useRouter();
    const pathname = usePathname();
    useEffect(() => {
        checkUserAuth(router, pathname);
    }, []);

}