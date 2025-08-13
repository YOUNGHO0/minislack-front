'use client'
import { Channel } from "@/types/channel";
import {redirect, usePathname} from "next/navigation";
import {routeTo} from "@/utils/commonclient"
import {useRouter} from "next/navigation";

export default (props: { channel: Channel }) => {
    let channelInfo = props.channel;
    const router = useRouter();
    const pathname = usePathname(); // e.g., "/2/setting"
    const target = routeTo(2,pathname,`${channelInfo.id}`);
    const segments = pathname.split("/");
    const basePath = segments.length >= 3  ? `/${segments[1]}/${segments[2]}/${segments[3]}` : "/";
    const handleClick = () => {
        router.push(`${basePath}/${channelInfo.id}`);
    };


    return <div className={"text-white font-semibold"} onClick={handleClick}>{channelInfo.name}</div>;

};