'use client'
import {Box} from "@radix-ui/themes";
import MessageReplyBar from "@/app/component/message/MessageReplyBar";
import {useEffect, useRef, useState} from "react";
import {ReceivedMessage} from "@/types/type";
import {ChatCreateSendEvent} from "@/types/events";
import {useParams} from "next/navigation";
import {useWebSocket} from "@/WebSocket/WebSocketProvider";
import UserTagPage from "@/app/component/user/UserTagPage";

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
    const [userListPosition, setUserListPosition] = useState<{ x: number, y: number } | null>(null);
    const savedRangeRef = useRef<Range | null>(null);

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
        const inputValue = textAreaRef.current?.innerHTML || "";
        if (inputValue === "") return;

        // 키보드가 열려있을 때만 포커스 유지
        if (keyboardHeight > 0 && textAreaRef.current) {
            console.log("keyboardHeight : ", keyboardHeight);
            textAreaRef.current.focus();
        }

        let parent = 0;
        if (replyMessageIdRef.current) parent = replyMessageIdRef.current;
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
            const coords = getCaretCoordinates();
            if (!coords) return;
            // 좌표를 활용해서 팝업 위치 조정 등 가능
            setUserListPosition({ x: coords.x, y: coords.y + coords.height }); // y에 커서 아래쪽으로 약간 띄우기
            setShowUserList(true);

        }
        if (e.key === 'Escape') {
            setShowUserList(false);
        }
    };

    const getCaretCoordinates = () => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return null;

        const range = selection.getRangeAt(0).cloneRange();

        // 커서가 아무것도 선택하지 않고, 커서 위치를 나타내는 빈 Range가 됨
        range.collapse(true);

        // 좌표를 얻기 위해 range에 임시 span 삽입 후 위치 확인 (비파괴적 방법)
        const dummySpan = document.createElement("span");
        dummySpan.textContent = "\u200b"; // zero-width space (공백 문자)

        range.insertNode(dummySpan);
        const rect = dummySpan.getBoundingClientRect();

        // span 제거
        dummySpan.parentNode?.removeChild(dummySpan);

        // 커서 위치의 좌표 반환 (화면 기준)
        return { x: rect.left, y: rect.top, height: rect.height };
    };

    const saveCaretPosition = (): Range | null => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return null;
        const range = selection.getRangeAt(0).cloneRange(); // 복사해서 저장
        console.log(range)
        return range
    };

    const restoreCaretPosition = (savedRange: Range | null) => {
        if (!savedRange) return;
        const selection = window.getSelection();
        if (!selection) return;
        selection.removeAllRanges();
        console.log("saved : " , savedRange)
        selection.addRange(savedRange);
    };

    const insertUserName = (userName: string) => {
        if (!textAreaRef.current) return;

        textAreaRef.current.focus();

        const selection = window.getSelection();
        if (!selection) return;

        restoreCaretPosition(savedRangeRef.current);

        const range = selection.getRangeAt(0);

        // 1. '@' 문자 지우기 시도
        // 커서 기준 바로 앞 글자가 '@'면 삭제
        const startContainer = range.startContainer;
        const startOffset = range.startOffset;

        if (startContainer.nodeType === Node.TEXT_NODE) {
            const textNode = startContainer as Text;
            const text = textNode.data;

            // 커서 바로 앞 글자가 '@'인지 체크
            if (startOffset > 0 && text[startOffset - 1] === '@') {
                // '@' 문자 제거
                const newText =
                    text.slice(0, startOffset - 1) +
                    text.slice(startOffset);

                textNode.data = newText;

                // 커서 위치를 '@' 문자가 있던 자리로 한 칸 이동
                const newOffset = startOffset - 1;
                range.setStart(textNode, newOffset);
                range.collapse(true);

                selection.removeAllRanges();
                selection.addRange(range);
            }
        } else {
            // 만약 커서가 텍스트 노드가 아닌 경우, 다른 방식으로 처리 필요 (복잡하니 우선 이 경우는 넘어갑니다)
        }

        // 2. 사용자 이름 span 삽입 (위에서 만든 코드 그대로)
        const userSpan = document.createElement("span");
        userSpan.textContent = userName;
        userSpan.contentEditable = "false";
        userSpan.className = "bg-gray-200 rounded px-1.5 py-0.5 mr-1 select-none";

        range.insertNode(userSpan);

        const spaceText = document.createTextNode("\u00A0");
        userSpan.after(spaceText);

        range.setStartAfter(spaceText);
        range.collapse(true);

        selection.removeAllRanges();
        selection.addRange(range);

        savedRangeRef.current = range.cloneRange();
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
                    onKeyDown={handleTyping}
                    onKeyUp={()=>{savedRangeRef.current = saveCaretPosition();}}
                />
                {showUserList && userListPosition && (
                    <div
                        ref={(el) => {
                            if (el && userListPosition) {
                                const rect = el.getBoundingClientRect();
                                el.style.top = `${userListPosition.y - rect.height - 25}px`;
                                el.style.left = `${userListPosition.x}px`;
                            }
                        }}
                        style={{position: 'absolute', zIndex: 9999}}
                    >
                        <UserTagPage onSelectUser={(user) => {
                            insertUserName(user.nickName);
                            setShowUserList(false);
                        }}/>
                    </div>
                )}
                <input
                    type="button"
                    value="전송"
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