'use client'
import {useParams, useRouter} from "next/navigation";
import MessageCard from "@/app/component/message/MessageCard";
import {Box, Button, TextArea} from "@radix-ui/themes";
import {useEffect, useRef, useState} from "react";
import emitter from '@/WebSocket/Emitter'
import {JsonReceivedMessageInfo} from "@/types/webSocketType";
import {ChannelInfo, ReceivedMessage} from "@/types/type";
import axios from "axios";
import ChannelSetting from "@/app/component/channel/ChannelSetting";
import ChannelUpdateDialog from "@/app/component/channel/ChannelUpdateDialog";
import {
    ChannelDeleteReceiveEvent,
    ChannelUpdateReceiveEvent,
    ChatCreateReceiveEvent,
    ChatCreateSendEvent
} from "@/types/events";
import {useWebSocket} from "@/WebSocket/WebSocketProvider";

export default ()=>{

    const [isUpdateShow,setIsUpdateShow]=useState(false);
    const params = useParams();
    const channelId = params.channel;
    const space = params.space;
    console.log("space" + space);
    const [messages, setMessages] = useState<ReceivedMessage[]>([]);
    const [channelName, setChannelName] = useState("");
    const router = useRouter();
    const [messageInput, setMessageInput] = useState("");

    const {sendMessage} = useWebSocket();
    const createChat = ()=>{
        if (messageInput ==="") return;

        const chatCreateSendEvent: ChatCreateSendEvent = {
            message: {channelId: Number(channelId), parent: 0, text:messageInput },
            type: "chatCreate"
        }

        sendMessage(JSON.stringify(chatCreateSendEvent));
        setMessageInput("");

    }

    // 채널 관련 UseEffect
    useEffect(() => {
        const handleChannelUpdate = (message: ChannelUpdateReceiveEvent) => {
            if (message.id === Number(channelId)) {
                setChannelName(message.channelName);  // 채널 이름 수정 반영
            }
        };

        const handleChannelDelete = (message: ChannelDeleteReceiveEvent) => {
            if (message.id === Number(channelId)) {
                alert("이 채널은 삭제되었습니다.");
                router.push(`/space/${params.space}/main`);
            }
        };

        const handleChatCreate = (message : ChatCreateReceiveEvent) =>{
            console.log("message111" + JSON.stringify(message));
            if(Number(channelId) !== message.channelId) return;


            const chatMessage: ReceivedMessage = {comment: [], id: message.id, text: message.chatMessage, createdDate: message.createdDate, user: message.user}
            setMessages((prevData) => [...prevData, chatMessage]);

        }

        emitter.on("chatCreate", handleChatCreate);
        emitter.on("channelUpdate", handleChannelUpdate);
        emitter.on("channelDelete", handleChannelDelete);

        return () => {
            emitter.off("chatCreate", handleChatCreate);
            emitter.off("channelUpdate", handleChannelUpdate);
            emitter.off("channelDelete", handleChannelDelete);
        };
    }, [channelId]);

    //채팅 메세지 데이터 가져오기 useEffect
    useEffect(() => {
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/message?spaceId=${space}&channelId=${channelId}&pageNumber=0`,{withCredentials:true})
            .then(value => (setMessages(value.data)))
            // setMessages(value.data));

    }, []);

    //Todo : 코드 스타일 수정 필요
    useEffect(() => {

        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/channel/info?channelId=${channelId}`, {withCredentials:true})
            .then((response)=>{
                let info :ChannelInfo = response.data
                setChannelName(info.channelName);
            })

        const handler = (chattingMessage: JsonReceivedMessageInfo) => {
            if (chattingMessage.channelId === Number(channelId)) {
                setMessages((prevMessages) => {
                    if (chattingMessage.type === "create") {
                        const newMsg: ReceivedMessage = chattingMessage.message;
                        return [...prevMessages, newMsg];

                    } else if (chattingMessage.type === "update") {
                        return prevMessages.map(msg =>
                            msg.id === chattingMessage.message.id
                                ? {
                                    ...msg, // 기존 메시지 내용 유지
                                    text: chattingMessage.message.text, // text만 업데이트
                                    // user, time, comment 등은 null이 들어와도 덮어쓰지 않음
                                }
                                : msg
                        );

                    } else if (chattingMessage.type === "delete") {
                        return prevMessages.filter(msg => msg.id !== chattingMessage.message.id);
                    } else {
                        return prevMessages;
                    }
                });
            }
        };

        emitter.on("channelMessage", handler);
        return () => {
            emitter.off("channelMessage", handler);
        };
    }, [channelId]);


    return <div className={"flex flex-col w-full h-full min-h-0"}>
        {isUpdateShow && <ChannelUpdateDialog channelId={Number(channelId)} channelName={channelName} closeWindow={()=>{setIsUpdateShow(false)}} ></ChannelUpdateDialog>}
        <div className="flex bg-nav p-4 font-bold items-center gap-2">
            {channelName}
            <ChannelSetting openWindow={()=>{setIsUpdateShow(true)}} closeWindow={()=>{setIsUpdateShow(false)}} channelId={Number(channelId)}></ChannelSetting>
        </div>

        {/* 메시지 영역 */}
        <div className=" flex-1 overflow-y-auto p-4 min-h-0">
            {messages.map((message) => (
                <MessageCard key={message.id} data={message}/>
            ))}
        </div>

        {/* 입력창 영역 */}
        <div className="p-4 min-h-0">
            <Box className="flex flex-col w-full h-full">
                <TextArea
                    size="3"
                    placeholder=""
                    className="w-full mb-2"
                    value={messageInput}
                    onChange={(event) => {setMessageInput(event.target.value);}}
                />
                <Button onClick={createChat} style={{"display" : "flex","marginLeft" : "auto"}}>Submit</Button>
            </Box>
        </div>


    </div>
}