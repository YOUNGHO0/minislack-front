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

    const [showUserList, setShowUserList] = useState(false);
    const params = useParams();
    const channelId = params.channel;
    const space = params.space;
    const {sendMessage} = useWebSocket();
    const [userListPosition, setUserListPosition] = useState<{ x: number, y: number } | null>(null);
    const savedRangeRef = useRef<Range | null>(null);
    const [mentionSearchTerm, setMentionSearchTerm] = useState("");

    useEffect(() => {

        console.log("showUserList : " + showUserList)
    }, [showUserList]);

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

    const handleKeyUp = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === '@') {
            const coords = getCaretCoordinates();
            if (!coords) return;
            setUserListPosition({ x: coords.x, y: coords.y + coords.height });
            setMentionSearchTerm(""); // 새로 시작
            setShowUserList(true);
        } else if (showUserList) {
            // @ 모드일 때만 실시간 검색어 업데이트
            const mentionText = getAtMentionText();
            console.log(mentionText)
            setMentionSearchTerm(mentionText);
        }

        if (e.key === 'Escape') {
            setShowUserList(false);
        }
    };

    const getAtMentionText = () => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return "";

        const range = selection.getRangeAt(0);
        const node = range.startContainer;
        if (node.nodeType !== Node.TEXT_NODE) return "";

        const text = (node as Text).data;
        const cursorPos = range.startOffset;

        // '@'가 커서 앞에 없으면 빈 문자열
        const atPos = text.lastIndexOf('@', cursorPos - 1);
        if (atPos === -1) return "";

        // '@' 이후 커서까지의 문자열 추출
        return text.substring(atPos + 1, cursorPos);
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

        const startContainer = range.startContainer;
        const startOffset = range.startOffset;

        if (startContainer.nodeType === Node.TEXT_NODE) {
            const textNode = startContainer as Text;
            const text = textNode.data;

            // 마지막 @를 찾고 @를 포함하는 이후의 문자를 전부 지운다
            const atIndex = text.lastIndexOf("@", startOffset - 1);
            if (atIndex !== -1) {

                // @부터 커서까지 삭제하기 위해 Range 조정
                range.setStart(textNode, atIndex);
                range.setEnd(textNode, startOffset);
                range.deleteContents();
                console.log("start :" ,atIndex + "end : " + startOffset)
                // caret 위치를 @ 삭제한 지점으로 이동
                range.setStart(textNode, atIndex);
                range.collapse(true);
            }

            // 지우고 난 뒤에 해당 span 태그를 삽입한다
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

        }
    };


    // 커서 바로 앞에 @ 문자가 있는지 체크하는 함수
    const removedCharacterWasSymbol = () => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return false;

        const range = selection.getRangeAt(0);
        const startContainer = range.startContainer;

        if (startContainer.nodeType === Node.TEXT_NODE) {
            const textNode = startContainer as Text;
            const text = textNode.data;
            const cursorPos = range.startOffset;
            console.log("cursorPod : " , range.startOffset)
            console.log("text : ", text);
            // 1) 커서 바로 왼쪽이 '@'인지
            console.log(cursorPos > 0 && text[cursorPos - 1] === '@')
            return cursorPos > 0 && text[cursorPos - 1] === '@'
        }
        return false;
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>)=>{

        if (e.key === 'Backspace' && removedCharacterWasSymbol()) {
            setShowUserList(false);
        }
        return;
    }





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
                    onKeyDown={(event)=>{
                        handleKeyDown(event);
                    }}
                    onKeyUp={(event)=>{
                        handleKeyUp(event);
                        savedRangeRef.current = saveCaretPosition();}}
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
                        <UserTagPage searchTerm={mentionSearchTerm} onSelectUser={(user) => {
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