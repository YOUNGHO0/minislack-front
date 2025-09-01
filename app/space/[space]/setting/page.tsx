'use client'
import {Button} from "@radix-ui/themes";
import {useWebSocket} from "@/WebSocket/WebSocketProvider";

export default () => {

    const {sendMessage} = useWebSocket();


    return (<div><Button className={"text-red-500"}>hello</Button>
    </div>)
}