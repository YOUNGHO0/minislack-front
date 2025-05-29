'use client'
import {BeakerIcon} from "@heroicons/react/24/outline";
import {redirect, usePathname} from "next/navigation";

export default ()=>{


    const pathname = usePathname(); // e.g., "/2/setting"

    const handleClick = () => {
        const parts = pathname.split('/');
        const base = parts[1]; // "2"
        redirect(`/${base}/question`);
    };

    return (
        <>
            <BeakerIcon className="w-8" onClick={handleClick}/>
        </>
    );
}