'use client'
import {Channel} from "@/types/channel";
import ChannelName from "@/app/component/channellist/ChannelName";

export default (props: { data: Channel[] }) => {
    let result = props.data.map((p: Channel) => {

        return <div className={"p-1"} key={p.id}>
            <ChannelName channel={p}></ChannelName>
        </div>
    });
    return (
        <div>
            {result}
        </div>
    );
};
