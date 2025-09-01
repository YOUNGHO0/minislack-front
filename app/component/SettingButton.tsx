'use client'
import {usePathname, useRouter} from "next/navigation";
import {Cog8ToothIcon} from "@heroicons/react/16/solid";

export default () => {

    const router = useRouter();
    const pathname = usePathname();

    const segments = pathname.split("/");
    const basePath = segments.length >= 3 ? `/${segments[1]}/${segments[2]}` : "/";
    const handleClick = () => {
        router.push(`${basePath}/setting`);
    };

    return (
        <>
            <Cog8ToothIcon className="w-8" onClick={handleClick}/>
        </>);

}