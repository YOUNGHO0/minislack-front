'use client'
import {BeakerIcon} from "@heroicons/react/24/outline";
import {usePathname, useRouter} from "next/navigation";


export default () => {


    const router = useRouter();
    const pathname = usePathname();

    const segments = pathname.split("/");
    const basePath = segments.length >= 3 ? `/${segments[1]}/${segments[2]}` : "/";
    const handleClick = () => {
        router.push(`${basePath}/question`);
    };

    return (
        <>
            <BeakerIcon className="w-8" onClick={handleClick}/>
        </>
    );
}