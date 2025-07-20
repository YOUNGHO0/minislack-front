'use client'
import {useParams, useRouter} from "next/navigation";
import MessageCard from "@/app/component/message/MessageCard";
import {Box, Button, TextArea} from "@radix-ui/themes";
import {useEffect, useRef, useState} from "react";
import emitter from '@/WebSocket/Emitter'
import {JsonReceivedMessageInfo} from "@/types/webSocketType";
import {ChannelInfo, MessagePageResponse, ReceivedMessage} from "@/types/type";
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

export default () => {
    const messageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
    const [isUpdateShow, setIsUpdateShow] = useState(false);
    const params = useParams();
    const channelId = params.channel;
    const space = params.space;
    const [messages, setMessages] = useState<ReceivedMessage[]>([]);
    const [channelName, setChannelName] = useState("");
    const router = useRouter();
    const [messageInput, setMessageInput] = useState("");
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const [showJoinDialog, setShowJoinDialog] = useState(false);
    const [mine, setMine] = useState(false)
    const [replyMessageId, setReplyMessageId] = useState<number | null>(null);
    const [minPageNumber, setMinPageNumber] = useState<number | null>(null);
    const [totalPageNumber, setTotalPageNumber] = useState<number | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const {sendMessage} = useWebSocket();
    const [isLoading, setIsLoading] = useState(false); // useState로 변경
    const firstLoadRef = useRef(true);
    const topSentinelRef = useRef<HTMLDivElement>(null);
    const inputBottomRef = useRef<HTMLDivElement>(null);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const inputContainerRef = useRef<HTMLDivElement>(null);
    const createChat = () => {
        if (messageInput === "") return;
        let parent = 0;
        if (replyMessageId !== null) parent = replyMessageId;
        const chatCreateSendEvent: ChatCreateSendEvent = {
            message: {channelId: Number(channelId), parent: parent, text: messageInput},
            type: "chatCreate"
        }

        sendMessage(JSON.stringify(chatCreateSendEvent));
        setMessageInput("");
        setReplyMessageId(null);

    }
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const textArea = textAreaRef.current;
        if (textArea) {
            textArea.style.height = "auto";
            textArea.style.height = `${textArea.scrollHeight}px`;
        }
    }, [messageInput]);

    useEffect(() => {
        if (firstLoadRef.current && messages.length > 0) {
            firstLoadRef.current = false;
            if (bottomRef.current) {
                bottomRef.current.scrollIntoView({behavior: 'auto'});
            }
        }
    }, [messages]);

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

        const handleChatCreate = (message: ChatCreateReceiveEvent) => {
            if (Number(channelId) !== message.channelId) return;
            let parentMessage: ReceivedMessage | null = null;
            if (message.parentMessage !== null) parentMessage = {
                createdDate: message.parentMessage.createdDate,
                flushed: false,
                id: message.parentMessage.id,
                parentMessage: null,
                text: message.parentMessage.chatMessage,
                user: message.parentMessage.user,
                mine: message.mine
            }
            const chatMessage: ReceivedMessage = {
                id: message.id,
                text: message.chatMessage,
                parentMessage: parentMessage,
                createdDate: message.createdDate,
                user: message.user,
                flushed: false,
                mine: message.mine
            }
            setMessages((prevData) => [...prevData, chatMessage]);

            if (bottomRef.current) {
                requestAnimationFrame(() => {
                    bottomRef.current?.scrollIntoView({behavior: 'smooth'});
                });
            }
        }

        const handleChatUpdate = (message: ChatUpdateReceiveEvent) => {
            if (message.channelId === Number(channelId)) {
                setMessages((prevData) =>
                    prevData.map((data) => {
                            if (data.id === message.id) {
                                data.text = message.text;
                            }
                            return data;
                        }
                    ))
            }
        }

        const handleChatDelete = (message: ChatDeleteReceiveEvent) => {
            if (message.channelId !== Number(channelId)) return;

            setMessages((prev) => {
                return prev
                    .filter((msg) => msg.id !== message.id)
                    .map((msg) => {
                        const parent = msg.parentMessage;
                        if (parent && parent.id === message.id) {
                            return {
                                ...msg,
                                parentMessage: {
                                    ...parent,
                                    text: "삭제된 메세지 입니다",
                                },
                            };
                        }
                        return msg;
                    });
            });
        };

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

    const getMessage = () => {
        axios.get<MessagePageResponse>(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/message?spaceId=${space}&channelId=${channelId}&pageNumber=-1`, {withCredentials: true})
            .then(response => {
                if (response.status == 200) {
                    setTotalPageNumber(response.data.totalPageCount);
                    setMinPageNumber(response.data.currentPageNumber);
                    setMessages(response.data.messageList)
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

    useEffect(() => {
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/channel/info?channelId=${channelId}`, {withCredentials: true})
            .then((response) => {
                let info: ChannelInfo = response.data
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
                                    ...msg,
                                    text: chattingMessage.message.text,
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

    const scroll = (id: number) => {
        const el = messageRefs.current[id];
        if (!el) return;

        el.scrollIntoView({behavior: 'smooth', block: 'center'});

        const observer = new IntersectionObserver(
            ([entry], observerInstance) => {
                if (entry.isIntersecting) {
                    observerInstance.disconnect();

                    el.classList.add('bg-gray-100', 'transition', 'duration-300');
                    el.classList.add('animate-pulse');

                    setTimeout(() => {
                        el.classList.remove('bg-gray-100', 'transition', 'duration-300');
                        el.classList.remove('animate-pulse');
                    }, 700);
                }
            },
            {
                root: null,
                threshold: 1,
            }
        );

        observer.observe(el);
    };

    // Intersection Observer를 사용한 무한 스크롤
    useEffect(() => {
        const sentinel = topSentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                // 더 엄격한 조건 체크
                if (entry.isIntersecting &&
                    minPageNumber !== null &&
                    minPageNumber > 0 &&
                    !isLoading &&
                    entry.intersectionRatio > 0.5) { // 50% 이상 보일 때만 트리거
                    loadPreviousMessages(minPageNumber - 1);
                }
            },
            {
                root: scrollContainerRef.current,
                rootMargin: '20px 0px 0px 0px', // 여유 공간 줄임
                threshold: [0.5, 1.0] // 50% 이상 보일 때만 트리거
            }
        );

        // 로딩 중이 아닐 때만 observe
        if (!isLoading) {
            observer.observe(sentinel);
        }

        return () => observer.disconnect();
    }, [minPageNumber, isLoading]);

    const loadPreviousMessages = async (pageNumber: number) => {
        if (isLoading) return;

        // 추가 보안: 같은 페이지를 다시 로드하지 않도록
        if (minPageNumber !== null && pageNumber >= minPageNumber) return;

        setIsLoading(true);

        const container = scrollContainerRef.current;
        if (!container) {
            setIsLoading(false);
            return;
        }

        // 현재 스크롤 위치와 높이 저장
        const prevScrollHeight = container.scrollHeight;
        const prevScrollTop = container.scrollTop;

        try {
            const res = await axios.get<MessagePageResponse>(
                `${process.env.NEXT_PUBLIC_API_URL}/api/v1/message?spaceId=${space}&channelId=${channelId}&pageNumber=${pageNumber}`,
                {withCredentials: true}
            );

            if (res.status === 200) {
                const newMessages = res.data.messageList;

                // 새 메시지가 없으면 로딩 종료
                if (newMessages.length === 0) {
                    setIsLoading(false);
                    return;
                }

                // 스크롤 위치를 부드럽게 유지하기 위해 CSS로 스크롤 고정
                container.style.overflow = 'hidden';

                setMessages(prev => [...newMessages, ...prev]);
                setMinPageNumber(res.data.currentPageNumber);

                // 다음 렌더링 사이클에서 스크롤 위치 조정
                requestAnimationFrame(() => {
                    const newScrollHeight = container.scrollHeight;
                    const heightDiff = newScrollHeight - prevScrollHeight;

                    // 스크롤 위치를 새로운 컨텐츠 높이만큼 조정
                    container.scrollTop = prevScrollTop + heightDiff;

                    // 스크롤 복원
                    container.style.overflow = 'auto';
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
            // 로딩 완료 후 지연을 주어 연속 로딩 방지
            setTimeout(() => {

            },);
        }
    };

    useEffect(() => {
        const scrollContainer = scrollContainerRef.current;
        if (!scrollContainer) return;

        const handleWheel = (e: WheelEvent) => {
            // 기본 스크롤을 막지 않고, 델타 값만 조절
            const originalDelta = e.deltaY;
            const reducedDelta = originalDelta * 0.3; // 민감도 조절

            // 기본 이벤트는 막지 않고, 스크롤 속도만 조절
            e.preventDefault();
            scrollContainer.scrollTop += reducedDelta;
        };

        scrollContainer.addEventListener('wheel', handleWheel, {passive: false});

        return () => {
            scrollContainer.removeEventListener('wheel', handleWheel);
        };
    }, []);

    // 키보드 높이 감지
    useEffect(() => {
        const handleResize = () => {
            const visualViewport = window.visualViewport;
            if (visualViewport) {
                const keyboardHeight = window.innerHeight - visualViewport.height;
                setKeyboardHeight(keyboardHeight);
            }
        };

        const visualViewport = window.visualViewport;
        if (visualViewport) {
            visualViewport.addEventListener('resize', handleResize);
            return () => {
                visualViewport.removeEventListener('resize', handleResize);
            };
        }
    }, []);

    return <div className="flex flex-col w-full h-screen min-h-0 overflow-hidden lg:relative fixed inset-0" style={{ height: '100dvh' }}>
        {isUpdateShow &&
            <ChannelUpdateDialog channelId={Number(channelId)} channelName={channelName} closeWindow={() => {
                setIsUpdateShow(false)
            }}></ChannelUpdateDialog>}
        <div className="flex bg-nav py-1 px-2 font-bold items-center gap-2 flex-shrink-0 lg:static fixed top-0 left-0 right-0 z-[70]">
            {channelName}
            <ChannelSetting mine={mine} openWindow={() => {
                setIsUpdateShow(true)
            }} closeWindow={() => {
                setIsUpdateShow(false)
            }} channelId={Number(channelId)}></ChannelSetting>
        </div>

        {showJoinDialog && <JoinDialog getMessage={getMessage} close={() => setShowJoinDialog(false)}/>}

        {/* 메시지 영역 */}
        <div 
            ref={scrollContainerRef} 
            className="flex flex-col flex-1 overflow-y-auto lg:p-2 p-2 min-h-0 overscroll-contain lg:pb-0 pb-32 lg:pt-0 pt-12"
            style={{ 
                paddingBottom: keyboardHeight > 0 ? `${keyboardHeight + 128}px` : '128px'
            }}
        >
            {/* 상단 감지용 센티넬 - 로딩 중이 아니고 더 불러올 데이터가 있을 때만 보임 */}
            {!isLoading && minPageNumber !== null && minPageNumber > 0 && (
                <div ref={topSentinelRef} className="h-10 w-full flex-shrink-0"/>
            )}

            {messages.map((message) => (
                <div key={message.id} className="message-row w-full flex-shrink-0">
                    <MessageCard scrollContainerRef={scrollContainerRef} scroll={scroll}
                                 refCallback={(el) => messageRefs.current[message.id] = el}
                                 parentMessage={message.parentMessage === null ? undefined : message.parentMessage}
                                 data={message} setMessageId={(messageId: number) => setReplyMessageId(messageId)}/>
                </div>
            ))}
            <div ref={bottomRef}/>
        </div>

        {/* 입력창 영역 */}
        <div 
            ref={inputContainerRef}
            className="py-1 px-[5%] min-h-0 flex-shrink-0 bg-white border-t border-gray-200 lg:static lg:pb-1 fixed left-0 right-0 z-[60]"
            style={{ 
                bottom: keyboardHeight > 0 ? `${keyboardHeight}px` : '0px'
            }}
        >
            <Box className="flex flex-col w-full">
                {replyMessageId !== null ? <MessageReplyBar onCancel={() => setReplyMessageId(null)}
                                                            message={messages.find(msg => msg.id === replyMessageId)}></MessageReplyBar> : <></>}
                <div className="flex gap-2 items-center">
                    <TextArea
                        size="2"
                        placeholder=""
                        className="flex-1"
                        value={messageInput}
                        ref={textAreaRef}
                        onChange={(event) => {
                            setMessageInput(event.target.value);
                        }}
                        onFocus={() => {
                            setTimeout(() => {
                                inputBottomRef.current?.scrollIntoView({behavior: 'smooth'});
                            }, 100); // 키보드 올라오는 시간 고려
                        }}
                    />
                    <Button onClick={createChat}>전송</Button>
                </div>
            </Box>
        </div>
    </div>
}