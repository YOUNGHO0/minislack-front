'use client'
import {useEffect} from "react";
import {usePathname, useRouter} from "next/navigation";

export default () => {

    const pathname = usePathname();
    const router = useRouter();
    useEffect(() => {
        if (!pathname.endsWith("/main")) {
            router.replace(pathname + "/main");
        }
    }, []);

    return <></>
}