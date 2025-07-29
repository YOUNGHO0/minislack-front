'use client';

import * as React from "react";
import {useRouter} from "next/navigation";
import {Checkbox, Flex, Text, TextField, Theme} from "@radix-ui/themes";
import axios from "axios";
import {useEffect} from "react";
import {UserInfo} from "@/types/type";


const SpaceCreatePage = () => {
    const router = useRouter();
    const [channelName, setChannelName] = React.useState("");
    const [hasError, setHasError] = React.useState(false);
    const [error, setError] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);
    const [searchDisable, setIsSearchDisable] = React.useState(false);
    const [codeRequired, setCodeRequired] = React.useState(false);
    const [useDefaultProfile, setUseDefaultProfile] = React.useState(true);
    const [customNickName, setCustomNickName] = React.useState("");
    const [nickNameError, setNickNameError] = React.useState("");
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [defaultNickName, setDefaultNickName] = React.useState("");

    useEffect(() => {
        axios.get<UserInfo>(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/info`, { withCredentials: true })
            .then(result => {
                setDefaultNickName(result.data.nickName);
            });
    }, []);

    useEffect(() => {
        if (!useDefaultProfile && inputRef.current) {
            // 모바일 키보드 대응: 약간의 딜레이 후 중앙으로 스크롤 및 포커스
            setTimeout(() => {
                inputRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
                inputRef.current?.focus();
            }, 100);
        }
    }, [useDefaultProfile]);

    function addRoom() {
        if (!channelName.trim()) {
            setHasError(true);
            setError("채널 이름을 입력해주세요.");
            return;
        }

        setIsLoading(true);
        setHasError(false);
        setError("");

        axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/space`,
            {
                name: channelName,
                searchEnable: !searchDisable,
                codeRequired,
                useCustomProfile: !useDefaultProfile,
                nickName: customNickName,
                profileImageId: null
            },
            {
                withCredentials: true,
                headers: { "Content-Type": "application/json" }
            }
        ).then((response) => {
            if (response.status === 200) {
                router.push(`/space/${response.data}/main`);
            } else {
                setHasError(true);
                setError("채널 생성에 실패했습니다.");
            }
        }).catch(() => {
            setHasError(true);
            setError("채널 생성 중 오류가 발생했습니다.");
        }).finally(() => {
            setIsLoading(false);
        });
    }

    return (
        <div className="w-full flex flex-col justify-center py-4 lg:px-[30%] overflow-auto">
            <Theme>
                <div className="flex flex-col max-w-3xl w-full bg-white p-6 rounded-md">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">방 생성</h2>
                    <h3 className="mt-3 mb-3 font-semibold">채팅방 설정</h3>

                    <TextField.Root
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

                    <h3 className="mt-3 font-semibold mb-2">프로필 설정</h3>
                    <div>
                        <Text as="label" size="2">
                            <Flex as="span" gap="2" className="mb-2">
                                <Checkbox
                                    checked={useDefaultProfile}
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            setUseDefaultProfile(true);
                                            setNickNameError("");
                                        }
                                    }}
                                />
                                기본 프로필 사용
                            </Flex>
                        </Text>

                        <Text as="label" size="2">
                            <Flex as="span" gap="2" className="mb-2">
                                <Checkbox
                                    checked={!useDefaultProfile}
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            setUseDefaultProfile(false);
                                        }
                                    }}
                                />
                                커스텀 프로필 사용
                            </Flex>
                        </Text>

                        <div className="mt-4 mb-4">
                            <TextField.Root
                                ref={inputRef}
                                readOnly={useDefaultProfile}
                                className={`scroll-mt-24 h-[40px] w-full rounded px-3 text-[16px] border outline-none ${
                                    nickNameError ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-400'
                                } ${useDefaultProfile ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                                value={useDefaultProfile ? defaultNickName : customNickName}
                                onChange={(e) => {
                                    if (!useDefaultProfile) {
                                        setCustomNickName(e.target.value);
                                    }
                                }}
                            />
                            {nickNameError && <p className="text-sm text-red-500 mt-1">{nickNameError}</p>}
                        </div>
                    </div>

                    <button
                        onClick={addRoom}
                        disabled={isLoading}
                        className="mt-10 w-full h-[40px] bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {isLoading ? "생성 중..." : "채팅방 생성"}
                    </button>
                </div>
            </Theme>
        </div>
    );
};

export default SpaceCreatePage;
