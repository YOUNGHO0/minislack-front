'use client';

import * as React from "react";
import {useEffect, useRef, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import {Checkbox, Flex, Text, Theme} from "@radix-ui/themes";
import {useWebSocket} from "@/WebSocket/WebSocketProvider";
import {ChannelUpdateSendEvent} from "@/types/events";
import axios from "axios";

const ChannelUpdatePage = () => {
    const {space, channel} = useParams();
    const router = useRouter();
    const {sendMessage} = useWebSocket();

    const inputRef = useRef<HTMLInputElement>(null);
    const [channelName, setChannelName] = useState("");
    const [isPrivate, setIsPrivate] = useState(false);
    const [isExternalBlocked, setIsExternalBlocked] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/channel/info?spaceId=${space}&channelId=${channel}`, {
            withCredentials: true
        }).then((res) => {

            const data = res.data;
            console.log(data);
            setChannelName(data.name);
            setIsPrivate(data.privateChannel);
            setIsExternalBlocked(data.externalBlocked);
        });
    }, [channel]);

    const handleSave = () => {
        const newName = inputRef.current?.value.trim();
        if (!newName) {
            setError("채널 이름을 입력해주세요.");
            return;
        }

        const event: ChannelUpdateSendEvent = {
            type: "channelUpdate",
            message: {
                id: Number(channel),
                channelName: newName,
                privateChannel: isPrivate,
                externalBlocked: isPrivate ? true : isExternalBlocked
            }
        };
        sendMessage(JSON.stringify(event));
        router.push(`/space/${space}/main`);
    };

    return (
        <div className="w-full flex flex-col sm:px-6 lg:px-[15%] py-4">
            <Theme>
                <div className="flex flex-col w-full bg-white p-6 rounded-md">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">채널 수정</h2>
                    <input
                        ref={inputRef}
                        className={`mt-5 mb-3 h-[35px] w-full rounded px-3 text-[14px] border outline-none mb-3 ${
                            error ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-400'
                        }`}
                        placeholder="채널 이름"
                        value={channelName}
                        onChange={(e) => {
                            setChannelName(e.target.value);
                            if (error) setError("");
                        }}
                        disabled={loading}
                    />

                    <Text as="label" size="2">
                        <Flex mt="2" mb="2" as="span" gap="2" className="mb-2">
                            <Checkbox
                                variant="classic"
                                checked={isExternalBlocked}
                                onCheckedChange={(checked) => setIsExternalBlocked(!!checked)}
                                disabled={isPrivate}
                            />
                            외부 참여 불가
                            {isPrivate && (
                                <span className="text-[12px] text-gray-500">(비공개 채널에서는 자동 적용됩니다)</span>
                            )}
                        </Flex>
                    </Text>

                    <Text as="label" size="2">
                        <Flex as="span" gap="2" className="mb-4">
                            <Checkbox
                                variant="classic"
                                checked={isPrivate}
                                onCheckedChange={(checked) => {
                                    const next = !!checked;
                                    setIsPrivate(next);
                                    if (next) setIsExternalBlocked(true);
                                }}
                            />
                            비공개 채널
                        </Flex>
                    </Text>

                    {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="mt-10 w-full h-[40px] bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        저장
                    </button>
                </div>
            </Theme>
        </div>
    );
};

export default ChannelUpdatePage;
