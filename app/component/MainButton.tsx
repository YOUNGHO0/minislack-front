'use client'
import {HomeIcon} from "@heroicons/react/24/outline";
import {redirect, usePathname, useRouter} from "next/navigation";

export default function MainButton() {

    const router = useRouter();
    const pathname = usePathname();

    const segments = pathname.split("/");
    const basePath = segments.length >= 3  ? `/${segments[1]}/${segments[2]}` : "/";
    const handleClick = () => {
        router.push(`${basePath}/main`);
    };

    return (
        <HomeIcon className="w-8 cursor-pointer" onClick={handleClick} />
    );
}