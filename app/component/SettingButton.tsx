'use client'
import {redirect, usePathname} from "next/navigation";
import {Cog8ToothIcon} from "@heroicons/react/16/solid";

export default ()=>{

    const pathname = usePathname(); // e.g., "/2/setting"

    const handleClick = () => {
        const parts = pathname.split('/');
        const base = parts[1]; // "2"
        redirect(`/${base}/setting`);
    };

    return(
    <>
        <Cog8ToothIcon className="w-8" onClick={handleClick}/>
    </>);

}