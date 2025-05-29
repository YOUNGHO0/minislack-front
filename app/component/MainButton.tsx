'use client'
import {HomeIcon} from "@heroicons/react/24/outline";
import {redirect, usePathname} from "next/navigation";

export default function MainButton() {

    const pathname = usePathname(); // e.g., "/2/setting"

    const handleClick = () => {
        const parts = pathname.split('/');
        const base = parts[1]; // "2"
        redirect(`/${base}/main`);
    };

    return (
        <HomeIcon className="w-8 cursor-pointer" onClick={handleClick} />
    );
}