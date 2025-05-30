
import {Channel} from "@/types/channel";
import ChannelList from "@/app/component/channellist/ChannelList";

import {PlusIcon} from "@heroicons/react/24/outline";
import {Box} from "@radix-ui/themes";
import ChannelAddDialog from "@/app/component/ChannelAddDialog";
export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {

    let data: Channel[] = [
        { id: 1, channelName: "hello talk" },
        { id: 2, channelName: "hi good" },
        { id: 3, channelName: "good better" }
    ];
    return (


        <div className={"w-full h-full flex"}>
            <div className={"bg-neutral-300 h-full p-10 w-80"}>
                <div className={"flex justify-between"}>
                    <div className={"text-lg font-extrabold"}>Channel List</div>
                    <ChannelAddDialog/>
                </div>
                <div className={"py-6 px-1 "}>
                    <ChannelList data={data}></ChannelList>
                </div>
            </div>
            {children}
        </div>


    );
}
