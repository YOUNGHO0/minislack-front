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

    return <div className={"font-bold"} onClick={()=>{router.push(target)}}>{channelInfo.channelName}</div>;

};