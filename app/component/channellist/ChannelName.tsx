'use client'
import { Channel } from "@/types/channel";
import { usePathname, useRouter } from "next/navigation";

export default (props: { channel: Channel }) => {
    const channelInfo = props.channel;
    const router = useRouter();
    const pathname = usePathname(); // e.g., "/space/671/main/109"
    const segments = pathname.split("/");

    // 현재 선택된 채널 ID (main 뒤의 값)
    const selectedChannelId = segments.length >= 5 ? segments[4] : null;

    // basePath: /space/671/main
    const basePath = segments.length >= 4
        ? `/${segments[1]}/${segments[2]}/${segments[3]}`
        : "/";

    const isActive = selectedChannelId === channelInfo.id.toString();

    const handleClick = () => {
        router.push(`${basePath}/${channelInfo.id}`);
    };

    return (
        <div
            className={`cursor-pointer px-3 py-2 rounded-md font-semibold transition-colors duration-200
                ${isActive
                ? "bg-white text-neutral-800"  // 선택된 경우: 밝은 배경 + 진한 글씨
                : "bg-transparent text-white hover:bg-neutral-200 hover:text-neutral-800"
            }`}
            onClick={handleClick}
        >
            {channelInfo.name}
        </div>
    );
};
