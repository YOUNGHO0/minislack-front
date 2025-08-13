'use client'
import {useParams, useRouter} from "next/navigation";
import MessageCard from "@/app/component/message/MessageCard";
import {Box} from "@radix-ui/themes";
import {useEffect, useLayoutEffect, useRef, useState} from "react";
import emitter from '@/WebSocket/Emitter'
import {JsonReceivedMessageInfo} from "@/types/webSocketType";
import {ChannelInfo, MessagePageResponse, ReceivedMessage} from "@/types/type";
import axios from "axios";
import ChannelSetting from "@/app/component/channel/ChannelSetting";
import {
    ChannelDeleteReceiveEvent,
    ChannelUpdateReceiveEvent,
    ChatCreateReceiveEvent,
    ChatCreateSendEvent,
    ChatDeleteReceiveEvent,
    ChatUpdateReceiveEvent
} from "@/types/events";
import {useWebSocket} from "@/WebSocket/WebSocketProvider";
import JoinDialog from "@/app/component/channel/joindialog/JoinDialog";
import MessageReplyBar from "@/app/component/message/MessageReplyBar";
import Container from "@mui/material/Container";
import './style.css'
import {text} from "node:stream/consumers";
import MessageList from "@/app/component/message/MessageList";
import MessageInput from "@/app/component/message/MessageInput";
import TextEditor from "@/app/component/message/quill/TextEditor";

export default () => {

    const [messages, setMessages] = useState<ReceivedMessage[]>([]);
    const [isUpdateShow, setIsUpdateShow] = useState(false);
    const params = useParams();
    const channelId = params.channel;
    const space = params.space;
    const [channelName, setChannelName] = useState("");
    const router = useRouter();
    const [mine, setMine] = useState(false)
    const [replyMessageId, setReplyMessageId] = useState<number | null>(null);

    const channelHeaderRef = useRef<HTMLDivElement>(null);
    const [channelHeaderHeight, setChannelHeaderHeight] = useState(0);


    useEffect(() => {
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/channel/info?spaceId=${space}&channelId=${channelId}`, {withCredentials: true})
            .then((response) => {
                let info: ChannelInfo = response.data
                setMine(info.mine);
                setChannelName(info.name);
            })

    }, []);


    // 채널 관련 UseEffect
    useEffect(() => {
        const handleChannelUpdate = (message: ChannelUpdateReceiveEvent) => {
            if (message.id === Number(channelId)) {
                setChannelName(message.channelName);
            }
        };

        const handleChannelDelete = (message: ChannelDeleteReceiveEvent) => {
            if (message.id === Number(channelId)) {
                alert("이 채널은 삭제되었습니다.");
                router.push(`/space/${params.space}/main`);
            }
        };


        emitter.on("channelUpdate", handleChannelUpdate);
        emitter.on("channelDelete", handleChannelDelete);

        return () => {
            emitter.off("channelUpdate", handleChannelUpdate);
            emitter.off("channelDelete", handleChannelDelete);
        };
    }, [channelId]);


    useEffect(() => {
        const observer = new ResizeObserver(() => {
            if (channelHeaderRef.current) {
                setChannelHeaderHeight(channelHeaderRef.current.offsetHeight);
            }
        });

        if (channelHeaderRef.current) {
            observer.observe(channelHeaderRef.current);
            // 초기값도 세팅
            setChannelHeaderHeight(channelHeaderRef.current.offsetHeight);
        }

        return () => observer.disconnect();
    }, []);




    return <div className="flex flex-col bg-white-100"
                style={{
                    // height: `calc(100dvh - ${ keyboardHeight}px)`,
                    height: `100dvh`,
                    transition: "height 1s ease",
                }}
    >
        <div className="flex w-full text-white text-sm  bg-[#f77915] py-1 px-2 font-bold items-center gap-2"
             ref={channelHeaderRef}
        >
            {channelName}
            <ChannelSetting mine={mine} openWindow={() => {
                setIsUpdateShow(true)
            }} closeWindow={() => {
                setIsUpdateShow(false)
            }} channelId={Number(channelId)}></ChannelSetting>
        </div>


        {/* 메시지 영역 */}
        <MessageList messages={messages} setMessages={setMessages} replyMessageId={replyMessageId} setReplyMessageId={(number)=>setReplyMessageId(number)}></MessageList>

        {/* 입력창 영역 */}
        <TextEditor replyMessageId={replyMessageId} setReplyMessageId={setReplyMessageId} messages={messages}></TextEditor>
    </div>
}