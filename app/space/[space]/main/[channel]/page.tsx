'use client'
import {useParams, useRouter} from "next/navigation";
import {useEffect, useRef, useState} from "react";
import emitter from '@/WebSocket/Emitter'
import {ChannelInfo, ReceivedMessage} from "@/types/type";
import axios from "axios";
import ChannelSetting from "@/app/component/channel/ChannelSetting";
import {ChannelDeleteReceiveEvent, ChannelUpdateReceiveEvent} from "@/types/events";
import './style.css'
import MessageList from "@/app/component/message/MessageList";
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
    const [keyboardHeight, setKeyboardHeight] = useState(0);
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


    // 키보드 높이 감지
    useEffect(() => {
        const visualViewport = window.visualViewport;
        let debounceTimeout: NodeJS.Timeout | null = null;

        const handleResize = () => {
            if (!visualViewport) return;
            const heightDiff = window.innerHeight - visualViewport.height;
            const threshold = 150;

            if (debounceTimeout) clearTimeout(debounceTimeout);

            // 키보드가 올라오는 중에 debounce
            debounceTimeout = setTimeout(() => {
                if (heightDiff > threshold) {
                    setKeyboardHeight(heightDiff);
                } else {
                    setKeyboardHeight(0);
                }
            }, 100); // 200ms 동안 이벤트 없으면 실행
        };

        if (visualViewport) {
            visualViewport.addEventListener("resize", handleResize);
            return () => {
                visualViewport.removeEventListener("resize", handleResize);
                if (debounceTimeout) clearTimeout(debounceTimeout);
            };
        }
    }, []);


    return <div className="flex flex-col bg-white-100"
                style={{
                    // height: `calc(100dvh - ${ keyboardHeight}px)`,
                    height: `100dvh`,
                    transition: "height 1s ease",
                }}
    >
        <div className="flex w-full text-white  text-sm  bg-[#f77915]/80 py-1 px-2 font-bold items-center gap-2"
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
        <MessageList messages={messages} setMessages={setMessages} replyMessageId={replyMessageId}
                     setReplyMessageId={(number) => setReplyMessageId(number)}></MessageList>

        {/* 입력창 영역 */}
        <TextEditor setKeyboardHeight={setKeyboardHeight} keyboardHeight={keyboardHeight}
                    replyMessageId={replyMessageId} setReplyMessageId={setReplyMessageId}
                    messages={messages}></TextEditor>
    </div>
}