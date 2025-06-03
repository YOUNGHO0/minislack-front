'use client'
import {useParams} from "next/navigation";
import MessageCard from "@/app/component/message/MessageCard";
import {Box, Button, TextArea} from "@radix-ui/themes";
import {useEffect, useState} from "react";
import emitter from '@/WebSocket/Emitter'
import {JsonReceivedMessageInfo} from "@/types/webSocketType";
import {ReceivedMessage} from "@/types/type";
export default ()=>{

    const params = useParams();
    const channel = params.channel;
    const [messages, changeMessage] = useState<ReceivedMessage[]>([]);


    //Todo : 코드 스타일 수정 필요
    useEffect(() => {
        changeMessage(temp);
        const handler = (channelMessage: JsonReceivedMessageInfo) => {
            if (channelMessage.channelId === Number(channel)) {
                changeMessage((prevMessages) => {
                    if (channelMessage.type === "create") {
                        const newMsg: ReceivedMessage = channelMessage.message;
                        return [...prevMessages, newMsg];

                    } else if (channelMessage.type === "update") {
                        return prevMessages.map(msg =>
                            msg.id === channelMessage.message.id
                                ? {
                                    ...msg, // 기존 메시지 내용 유지
                                    text: channelMessage.message.text, // text만 업데이트
                                    // user, time, comment 등은 null이 들어와도 덮어쓰지 않음
                                }
                                : msg
                        );

                    } else if (channelMessage.type === "delete") {
                        return prevMessages.filter(msg => msg.id !== channelMessage.message.id);
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
    }, [channel]);





    const temp: ReceivedMessage[] = [
        {
            id: 1,
            text: "Hello everyone!",
            user: {
                id: 1,
                profile: 101,
                username: "alice",
                email: "alice@example.com"
            },
            time: "2025-05-28T09:00:00",
            comment: []
        },
        {
            id: 2,
            text: "How's it going?",
            user: {
                id: 2,
                profile: 102,
                username: "bob",
                email: "bob@example.com"
            },
            time: "2025-05-28T09:05:00",
            comment: [
                {
                    id: 6,
                    text: "Pretty good, thanks!",
                    user: {
                        id: 3,
                        profile: 103,
                        username: "charlie",
                        email: "charlie@example.com"
                    },
                    time: "2025-05-28T09:06:00",
                    comment: []
                }
            ]
        },
        {
            id: 3,
            text: "Anyone up for a meeting later?",
            user: {
                id: 4,
                profile: 104,
                username: "diana",
                email: "diana@example.com"
            },
            time: "2025-05-28T10:00:00",
            comment: []
        },
        {
            id: 4,
            text: "Sure, what time were you thinking?",
            user: {
                id: 5,
                profile: 105,
                username: "eve",
                email: "eve@example.com"
            },
            time: "2025-05-28T10:10:00",
            comment: [
                {
                    id: 7,
                    text: "Maybe around 2 PM?",
                    user: {
                        id: 1,
                        profile: 101,
                        username: "alice",
                        email: "alice@example.com"
                    },
                    time: "2025-05-28T10:12:00",
                    comment: []
                }
            ]
        },
        {
            id: 5,
            text: "Don't forget to check the latest updates.",
            user: {
                id: 2,
                profile: 102,
                username: "bob",
                email: "bob@example.com"
            },
            time: "2025-05-28T11:00:00",
            comment: []
        }
    ];



    return <div className={"flex flex-col w-full h-full"}>

        <div className="bg-nav p-4 text-white font-bold">
            Channel Name: {channel}
        </div>

        {/* 메시지 영역 */}
        <div className=" flex-1 overflow-y-auto p-4">
            {messages.map((message) => (
                <MessageCard key={message.id} data={message}/>
            ))}
        </div>

        {/* 입력창 영역 */}
        <div className="p-4">
            <Box className="flex flex-col w-full">
                <TextArea
                    size="3"
                    placeholder=""
                    className="w-full mb-2"
                />
                <Button style={{"display" : "flex","marginLeft" : "auto"}}>Submit</Button>
            </Box>
        </div>


    </div>
}