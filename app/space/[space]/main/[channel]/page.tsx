'use client'
import {useParams} from "next/navigation";
import MessageCard from "@/app/component/message/MessageCard";
import {Box, Button, TextArea} from "@radix-ui/themes";
import {useEffect, useState} from "react";
import emitter from '@/WebSocket/Emitter'
import {JsonReceivedMessageInfo} from "@/types/webSocketType";
import {ReceivedMessage} from "@/types/type";
export default ()=>{


    const temp: ReceivedMessage[] = [
        {
            id: 1,
            text: "Hello everyone!",
            user: { id: 1, profile: 101, username: "alice", email: "alice@example.com" },
            time: "2025-05-28T09:00:00",
            comment: []
        },
        {
            id: 2,
            text: "How's it going?",
            user: { id: 2, profile: 102, username: "bob", email: "bob@example.com" },
            time: "2025-05-28T09:05:00",
            comment: [
                {
                    id: 6,
                    text: "Pretty good, thanks!",
                    user: { id: 3, profile: 103, username: "charlie", email: "charlie@example.com" },
                    time: "2025-05-28T09:06:00",
                    comment: []
                }
            ]
        },
        {
            id: 3,
            text: "Anyone up for a meeting later?",
            user: { id: 4, profile: 104, username: "diana", email: "diana@example.com" },
            time: "2025-05-28T10:00:00",
            comment: []
        },
        {
            id: 4,
            text: "Sure, what time were you thinking?",
            user: { id: 5, profile: 105, username: "eve", email: "eve@example.com" },
            time: "2025-05-28T10:10:00",
            comment: [
                {
                    id: 7,
                    text: "Maybe around 2 PM?",
                    user: { id: 1, profile: 101, username: "alice", email: "alice@example.com" },
                    time: "2025-05-28T10:12:00",
                    comment: []
                }
            ]
        },
        {
            id: 5,
            text: "Don't forget to check the latest updates.",
            user: { id: 2, profile: 102, username: "bob", email: "bob@example.com" },
            time: "2025-05-28T11:00:00",
            comment: []
        },
        {
            id: 6,
            text: "The new feature rollout starts today.",
            user: { id: 3, profile: 103, username: "charlie", email: "charlie@example.com" },
            time: "2025-05-28T11:10:00",
            comment: []
        },
        {
            id: 7,
            text: "Can someone review my PR?",
            user: { id: 4, profile: 104, username: "diana", email: "diana@example.com" },
            time: "2025-05-28T11:20:00",
            comment: []
        },
        {
            id: 8,
            text: "Lunch break?",
            user: { id: 5, profile: 105, username: "eve", email: "eve@example.com" },
            time: "2025-05-28T11:30:00",
            comment: []
        },
        {
            id: 9,
            text: "Who's joining the sync meeting?",
            user: { id: 1, profile: 101, username: "alice", email: "alice@example.com" },
            time: "2025-05-28T11:45:00",
            comment: []
        },
        {
            id: 10,
            text: "I'll be there.",
            user: { id: 2, profile: 102, username: "bob", email: "bob@example.com" },
            time: "2025-05-28T11:46:00",
            comment: []
        },
        {
            id: 11,
            text: "Same here!",
            user: { id: 3, profile: 103, username: "charlie", email: "charlie@example.com" },
            time: "2025-05-28T11:47:00",
            comment: []
        },
        {
            id: 12,
            text: "Reminder: deploy window starts at 3 PM.",
            user: { id: 4, profile: 104, username: "diana", email: "diana@example.com" },
            time: "2025-05-28T12:00:00",
            comment: []
        },
        {
            id: 13,
            text: "Got it, thanks!",
            user: { id: 5, profile: 105, username: "eve", email: "eve@example.com" },
            time: "2025-05-28T12:05:00",
            comment: []
        },
        {
            id: 14,
            text: "Code freeze this Friday!",
            user: { id: 1, profile: 101, username: "alice", email: "alice@example.com" },
            time: "2025-05-28T13:00:00",
            comment: []
        },
        {
            id: 15,
            text: "Are we ready for the demo?",
            user: { id: 2, profile: 102, username: "bob", email: "bob@example.com" },
            time: "2025-05-28T13:15:00",
            comment: []
        },
        {
            id: 16,
            text: "Just finishing up some testing.",
            user: { id: 3, profile: 103, username: "charlie", email: "charlie@example.com" },
            time: "2025-05-28T13:20:00",
            comment: []
        },
        {
            id: 17,
            text: "Great work, everyone!",
            user: { id: 4, profile: 104, username: "diana", email: "diana@example.com" },
            time: "2025-05-28T13:30:00",
            comment: []
        },
        {
            id: 18,
            text: "Let's prepare the slides.",
            user: { id: 5, profile: 105, username: "eve", email: "eve@example.com" },
            time: "2025-05-28T13:40:00",
            comment: []
        },
        {
            id: 19,
            text: "Slides are in the shared folder.",
            user: { id: 1, profile: 101, username: "alice", email: "alice@example.com" },
            time: "2025-05-28T13:45:00",
            comment: []
        },
        {
            id: 20,
            text: "Reviewing now.",
            user: { id: 2, profile: 102, username: "bob", email: "bob@example.com" },
            time: "2025-05-28T13:50:00",
            comment: []
        },
        {
            id: 21,
            text: "Thanks for organizing everything!",
            user: { id: 3, profile: 103, username: "charlie", email: "charlie@example.com" },
            time: "2025-05-28T14:00:00",
            comment: []
        },
        {
            id: 22,
            text: "Looking forward to the presentation.",
            user: { id: 4, profile: 104, username: "diana", email: "diana@example.com" },
            time: "2025-05-28T14:05:00",
            comment: []
        },
        {
            id: 23,
            text: "Don’t forget to smile 😄",
            user: { id: 5, profile: 105, username: "eve", email: "eve@example.com" },
            time: "2025-05-28T14:10:00",
            comment: []
        },
        {
            id: 24,
            text: "Team meeting starts now.",
            user: { id: 1, profile: 101, username: "alice", email: "alice@example.com" },
            time: "2025-05-28T14:15:00",
            comment: []
        },
        {
            id: 25,
            text: "Joining in a sec.",
            user: { id: 2, profile: 102, username: "bob", email: "bob@example.com" },
            time: "2025-05-28T14:16:00",
            comment: []
        },
        {
            id: 26,
            text: "Let’s go!",
            user: { id: 3, profile: 103, username: "charlie", email: "charlie@example.com" },
            time: "2025-05-28T14:17:00",
            comment: []
        },
        {
            id: 27,
            text: "Awesome job today 🎉",
            user: { id: 4, profile: 104, username: "diana", email: "diana@example.com" },
            time: "2025-05-28T15:00:00",
            comment: []
        },
        {
            id: 28,
            text: "See you all tomorrow!",
            user: { id: 5, profile: 105, username: "eve", email: "eve@example.com" },
            time: "2025-05-28T15:05:00",
            comment: []
        },
        {
            id: 29,
            text: "Don’t forget to submit timesheets.",
            user: { id: 1, profile: 101, username: "alice", email: "alice@example.com" },
            time: "2025-05-28T15:10:00",
            comment: []
        },
        {
            id: 30,
            text: "Will do it right away!",
            user: { id: 2, profile: 102, username: "bob", email: "bob@example.com" },
            time: "2025-05-28T15:15:00",
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