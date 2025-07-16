'use client'
import { Flex, Text, Button } from "@radix-ui/themes";
import {useContext, useEffect} from "react";
import mitt from 'mitt'
import {useWebSocket} from "@/WebSocket/WebSocketProvider";
import emitter from '../../../../WebSocket/Emitter'
export default ()=>{

    const { sendMessage } = useWebSocket();



    return(<div> <Button className={"text-red-500"}>hello</Button>
    </div>)
}