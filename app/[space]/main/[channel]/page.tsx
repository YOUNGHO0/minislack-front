'use client'
import {useParams} from "next/navigation";
import {Message} from "@/types/type";
import MessageCard from "@/app/component/message/MessageCard";
import {Input} from "postcss";
import {Box, Button, TextArea} from "@radix-ui/themes";
import {Bug} from "lucide-react";

export default ()=>{

    const params = useParams();
    const channel = params.channel;

    const messages: Message[] = [
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