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
    ChatCreateSendEvent, ChatDeleteReceiveEvent, ChatUpdateReceiveEvent
} from "@/types/events";
import {useWebSocket} from "@/WebSocket/WebSocketProvider";
import JoinDialog from "@/app/component/channel/joindialog/JoinDialog";
import MessageReplyBar from "@/app/component/message/MessageReplyBar";

export default ()=>{

    const [isUpdateShow,setIsUpdateShow]=useState(false);
    const params = useParams();
    const channelId = params.channel;
    const space = params.space;
    const [messages, setMessages] = useState<ReceivedMessage[]>([]);
    const [channelName, setChannelName] = useState("");
    const router = useRouter();
    const [messageInput, setMessageInput] = useState("");
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const [showJoinDialog, setShowJoinDialog] = useState(false);
    const [mine ,setMine] = useState(false)
    const [replyMessageId, setReplyMessageId] = useState<number | null>(null);
    const {sendMessage} = useWebSocket();
    const createChat = ()=>{
        if (messageInput ==="") return;
        let parent = 0;
        if(replyMessageId !== null) parent = replyMessageId;
        const chatCreateSendEvent: ChatCreateSendEvent = {
            message: {channelId: Number(channelId), parent: parent, text:messageInput },
            type: "chatCreate"
        }

        sendMessage(JSON.stringify(chatCreateSendEvent));
        setMessageInput("");
        setReplyMessageId(null);

    }
    const bottomRef = useRef<HTMLDivElement>(null); // ✅ 추가

    useEffect(() => {
        const textArea = textAreaRef.current;
        if (textArea) {
            textArea.style.height = "auto"; // 리셋
            textArea.style.height = `${textArea.scrollHeight}px`; // 내용 높이만큼 설정
        }
    }, [messageInput]);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'auto' }); // ✅ 메시지 도착 시 하단으로 스크롤
        }
    }, [messages]);

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
            if(Number(channelId) !== message.channelId) return;
            let parentMessage : ReceivedMessage | null = null;
            if(message.parentMessage !== null) parentMessage = {
                createdDate: message.parentMessage.createdDate,
                flushed: false,
                id: message.parentMessage.id,
                parentMessage: null,
                text: message.parentMessage.chatMessage,
                user : message.parentMessage.user
            }
            const chatMessage: ReceivedMessage = {id: message.id, text: message.chatMessage, parentMessage:parentMessage, createdDate: message.createdDate, user: message.user,flushed:false}
            setMessages((prevData) => [...prevData, chatMessage]);

        }

        const handleChatUpdate = (message : ChatUpdateReceiveEvent) =>{
            console.log("실행됨");
            console.log(message);
            if(message.channelId === Number(channelId)){
                setMessages( (prevData) =>
                    prevData.map((data)=>{
                        if(data.id === message.id){
                            data.text = message.text;
                        }
                        return data;
                    }
                ))}
        }

        const handleChatDelete = (message : ChatDeleteReceiveEvent)=>{
            if(message.channelId === Number(channelId)){
                setMessages((prevData) => prevData.filter((value)=> value.id !== message.id))
            }
        }

        emitter.on("chatCreate", handleChatCreate);
        emitter.on("chatUpdate", handleChatUpdate);
        emitter.on("chatDelete", handleChatDelete);
        emitter.on("channelUpdate", handleChannelUpdate);
        emitter.on("channelDelete", handleChannelDelete);

        return () => {
            emitter.off("chatCreate", handleChatCreate);
            emitter.off("chatUpdate", handleChatUpdate);
            emitter.off("chatDelete", handleChatDelete)
            emitter.off("channelUpdate", handleChannelUpdate);
            emitter.off("channelDelete", handleChannelDelete);
        };
    }, [channelId]);

    const getMessage = ()=>{
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/message?spaceId=${space}&channelId=${channelId}&pageNumber=0`,{withCredentials:true})
            .then(response => {
                if(response.status == 200){
                    setMessages(response.data)
                }
            })
            .catch(error => {
                if (error.response?.status === 403) {
                    setShowJoinDialog(true);
                }
            });
    }

    //채팅 메세지 데이터 가져오기 useEffect
    useEffect(() => {
        getMessage();
    }, []);

    //Todo : 코드 스타일 수정 필요
    useEffect(() => {

        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/channel/info?channelId=${channelId}`, {withCredentials:true})
            .then((response)=>{
                let info :ChannelInfo = response.data
                setMine(info.mine);
                setChannelName(info.name);
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
            <ChannelSetting mine={mine} openWindow={()=>{setIsUpdateShow(true)}} closeWindow={()=>{setIsUpdateShow(false)}} channelId={Number(channelId)}></ChannelSetting>
        </div>

        {/*채널 미참여시 보여줄 다이얼로그*/}
        {showJoinDialog && <JoinDialog getMessage={getMessage} close={()=>setShowJoinDialog(false)} />}
        {/* 메시지 영역 */}
        <div className=" flex-1 overflow-y-auto p-4 min-h-0">
            {messages.map((message) => (
                <MessageCard parentMessage={message.parentMessage === null? undefined : message.parentMessage} key={message.id} data={message} setMessageId={(messageId:number)=>setReplyMessageId(messageId)}/>
            ))}
            <div ref={bottomRef} />
        </div>

        {/* 입력창 영역 */}
        <div className="p-4 min-h-0 px-[5%]">
            <Box className="flex flex-col w-full h-full">
                {replyMessageId !== null ? <MessageReplyBar onCancel={()=>setReplyMessageId(null)} message={messages.find(msg => msg.id === replyMessageId)}></MessageReplyBar>  : <></> }
                    <TextArea
                    size="3"
                    placeholder=""
                    className="w-full mb-2"
                    value={messageInput}
                    ref={textAreaRef}
                    onChange={(event) => {setMessageInput(event.target.value);}}
                />
                <Button onClick={createChat} style={{"display" : "flex","marginLeft" : "auto"}}>전송</Button>
            </Box>
        </div>


    </div>
}