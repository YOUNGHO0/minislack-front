'use client';

import * as React from "react";
import {useEffect} from "react";
import {useParams, useRouter, useSearchParams} from "next/navigation";
import {Checkbox, Flex, Text, TextField, Theme} from "@radix-ui/themes";
import axios, {HttpStatusCode} from "axios";
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
    const {space} = useParams();
    const searchParams = useSearchParams();
    useEffect(() => {
        axios.get<UserInfo>(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/info`, {withCredentials: true})
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

    function joinRoom() {

        setIsLoading(true);
        setHasError(false);
        setError("");

        axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/space/joinV2?id=${space}&` + searchParams.toString(),
            {
                useCustomProfile: !useDefaultProfile,
                nickName: customNickName,
                profileImageId: null
            },
            {
                withCredentials: true,
                headers: {"Content-Type": "application/json"}
            }
        ).then((response) => {
            if (response.status === 200) {
                window.location.href = `/space/${space}/main`;
            } else {
                setHasError(true);
                setError("입장중 문제가 발생했습니다");
            }
        }).catch((error) => {
            if (error.response?.status == HttpStatusCode.Conflict) {
                window.location.href = `/space/${space}/main`;
                return;
            }
            setHasError(true);
            setError("입장중 문제가 발생했습니다");
        }).finally(() => {
            setIsLoading(false);
        });
    }

    return (
        <div className="w-full flex flex-col justify-center py-4 lg:px-[30%] overflow-auto">
            <Theme>
                <div className="flex flex-col max-w-3xl w-full bg-white p-6 rounded-md">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">프로필 설정</h2>

                    {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

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
                        onClick={joinRoom}
                        disabled={isLoading}
                        className="mt-10 w-full h-[40px] bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {isLoading ? "참가 중..." : "입장"}
                    </button>
                </div>
            </Theme>
        </div>
    );
};

export default SpaceCreatePage;
