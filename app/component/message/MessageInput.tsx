'use client'
import {Box} from "@radix-ui/themes";
import MessageReplyBar from "@/app/component/message/MessageReplyBar";
import {useEffect, useRef, useState} from "react";
import {ReceivedMessage} from "@/types/type";
import {ChatCreateSendEvent} from "@/types/events";
import {useParams} from "next/navigation";
import {useWebSocket} from "@/WebSocket/WebSocketProvider";

export default ({
                    messages,
                    replyMessageId,
                    setReplyMessageId
                }:
                    {
                        messages: ReceivedMessage[],
                        replyMessageId: number|null,
                        setReplyMessageId: React.Dispatch<React.SetStateAction<number | null>>
                    }) => {

    const replyMessageIdRef = useRef(replyMessageId);
    const inputContainerRef = useRef<HTMLDivElement>(null);
    const [inputHeight, setInputHeight] = useState(0);
    const prevInputHeight = useRef(0);
    const textAreaRef = useRef<HTMLDivElement>(null);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [showUserList, setShowUserList] = useState(false);
    const params = useParams();
    const channelId = params.channel;
    const space = params.space;
    const {sendMessage} = useWebSocket();

    useEffect(() => {
        replyMessageIdRef.current = replyMessageId;
    }, [replyMessageId]);

    useEffect(() => {
        const textArea = textAreaRef.current;
        if (!textArea) return;

        const isLgUp = window.innerWidth >= 1024;
        if (!isLgUp) return;

        let canSend = true;
        let isComposing = false;

        // 한글 조합 시작
        const handleCompositionStart = () => {
            isComposing = true;
        };

        // 한글 조합 종료
        const handleCompositionEnd = () => {
            isComposing = false;
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.stopPropagation();

                if (isComposing) return; // 조합 중일 땐 전송 금지
                if (!canSend) return;

                textArea.blur(); // IME 합성 종료 시도
                setTimeout(() => textArea.focus(), 0);

                createChat(); // 전송
                canSend = false;

                setTimeout(() => {
                    canSend = true;
                }, 500);
            }
        };

        textArea.addEventListener("compositionstart", handleCompositionStart);
        textArea.addEventListener("compositionend", handleCompositionEnd);
        textArea.addEventListener("keydown", handleKeyDown);

        return () => {
            textArea.removeEventListener("compositionstart", handleCompositionStart);
            textArea.removeEventListener("compositionend", handleCompositionEnd);
            textArea.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    // 키보드 높이 감지
    useEffect(() => {
        const visualViewport = window.visualViewport;
        let debounceTimeout: NodeJS.Timeout | null = null;

        const handleResize = () => {
            if (!visualViewport) return;
            const heightDiff = window.innerHeight - visualViewport.height;
            const threshold = 150;

            if (debounceTimeout) clearTimeout(debounceTimeout);

            // 키보드가 올라오는 중에 debounce
            debounceTimeout = setTimeout(() => {
                if (heightDiff > threshold) {
                    setKeyboardHeight(heightDiff);
                } else {
                    setKeyboardHeight(0);
                }
            }, 100); // 200ms 동안 이벤트 없으면 실행
        };

        if (visualViewport) {
            visualViewport.addEventListener("resize", handleResize);
            return () => {
                visualViewport.removeEventListener("resize", handleResize);
                if (debounceTimeout) clearTimeout(debounceTimeout);
            };
        }
    }, []);

    useEffect(() => {
        const textArea = textAreaRef.current;
        if (textArea) {
            // input 이벤트 리스너 추가
            const handleInput = () => {
                textArea.style.height = "auto";
                textArea.style.height = `${textArea.scrollHeight}px`;
            };

            textArea.addEventListener('input', handleInput);

            return () => {
                textArea.removeEventListener('input', handleInput);
            };
        }
    }, []);

    const createChat = () => {
        const inputValue = textAreaRef.current?.innerText || "";
        if (inputValue === "") return;

        // 키보드가 열려있을 때만 포커스 유지
        if (keyboardHeight > 0 && textAreaRef.current) {
            console.log("keyboardHeight : ", keyboardHeight);
            textAreaRef.current.focus();
        }

        let parent = 0;
        if (replyMessageIdRef.current) parent = replyMessageIdRef.current;
        console.log(replyMessageId)
        const chatCreateSendEvent: ChatCreateSendEvent = {
            message: {channelId: Number(channelId), parent: parent, text: inputValue},
            type: "chatCreate"
        }

        sendMessage(JSON.stringify(chatCreateSendEvent));

        // 입력창 비우기
        if (textAreaRef.current) {
            textAreaRef.current.innerText = "";
            textAreaRef.current.innerHTML = "";
            void textAreaRef.current.offsetHeight; // 강제 reflow
            console.log("log : " + (textAreaRef.current.innerText));

        }
        setReplyMessageId(null);
    }

    useEffect(() => {
        const resizeObserver = new ResizeObserver(() => {
            if (inputContainerRef.current) {
                setInputHeight(inputContainerRef.current.offsetHeight);
            }
        });

        if (inputContainerRef.current) {
            resizeObserver.observe(inputContainerRef.current);
            // 초기값 세팅
            setInputHeight(inputContainerRef.current.offsetHeight);
        }

        return () => {
            resizeObserver.disconnect();
        };
    }, []);


    const handleTyping = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === '@') {
            setShowUserList(true);

        }
        if (e.key === 'Escape') {
            setShowUserList(false);
        }
    };


    return <div
        ref={inputContainerRef}
        className=" bg-white"
    >
        <Box className="flex flex-col w-full px-2 py-2">
            {replyMessageId !== null ? <MessageReplyBar onCancel={() => setReplyMessageId(null)}
                                                        message={messages.find(msg => msg.id === replyMessageId)}></MessageReplyBar> : <></>}
            <div className="flex gap-2 items-center">
                <div
                    contentEditable
                    data-placeholder="여기에 입력하세요..."
                    className="placeholder relative flex-1 min-h-13 max-h-30 border-2 rounded focus:outline-none overflow-auto px-2 py-1"
                    ref={textAreaRef}
                />
                <input
                    type="button"
                    value="전송"
                    onKeyDown={handleTyping}
                    className="block lg:hidden px-4 py-2 bg-blue-600 text-white rounded"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        createChat();
                    }}
                />
            </div>
        </Box>
    </div>
}