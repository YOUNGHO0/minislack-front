'use client'
import Container from "@mui/material/Container";
import MessageCard from "@/app/component/message/MessageCard";
import {useEffect, useLayoutEffect, useRef, useState} from "react";
import axios from "axios";
import {MessagePageResponse, ReceivedMessage} from "@/types/type";
import {ChatCreateReceiveEvent, ChatDeleteReceiveEvent, ChatUpdateReceiveEvent} from "@/types/events";
import emitter from "@/WebSocket/Emitter";
import {useParams} from "next/navigation";
import {JsonReceivedMessageInfo} from "@/types/webSocketType";
import JoinDialog from "@/app/component/channel/joindialog/JoinDialog";

export default ({
                    messages,
                    setMessages,
                    replyMessageId,
                    setReplyMessageId}
                    :{
                    messages:ReceivedMessage[],
                    setMessages: React.Dispatch<React.SetStateAction<ReceivedMessage[]>>;
                    replyMessageId:number|null,
                    setReplyMessageId : (messageId:number)=>void}) =>{

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(false); // useState로 변경
    const firstLoadRef = useRef(true);
    const topSentinelRef = useRef<HTMLDivElement>(null);
    const [minPageNumber, setMinPageNumber] = useState<number>(0);
    const [totalPageNumber, setTotalPageNumber] = useState<number | null>(null);
    const isUserTouchingRef = useRef(false);
    const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);


    const params = useParams();
    const channelId = params.channel;
    const space = params.space;
    const messageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
    const [showJoinDialog, setShowJoinDialog] = useState(false);

    //채팅 메세지 데이터 가져오기 useEffect
        useEffect(() => {
            getMessage();
        }, []);


    const scrollToBottom = () => {
        const container = scrollContainerRef.current;
        if (container) {
            container.scrollTo({
                top: container.scrollHeight,
                behavior: 'smooth',
            });
        }
    };

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

    // chatCreate 이벤트로 인한 메시지 추가 시에만 스크롤 처리
    useEffect(() => {
        if (shouldScrollToBottom) {
            if(isUserTouchingRef.current == false){
                requestAnimationFrame(() => {
                    scrollToBottom();
                });
            }
            setShouldScrollToBottom(false); // 다시 초기화
        }
    }, [shouldScrollToBottom]);

    useEffect(() => {

        const handler = (chattingMessage: JsonReceivedMessageInfo) => {
            console.log("입력")
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

        // 터치 이벤트 핸들러
        const handleTouchStart = () => {
            isUserTouchingRef.current = true;
            console.log("touch true");
        };

        const handleTouchEnd = () => {
            // 터치 종료 후 잠시 대기 후 플래그 해제
            setTimeout(() => {
                isUserTouchingRef.current = false;
                console.log("no touch state");
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

        // chatCreate 이벤트로 인한 메시지 추가임을 표시
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

    // 채널 관련 UseEffect
    useEffect(() => {

        emitter.on("chatCreate", handleChatCreate);
        emitter.on("chatUpdate", handleChatUpdate);
        emitter.on("chatDelete", handleChatDelete);

        return () => {
            emitter.off("chatCreate", handleChatCreate);
            emitter.off("chatUpdate", handleChatUpdate);
            emitter.off("chatDelete", handleChatDelete)
        };
    }, [channelId]);



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

    useLayoutEffect(() => {
        if (firstLoadRef.current && messages.length > 0) {
            firstLoadRef.current = false;
            const container = scrollContainerRef.current;
            if (container) {
                container.scrollTo({
                    top: container.scrollHeight,
                    behavior: 'instant',
                });
            }
        }
    }, [messages]);

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

    return <>
    <Container
        ref={scrollContainerRef}
        className="flex-4 h-30 overflow-y-scroll "

    >
        {/* 상단 감지용 센티넬 - 로딩 중이 아니고 더 불러올 데이터가 있을 때만 보임 */}
        {!isLoading && minPageNumber !== null && minPageNumber > 0 && (
            <div ref={topSentinelRef} className="h-10 w-full flex-shrink-0"/>
        )}

        {messages.map((message) => (
            <div key={message.id} className="message-row w-full">
                <MessageCard scrollContainerRef={scrollContainerRef} scroll={scroll}
                             refCallback={(el) => messageRefs.current[message.id] = el}
                             parentMessage={message.parentMessage === null ? undefined : message.parentMessage}
                             data={message} setMessageId={(messageId: number) => setReplyMessageId(messageId)}/>
            </div>
        ))}
    </Container>
        {showJoinDialog && <JoinDialog getMessage={getMessage} close={() => setShowJoinDialog(false)}/>}
    </>

}