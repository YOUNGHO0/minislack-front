'use client'
import { Flex, Text, Button } from "@radix-ui/themes";
import {useContext, useEffect} from "react";
import mitt from 'mitt'
import {useWebSocket} from "@/WebSocket/WebSocketProvider";
import emitter from '../../../../WebSocket/Emitter'
export default ()=>{

    const { sendMessage } = useWebSocket();

    useEffect(() => {

        console.log("데이터 요청 코드 ")
        emitter.on('spaceIn', (msg) => console.log(msg + "진짜 호출됨"))
        return () => emitter.off('channel');
    }, []);




    return(<div> <Button className={"text-red-500"}>hello</Button>
    </div>)
}