"use client";

import { useState } from "react";
import { Channel } from "@/types/channel";
import ChannelList from "@/app/component/channellist/ChannelList";
import ChannelAndAddButton from "@/app/component/channellist/ChannelAddDialog";

import {
    ChevronDoubleUpIcon,
    ChevronDoubleDownIcon,
} from "@heroicons/react/24/outline";

export default function RootLayout({
                                       children,
                                   }: Readonly<{ children: React.ReactNode }>) {
    const [showSidebar, setShowSidebar] = useState(true);

    const data: Channel[] = [
        { id: 1, name: "hello talk" },
        { id: 2, name: "hi good" },
        { id: 3, name: "good better" },
    ];

    // PC/모바일 구분 없이 위아래 화살표로 통일
    const renderToggleIcon = () => {
        const baseClass = "w-5 h-5";
        return showSidebar ? (
            <ChevronDoubleUpIcon className={baseClass} />
        ) : (
            <ChevronDoubleDownIcon className={baseClass} />
        );
    };

    return (
        <div className="w-full h-full flex flex-col md:flex-row">
            {/* 사이드바 전체 */}
            <div className="w-full md:w-80 bg-neutral-300 flex flex-col">
                {/* 헤더 */}
                <div className="flex items-center justify-between p-4">
                    <div className="text-lg font-extrabold flex items-center gap-2">
                        Channel List
                        <button onClick={() => setShowSidebar((prev) => !prev)}>
                            {renderToggleIcon()}
                        </button>
                    </div>
                    <ChannelAndAddButton />
                </div>

                {/* 본문 */}
                {showSidebar && (
                    <div className="px-4 pb-4 flex-grow overflow-auto">
                        <ChannelList data={data} />
                    </div>
                )}
            </div>

            {/* 메인 콘텐츠 */}
            <div className="flex-1 min-h-0">{children}</div>
        </div>
    );
}
