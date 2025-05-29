
import {Channel} from "@/types/channel";
import ChannelList from "@/app/component/channellist/ChannelList";

import {PlusIcon} from "@heroicons/react/24/outline";
export default function Home() {

    let data: Channel[] = [
        { id: 1, channelName: "hello talk" },
        { id: 2, channelName: "hi good" },
        { id: 3, channelName: "good better" }
    ];
    return (<></>
    );
}
