import React, {useEffect, useRef, useState} from 'react';
import {EllipsisHorizontalIcon} from '@heroicons/react/24/outline';
import {Avatar, TextArea} from '@radix-ui/themes';
import {ReceivedMessage} from "@/types/type";
import {useWebSocket} from "@/WebSocket/WebSocketProvider";
import {MessageDeleteSendEvent, MessageEditSendEvent} from "@/types/events";
import {useParams} from "next/navigation";
import MessageReply from "@/app/component/message/MessageReply";
import DOMPurify from 'dompurify';


export default function MessageCard(props: {  scrollContainerRef?: React.RefObject<HTMLDivElement | null> ,scroll : (id:number)=>void , refCallback?: (el: HTMLDivElement | null) => void, parentMessage:ReceivedMessage|undefined, data: ReceivedMessage, setMessageId : (messageId:number) =>void }) {
    const [showMenu, setShowMenu] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(props.data.text);
    const [textWidth, setTextWidth] = useState<number | null>(null);
    const [commentText, setCommentText] = useState('');
    const [contextMenuPos, setContextMenuPos] = useState<{x: number, y: number} | null>(null);

    const menuRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const contextMenuRef = useRef<HTMLDivElement>(null);
    const {sendMessage} = useWebSocket();
    const {space,channel} = useParams();
    const [safeHtml, setSafeHtml] = useState<string>('');

    useEffect(() => {
        // 서버에서 받은 HTML을 DOMPurify로 정제
        const clean = DOMPurify.sanitize(props.data.text, {
            ALLOWED_TAGS: ['span', 'b', 'i', 'u', 'a', 'br'],
            ALLOWED_ATTR: ['class', 'href']
        });
        setSafeHtml(clean);
    }, [props.data.text]);


    useEffect(() => {
        if (!isEditing) {
            setEditText(props.data.text);
        }
    }, [props.data.text, isEditing]);

    // 메뉴 외부 클릭 시 닫기
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
            if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
                setContextMenuPos(null);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // 편집 모드 진입 시 텍스트 영역에 포커스
    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(editText.length, editText.length);
        }
    }, [isEditing, editText?.length]);


    const handleEdit = () => {
        if (textRef.current) {
            const width = textRef.current.offsetWidth;
            setTextWidth(width);
        }
        setIsEditing(true);
        setEditText(props.data.text);
        setShowMenu(false);
        setContextMenuPos(null);
    };

    useEffect(() => {
        if (!showMenu || !menuRef.current || !props.scrollContainerRef?.current) return;

        requestAnimationFrame(() => {
            const menuRect = menuRef.current!.getBoundingClientRect();
            const container = props.scrollContainerRef!.current!;
            const containerRect = container.getBoundingClientRect();
            const containerHeight = container.clientHeight;

            // 메뉴가 아래로 잘릴 때
            if (menuRect.bottom > containerRect.bottom) {
                const overflowAmount = menuRect.bottom - containerRect.bottom;
                // 현재 스크롤 위치에 overflow만큼 더해서 스크롤 내림
                container.scrollTop += overflowAmount + 10; // 10px 여유 공간 추가
            }
        });
    }, [showMenu]);

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditText(props.data.text);
    };

    const handleSaveEdit = () => {
        const message : MessageEditSendEvent = {message: {channelId: Number(channel), chatId: props.data.id, text: editText}, type: "chatUpdate"}
        sendMessage(JSON.stringify(message));
        setIsEditing(false);
    };

    const handleDelete = () => {
        const message : MessageDeleteSendEvent = {message: {channelId: Number(channel), id: props.data.id}, type: "chatDelete"}
        sendMessage(JSON.stringify(message));
        setShowMenu(false);
        setContextMenuPos(null);
    };

    const handleAddComment = (messageId:number) => {
        setShowMenu(false);
        setContextMenuPos(null);
        props.setMessageId(messageId);
        // 댓글 목록이 열려있을 때만 유지, 닫혀있으면 그대로 둠
        // setShowCommentList(false); 제거
    };

    const handleSaveComment = () => {
        if (commentText.trim()) {
            console.log('댓글 저장됨 - 메시지 ID:', props.data.id, '댓글:', commentText);
            // 여기서 실제 댓글 저장 로직 구현
            setCommentText('');
        }
    };

    const handleCancelComment = () => {
        setCommentText('');
    };

    // 우클릭 컨텍스트 메뉴
    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setContextMenuPos({ x: e.clientX, y: e.clientY });
        setShowMenu(false);
    };

    // 시간 포맷팅 함수
    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Enter 키 처리 (편집)
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSaveEdit();
        } else if (e.key === 'Escape') {
            handleCancelEdit();
        }
    };

    // Enter 키 처리 (댓글)
    const handleCommentKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSaveComment();
        } else if (e.key === 'Escape') {
            handleCancelComment();
        }
    };




    return (
        <>
            <div
                ref={props.refCallback}
                className="m-2 p-2 flex min-w-60 w-fit rounded-l shadow-sm rounded-lg hover:bg-gray-50 relative"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onContextMenu={handleContextMenu}
            >
                <div className="w-fit p-1 flex flex-col">
                    <Avatar variant="solid" fallback={props.data.user?.nickName[0]||'U'} />
                </div>

                <div className="ml-4 flex-col p-0 flex-1">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="font-medium text-sm text-gray-700">
                                {props.data.user?.nickName}
                            </div>
                            <div className="text-xs text-gray-500">
                                {formatTime(props.data.createdDate || "undefined")}
                            </div>
                        </div>
                    </div>

                    <div className="mt-1" ref={textRef}>
                        {isEditing ? (
                            <div className="space-y-2">
                                <TextArea
                                    ref={textareaRef}
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="text-xs w-full p-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    style={{ width: textWidth ? `${textWidth}px` : 'auto' }}
                                    rows={3}
                                />
                                <div className="flex justify-between gap-2">
                                    <button
                                        onClick={handleCancelEdit}
                                        className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                                    >
                                        취소
                                    </button>
                                    <button
                                        onClick={handleSaveEdit}
                                        className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                                    >
                                        저장
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {props.parentMessage !== undefined ?
                                    <MessageReply scroll={props.scroll} message={props.parentMessage}></MessageReply
                                    >
                                    : <></>}
                                <div
                                    className="text-gray-900 whitespace-pre-line break-words"
                                    dangerouslySetInnerHTML={{__html: safeHtml}}
                                />
                            </>
                        )}
                    </div>

                </div>

                {/* 호버 시 나타나는 점 세개 버튼 - 편집 모드가 아닐 때만 표시 */}
                {isHovered && !isEditing && (
                    <div className="absolute top-2 right-2">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors bg-white shadow-sm border border-gray-200"
                        >
                            <EllipsisHorizontalIcon className="w-4 h-4 text-gray-500" />
                        </button>

                        {/* 드롭다운 메뉴 */}
                        {showMenu && (
                            <div
                                className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[100px]"
                                ref={menuRef}
                            >
                                {props.data.mine&& !props.data.flushed &&
                                    (<button
                                        onClick={handleEdit}
                                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors"
                                    >
                                        편집
                                    </button>
                                )}
                                <button
                                    onClick={()=>handleAddComment(props.data.id)}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors"
                                >
                                    댓글 달기
                                </button>
                                {props.data.mine && <button
                                    onClick={handleDelete}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 text-red-600 transition-colors"
                                >
                                    삭제
                                </button>}
                            </div>
                        )}
                    </div>
                )}
            </div>


            {/* 우클릭 컨텍스트 메뉴 */}
            {contextMenuPos && (
                <div
                    className="fixed bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[120px]"
                    style={{
                        left: contextMenuPos.x,
                        top: contextMenuPos.y
                    }}
                    ref={contextMenuRef}
                >
                    <button
                        onClick={handleEdit}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors"
                    >
                        편집
                    </button>
                    <button
                        onClick={()=>handleAddComment(props.data.id)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors"
                    >
                        댓글 달기
                    </button>
                    <button
                        onClick={handleDelete}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 text-red-600 transition-colors"
                    >
                        삭제
                    </button>
                </div>
            )}
        </>
    );
}