'use client';

import * as React from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {Checkbox, Flex, Text, Theme} from "@radix-ui/themes";
import axios from "axios";
import {useEffect, useState} from "react";
import {Space} from "@/types/channel";

const SpaceEditPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const spaceId = searchParams.get("id");
    const [spaceInfo, setSpaceInfo] = useState<Space | null>(null);

    const [channelName, setChannelName] = useState("");
    const [hasError, setHasError] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [searchDisable, setIsSearchDisable] = useState(false);
    const [codeRequired, setCodeRequired] = useState(false);

    useEffect(() => {
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/space/info?spaceId=${spaceId}`, {
            withCredentials: true
        }).then(response => {
            const space = response.data as Space;
            setSpaceInfo(space);
            setChannelName(space.name);
            setIsSearchDisable(!space.searchEnable);
            setCodeRequired(space.codeRequired);
        });
    }, [spaceId]);

    const handleUpdate = () => {
        if (!channelName.trim() || !spaceInfo) {
            setHasError(true);
            setError("채널 이름을 입력해주세요.");
            return;
        }

        setIsLoading(true);
        setHasError(false);
        setError("");

        axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/space`, {
            id: spaceInfo.id,
            name: channelName,
            searchEnable: !searchDisable,
            codeRequired: codeRequired
        }, {
            withCredentials: true,
            headers: {
                "Content-Type": "application/json"
            }
        }).then((response) => {
            if (response.status === 200) {
                router.push(`/space`);
            } else {
                setError("채널 수정에 실패했습니다.");
                setHasError(true);
            }
        }).catch(() => {
            setError("채널 수정 중 오류가 발생했습니다.");
            setHasError(true);
        }).finally(() => {
            setIsLoading(false);
        });
    };

    // if (!spaceInfo) return <div className="text-center p-6">로딩 중...</div>;

    return (
        <div className="w-full flex flex-col sm:px-6 lg:px-[15%] py-4">
            <Theme>
                <div className="flex flex-col w-full bg-white p-6 rounded-md">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">방 수정</h2>
                    <h3 className="mt-3 mb-3 font-semibold">채팅방 설정</h3>

                    <input
                        className={`h-[40px] w-full rounded px-3 text-[16px] border outline-none mb-3 ${
                            hasError ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-400'
                        }`}
                        placeholder="채팅방 이름"
                        value={channelName}
                        onChange={(e) => {
                            setChannelName(e.target.value);
                            if (hasError) {
                                setHasError(false);
                                setError("");
                            }
                        }}
                        disabled={isLoading}
                    />

                    <Text as="label" size="2">
                        <Flex as="span" gap="2" className="mb-2">
                            <Checkbox
                                variant="classic"
                                checked={searchDisable}
                                onCheckedChange={(checked) => setIsSearchDisable(!!checked)}
                            />
                            검색 비공개
                        </Flex>
                    </Text>

                    <Text as="label" size="2">
                        <Flex as="span" gap="2" className="mb-4">
                            <Checkbox
                                variant="classic"
                                checked={codeRequired}
                                onCheckedChange={(checked) => setCodeRequired(!!checked)}
                            />
                            초대 코드 생성
                        </Flex>
                    </Text>

                    {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

                    <button
                        onClick={handleUpdate}
                        disabled={isLoading}
                        className="mt-10 w-full h-[40px] bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {isLoading ? "수정 중..." : "채널 수정"}
                    </button>
                </div>
            </Theme>
        </div>
    );
};

export default SpaceEditPage;
