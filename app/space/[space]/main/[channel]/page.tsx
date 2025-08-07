'use client'
import {useParams, useRouter} from "next/navigation";
import MessageCard from "@/app/component/message/MessageCard";
import {Box, Button, TextArea} from "@radix-ui/themes";
import {useEffect, useLayoutEffect, useRef, useState, useCallback} from "react";
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
    ChatCreateSendEvent,
    ChatDeleteReceiveEvent,
    ChatUpdateReceiveEvent
} from "@/types/events";
import {useWebSocket} from "@/WebSocket/WebSocketProvider";
import JoinDialog from "@/app/component/channel/joindialog/JoinDialog";
import MessageReplyBar from "@/app/component/message/MessageReplyBar";

// 키보드 상태를 관리하는 커스텀 훅
const useKeyboardDetection = () => {
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
    const initialViewportHeight = useRef(window.innerHeight);

    useEffect(() => {
        initialViewportHeight.current = window.innerHeight;

        const handleResize = () => {
            // iOS Safari의 경우 visual viewport 사용
            const viewport = window.visualViewport;
            if (viewport) {
                const heightDiff = initialViewportHeight.current - viewport.height;
                const isOpen = heightDiff > 150; // 최소 키보드 높이

                setKeyboardHeight(isOpen ? heightDiff : 0);
                setIsKeyboardOpen(isOpen);
            } else {
                // Android Chrome 등 다른 브라우저 대응
                const heightDiff = initialViewportHeight.current - window.innerHeight;
                const isOpen = heightDiff > 150;

                setKeyboardHeight(isOpen ? heightDiff : 0);
                setIsKeyboardOpen(isOpen);
            }
        };

        // 초기값 설정
        handleResize();

        // Visual Viewport API 지원 여부에 따라 이벤트 리스너 설정
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleResize);
            return () => window.visualViewport.removeEventListener('resize', handleResize);
        } else {
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, []);

    return { keyboardHeight, isKeyboardOpen };
};

// 스크롤 위치를 관리하는 커스텀 훅
const useScrollManager = (scrollContainerRef: React.RefObject<HTMLDivElement>) => {
    const [isNearBottom, setIsNearBottom] = useState(true);
    const [shouldMaintainScroll, setShouldMaintainScroll] = useState(false);
    const lastScrollTop = useRef(0);

    const checkIfNearBottom = useCallback(() => {
        const container = scrollContainerRef.current;
        if (!container) return false;

        const threshold = 100;
        const isNear = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
        setIsNearBottom(isNear);
        return isNear;
    }, []);

    const scrollToBottom = useCallback((behavior: 'smooth' | 'instant' = 'smooth') => {
        const container = scrollContainerRef.current;
        if (!container) return;

        requestAnimationFrame(() => {
            container.scrollTo({
                top: container.scrollHeight,
                behavior
            });
        });
    }, []);

    const maintainScrollPosition = useCallback(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        lastScrollTop.current = container.scrollTop;
        setShouldMaintainScroll(true);
    }, []);

    const restoreScrollPosition = useCallback(() => {
        if (!shouldMaintainScroll) return;

        const container = scrollContainerRef.current;
        if (!container) return;

        requestAnimationFrame(() => {
            container.scrollTop = lastScrollTop.current;
            setShouldMaintainScroll(false);
        });
    }, [shouldMaintainScroll]);

    return {
        isNearBottom,
        scrollToBottom,
        checkIfNearBottom,
        maintainScrollPosition,
        restoreScrollPosition
    };
};

export default () => {
    const messageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
    const [isUpdateShow, setIsUpdateShow] = useState(false);
    const params = useParams();
    const channelId = params.channel;
    const space = params.space;
    const [messages, setMessages] = useState<ReceivedMessage[]>([]);
    const [channelName, setChannelName] = useState("");
    const router = useRouter();
    const textAreaRef = useRef<HTMLDivElement>(null);
    const [showJoinDialog, setShowJoinDialog] = useState(false);
    const [mine, setMine] = useState(false)
    const [replyMessageId, setReplyMessageId] = useState<number | null>(null);
    const [minPageNumber, setMinPageNumber] = useState<number | null>(null);
    const [totalPageNumber, setTotalPageNumber] = useState<number | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const {sendMessage} = useWebSocket();
    const [isLoading, setIsLoading] = useState(false);
    const firstLoadRef = useRef(true);
    const topSentinelRef = useRef<HTMLDivElement>(null);
    const inputContainerRef = useRef<HTMLDivElement>(null);
    const isUserTouchingRef = useRef(false);
    const [inputHeight, setInputHeight] = useState(0);
    const channelHeaderRef = useRef<HTMLDivElement>(null);
    const [channelHeaderHeight, setChannelHeaderHeight] = useState(0);
    const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);

    // 커스텀 훅들 사용
    const { keyboardHeight, isKeyboardOpen } = useKeyboardDetection();
    const { isNearBottom, scrollToBottom, checkIfNearBottom, maintainScrollPosition, restoreScrollPosition } = useScrollManager(scrollContainerRef);

    // 키보드 열릴 때 처리
    useEffect(() => {
        if (isKeyboardOpen) {
            // 키보드가 열릴 때 하단에 있었다면 스크롤 유지
            if (isNearBottom) {
                requestAnimationFrame(() => {
                    scrollToBottom('instant');
                });
            }

            // 입력창에 포커스 유지
            if (textAreaRef.current) {
                setTimeout(() => {
                    textAreaRef.current?.focus();
                }, 100);
            }
        }
    }, [isKeyboardOpen, isNearBottom, scrollToBottom]);

    // 텍스트 영역 자동 높이 조절
    useEffect(() => {
        const textArea = textAreaRef.current;
        if (!textArea) return;

        const handleInput = () => {
            // 키보드가 열려있을 때 스크롤 위치 유지
            if (isKeyboardOpen && isNearBottom) {
                maintainScrollPosition();
            }

            textArea.style.height = "auto";
            textArea.style.height = `${Math.min(textArea.scrollHeight, 120)}px`; // 최대 높이 제한

            // 스크롤 위치 복원
            if (isKeyboardOpen && isNearBottom) {
                setTimeout(() => {
                    restoreScrollPosition();
                    scrollToBottom('instant');
                }, 0);
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            // Enter 키 처리 (Shift+Enter는 줄바꿈)
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                createChat();
            }
        };

        textArea.addEventListener('input', handleInput);
        textArea.addEventListener('keydown', handleKeyDown);

        return () => {
            textArea.removeEventListener('input', handleInput);
            textArea.removeEventListener('keydown', handleKeyDown);
        };
    }, [isKeyboardOpen, isNearBottom]);

    const createChat = useCallback(() => {
        const inputValue = textAreaRef.current?.innerText || "";
        if (inputValue.trim() === "") return;

        let parent = 0;
        if (replyMessageId !== null) parent = replyMessageId;

        const chatCreateSendEvent: ChatCreateSendEvent = {
            message: {channelId: Number(channelId), parent: parent, text: inputValue.trim()},
            type: "chatCreate"
        }

        sendMessage(JSON.stringify(chatCreateSendEvent));

        // 입력창 비우기
        if (textAreaRef.current) {
            textAreaRef.current.innerText = "";
            textAreaRef.current.style.height = "auto";
        }
        setReplyMessageId(null);

        // 메시지 전송 후 스크롤
        setShouldScrollToBottom(true);

        // 포커스 유지 (키보드가 열려있을 때만)
        if (isKeyboardOpen) {
            setTimeout(() => {
                textAreaRef.current?.focus();
            }, 50);
        }
    }, [channelId, replyMessageId, sendMessage, isKeyboardOpen]);

    const bottomRef = useRef<HTMLDivElement>(null);

    // 첫 로딩시 하단으로 스크롤
    useLayoutEffect(() => {
        if (firstLoadRef.current && messages.length > 0) {
            firstLoadRef.current = false;
            scrollToBottom('instant');
        }
    }, [messages, scrollToBottom]);

    // 새 메시지 도착시 스크롤 처리
    useEffect(() => {
        if (shouldScrollToBottom) {
            if (!isUserTouchingRef.current && isNearBottom) {
                scrollToBottom('smooth');
            }
            setShouldScrollToBottom(false);
        }
    }, [shouldScrollToBottom, isNearBottom, scrollToBottom]);

    // 스크롤 이벤트 리스너
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            checkIfNearBottom();
        };

        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => container.removeEventListener('scroll', handleScroll);
    }, [checkIfNearBottom]);

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
            if (message.parentMessage !== null) {
                parentMessage = {
                    createdDate: message.parentMessage.createdDate,
                    flushed: false,
                    id: message.parentMessage.id,
                    parentMessage: null,
                    text: message.parentMessage.chatMessage,
                    user: message.parentMessage.user,
                    mine: message.mine
                }
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
            setShouldScrollToBottom(true);
        }

        const handleChatUpdate = (message: ChatUpdateReceiveEvent) => {
            if (message.channelId === Number(channelId)) {
                setMessages((prevData) =>
                    prevData.map((data) => {
                        if (data.id === message.id) {
                            data.text = message.text;
                        }
                        return data;
                    })
                )
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

    // 채팅 메세지 데이터 가져오기 useEffect
    useEffect(() => {
        getMessage();
    }, []);

    useEffect(() => {
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/channel/info?spaceId=${space}&channelId=${channelId}`, {withCredentials: true})
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
                if (entry.isIntersecting &&
                    minPageNumber !== null &&
                    minPageNumber > 0 &&
                    !isLoading &&
                    entry.intersectionRatio > 0.5) {
                    loadPreviousMessages(minPageNumber - 1);
                }
            },
            {
                root: scrollContainerRef.current,
                rootMargin: '20px 0px 0px 0px',
                threshold: [0.5, 1.0]
            }
        );

        if (!isLoading) {
            observer.observe(sentinel);
        }

        return () => observer.disconnect();
    }, [minPageNumber, isLoading]);

    const loadPreviousMessages = async (pageNumber: number) => {
        if (isLoading) return;

        if (minPageNumber !== null && pageNumber >= minPageNumber) return;

        setIsLoading(true);

        const container = scrollContainerRef.current;
        if (!container) {
            setIsLoading(false);
            return;
        }

        const prevScrollHeight = container.scrollHeight;
        const prevScrollTop = container.scrollTop;

        try {
            const res = await axios.get<MessagePageResponse>(
                `${process.env.NEXT_PUBLIC_API_URL}/api/v1/message?spaceId=${space}&channelId=${channelId}&pageNumber=${pageNumber}`,
                {withCredentials: true}
            );

            if (res.status === 200) {
                const newMessages = res.data.messageList;

                if (newMessages.length === 0) {
                    setIsLoading(false);
                    return;
                }

                container.style.overflow = 'hidden';

                setMessages(prev => [...newMessages, ...prev]);
                setMinPageNumber(res.data.currentPageNumber);

                requestAnimationFrame(() => {
                    const newScrollHeight = container.scrollHeight;
                    const heightDiff = newScrollHeight - prevScrollHeight;
                    container.scrollTop = prevScrollTop + heightDiff;
                    container.style.overflow = 'auto';
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    // 터치 및 휠 이벤트 처리
    useEffect(() => {
        const scrollContainer = scrollContainerRef.current;
        if (!scrollContainer) return;

        const handleWheel = (e: WheelEvent) => {
            const originalDelta = e.deltaY;
            const reducedDelta = originalDelta * 0.3;
            e.preventDefault();
            scrollContainer.scrollTop += reducedDelta;
        };

        const handleTouchStart = () => {
            isUserTouchingRef.current = true;
        };

        const handleTouchEnd = () => {
            setTimeout(() => {
                isUserTouchingRef.current = false;
            }, 150);
        };

        scrollContainer.addEventListener('wheel', handleWheel, {passive: false});
        scrollContainer.addEventListener('touchstart', handleTouchStart, {passive: true});
        scrollContainer.addEventListener('touchend', handleTouchEnd, {passive: true});
        scrollContainer.addEventListener('touchcancel', handleTouchEnd, {passive: true});

        return () => {
            scrollContainer.removeEventListener('wheel', handleWheel);
            scrollContainer.removeEventListener('touchstart', handleTouchStart);
            scrollContainer.removeEventListener('touchend', handleTouchEnd);
            scrollContainer.removeEventListener('touchcancel', handleTouchEnd);
        };
    }, []);

    // 입력 컨테이너 높이 측정
    useEffect(() => {
        const resizeObserver = new ResizeObserver(() => {
            if (inputContainerRef.current) {
                const newHeight = inputContainerRef.current.offsetHeight;
                setInputHeight(newHeight);

                // 높이 변화시 하단에 있다면 스크롤 조정
                if (isNearBottom) {
                    setTimeout(() => {
                        scrollToBottom('instant');
                    }, 0);
                }
            }
        });

        if (inputContainerRef.current) {
            resizeObserver.observe(inputContainerRef.current);
            setInputHeight(inputContainerRef.current.offsetHeight);
        }

        return () => {
            resizeObserver.disconnect();
        };
    }, [isNearBottom, scrollToBottom]);

    // 헤더 높이 측정
    useEffect(() => {
        const observer = new ResizeObserver(() => {
            if (channelHeaderRef.current) {
                setChannelHeaderHeight(channelHeaderRef.current.offsetHeight);
            }
        });

        if (channelHeaderRef.current) {
            observer.observe(channelHeaderRef.current);
            setChannelHeaderHeight(channelHeaderRef.current.offsetHeight);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div
            className="overflow-y-hidden bg-white"
            style={{ height: `100dvh` }}
        >
            {/* 채널 헤더 */}
            <div
                className="flex bg-nav py-1 px-2 font-bold items-center gap-2 top-0 left-0 right-0 z-[80]"
                ref={channelHeaderRef}
            >
                {channelName}
                <ChannelSetting
                    mine={mine}
                    openWindow={() => setIsUpdateShow(true)}
                    closeWindow={() => setIsUpdateShow(false)}
                    channelId={Number(channelId)}
                />
            </div>

            {showJoinDialog && (
                <JoinDialog
                    getMessage={getMessage}
                    close={() => setShowJoinDialog(false)}
                />
            )}

            {/* 메시지 영역 */}
            <div
                ref={scrollContainerRef}
                className="overflow-y-auto scrollbar-hide"
                style={{
                    height: `calc(100dvh - ${channelHeaderHeight}px - ${inputHeight}px)`,
                    // iOS Safari의 bounce 효과 방지
                    overscrollBehavior: 'none',
                    WebkitOverflowScrolling: 'touch'
                }}
            >
                {/* 상단 센티넬 */}
                {!isLoading && minPageNumber !== null && minPageNumber > 0 && (
                    <div ref={topSentinelRef} className="h-10 w-full flex-shrink-0"/>
                )}

                {/* 메시지 목록 */}
                {messages.map((message) => (
                    <div key={message.id} className="message-row w-full">
                        <MessageCard
                            scrollContainerRef={scrollContainerRef}
                            scroll={scroll}
                            refCallback={(el) => messageRefs.current[message.id] = el}
                            parentMessage={message.parentMessage === null ? undefined : message.parentMessage}
                            data={message}
                            setMessageId={(messageId: number) => setReplyMessageId(messageId)}
                        />
                    </div>
                ))}
                <div ref={bottomRef}/>
            </div>

            {/* 입력창 영역 */}
            <div
                ref={inputContainerRef}
                className="bg-white border-t border-gray-200"
                style={{
                    // 키보드가 열릴 때 하단에 고정
                    position: isKeyboardOpen ? 'fixed' : 'relative',
                    bottom: isKeyboardOpen ? `${keyboardHeight}px` : 'auto',
                    left: isKeyboardOpen ? 0 : 'auto',
                    right: isKeyboardOpen ? 0 : 'auto',
                    zIndex: isKeyboardOpen ? 100 : 'auto',
                    transform: isKeyboardOpen ? 'translate3d(0, 0, 0)' : 'none',
                    // 부드러운 애니메이션
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
            >
                <Box className="flex flex-col w-full h-full px-2 py-2">
                    {/* 답장 바 */}
                    {replyMessageId !== null && (
                        <MessageReplyBar
                            onCancel={() => setReplyMessageId(null)}
                            message={messages.find(msg => msg.id === replyMessageId)}
                        />
                    )}

                    {/* 입력 영역 */}
                    <div className="flex gap-2 items-end">
                        <div
                            contentEditable
                            className="flex-1 min-h-[40px] max-h-[120px] border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 overflow-auto px-3 py-2 text-base"
                            style={{
                                fontSize: '16px', // iOS에서 줌 방지
                                lineHeight: '1.4',
                                wordBreak: 'break-word',
                                whiteSpace: 'pre-wrap'
                            }}
                            ref={textAreaRef}
                            placeholder="메시지를 입력하세요..."
                            data-placeholder="메시지를 입력하세요..."
                            suppressContentEditableWarning={true}
                            onFocus={() => {
                                // 포커스시 하단으로 스크롤
                                if (isNearBottom) {
                                    setTimeout(() => scrollToBottom('smooth'), 300);
                                }
                            }}
                        />

                        <Button
                            type="button"
                            className="flex-shrink-0 px-4 py-2"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                createChat();
                            }}
                        >
                            전송
                        </Button>
                    </div>
                </Box>
            </div>

            {/* 스타일 추가 */}
            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                
                /* contentEditable placeholder 스타일 */
                [contenteditable]:empty:before {
                    content: attr(data-placeholder);
                    color: #9ca3af;
                    pointer-events: none;
                }
                
                /* iOS에서 입력창 확대 방지 */
                [contenteditable] {
                    -webkit-user-select: auto;
                    -webkit-touch-callout: default;
                }
            `}</style>
        </div>
    );
}