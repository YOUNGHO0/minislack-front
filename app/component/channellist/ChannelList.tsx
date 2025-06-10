'use client'
import { Channel } from "@/types/channel";
import ChannelName from "@/app/component/channellist/ChannelName";
import {Separator} from "@radix-ui/themes";

export default (props: { data: Channel[] }) => {
    let result = props.data.map((p: Channel) => {

       return <div className={"p-1"} key={p.id}>
           <ChannelName channel={p}></ChannelName>
           <Separator orientation="horizontal" size="4" style={{marginTop:"4px"}}/>
       </div>
    });
    return (
        <div>
            {result}
        </div>
    );
};
