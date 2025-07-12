'use client'
import axios, {AxiosResponse} from "axios";
import {useParams, usePathname, useRouter} from "next/navigation";
import {useEffect} from "react";

export default ()=>{
    const router = useRouter();
    const pathname = usePathname();
    useEffect(() => {
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user`,{withCredentials:true, headers:{"Content-Type":"application/json"}})
            .then((response:AxiosResponse) => {
                if(response.status !== 200) router.push(`${process.env.NEXT_PUBLIC_WEB_URL}/login`)
            })
            .catch(()=>{

                router.push(`${process.env.NEXT_PUBLIC_WEB_URL}/login?redirect=${pathname}`)})
    }, []);

}