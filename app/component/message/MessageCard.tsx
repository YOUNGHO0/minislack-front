import React, {useEffect, useRef, useState} from 'react';
import {EllipsisHorizontalIcon} from '@heroicons/react/24/outline';
import {TextArea} from '@radix-ui/themes';
import {ReceivedMessage} from "@/types/type";
import {useWebSocket} from "@/WebSocket/WebSocketProvider";
import {MessageDeleteSendEvent, MessageEditSendEvent} from "@/types/events";
import {useParams} from "next/navigation";
import MessageReply from "@/app/component/message/MessageReply";
import ChatAvatar from "@/app/component/avatar/ChatAvatar";
import dynamic from "next/dynamic";
import DOMPurify from 'dompurify';
import MessageCardEdit from "@/app/component/message/MessageCardEdit";

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function MessageCard(props: {
    scrollContainerRef?: React.RefObject<HTMLDivElement | null>,
    scroll : (id:number)=>void,
    refCallback?: (el: HTMLDivElement | null) => void,
    parentMessage:ReceivedMessage|undefined,
    data: ReceivedMessage,
    setMessageId : (messageId:number) =>void
}) {
    const [showMenu, setShowMenu] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(props.data.text);
    const [textWidth, setTextWidth] = useState<number | null>(null);

    const [contextMenuPos, setContextMenuPos] = useState<{x: number, y: number} | null>(null);

    const menuRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const contextMenuRef = useRef<HTMLDivElement>(null);
    const {sendMessage} = useWebSocket();
    const {space,channel} = useParams();
    const [safeHTML, setSafeHTML] = useState<string>("초기값");
    // 메시지 업데이트 시 Quill 내용 갱신
    useEffect(() => {
        if (props.data.text) {
            setSafeHTML( DOMPurify.sanitize(props.data.text));
        }
    }, []);


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
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(editText.length, editText.length);
        }
    }, [isEditing, editText?.length]);

    const handleEdit = () => {
        if (textRef.current) setTextWidth(textRef.current.offsetWidth);
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
            if (menuRect.bottom > containerRect.bottom) {
                container.scrollTop += menuRect.bottom - containerRect.bottom + 10;
            }
        });
    }, [showMenu]);


    const handleDelete = () => {
        const message : MessageDeleteSendEvent = {message: {channelId: Number(channel), id: props.data.id}, type: "chatDelete"};
        sendMessage(JSON.stringify(message));
        setShowMenu(false);
        setContextMenuPos(null);
    };

    const handleAddComment = (messageId:number) => {
        setShowMenu(false);
        setContextMenuPos(null);
        props.setMessageId(messageId);
    };


    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setContextMenuPos({ x: e.clientX, y: e.clientY });
        setShowMenu(false);
    };

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleString('ko-KR', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });
    };

    useEffect(() => {
        if (props.data.text) {
            setSafeHTML(DOMPurify.sanitize(props.data.text));
        }
    }, [props.data.text]);

    return (
        <>
            <div
                ref={props.refCallback}
                className={`m-2 p-2 flex min-w-60 w-fit rounded-lg shadow-sm relative ${props.data.mine ? "bg-orange-50" : "bg-blue-50"} hover:bg-black/15`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onContextMenu={handleContextMenu}
            >
                <div className="w-fit p-1 flex flex-col">
                    <ChatAvatar name={props.data.user?.nickName[0]}/>
                </div>

                <div className="ml-4 flex-col p-0 flex-1">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="font-medium text-sm text-gray-700">
                                {props.data.user?.nickName}
                                {props.data.mine && <span className="text-orange-400 ml-1 font-bold">(나)</span>}
                            </div>
                            <div
                                className="text-xs text-gray-500">{formatTime(props.data.createdDate || "undefined")}</div>
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
                                    style={{width: textWidth ? `${textWidth}px` : 'auto'}}
                                    rows={3}
                                />
                                <div className="flex justify-between gap-2">
                                    <button onClick={handleCancelEdit}
                                            className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-colors">취소
                                    </button>
                                    <button onClick={handleSaveEdit}
                                            className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors">저장
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {props.parentMessage &&
                                    <MessageReply scroll={props.scroll} message={props.parentMessage}/>}
                                {/* 메세지 렌더링 */}
                                <div
                                    className="font-bold text-sm  whitespace-pre-line break-words"
                                    dangerouslySetInnerHTML={{__html: safeHTML}}
                                />
                            </>
                        }
                    </div>
                </div>

                {isHovered && !isEditing && (
                    <div className="absolute top-2 right-2">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors bg-white shadow-sm border border-gray-200"
                        >
                            <EllipsisHorizontalIcon className="w-4 h-4 text-gray-500"/>
                        </button>

                        {showMenu && (
                            <div ref={menuRef}
                                 className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[100px]">
                                {props.data.mine && !props.data.flushed && <button onClick={handleEdit}
                                                                                   className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors">편집</button>}
                                <button onClick={() => handleAddComment(props.data.id)}
                                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors">댓글
                                    달기
                                </button>
                                {props.data.mine && <button onClick={handleDelete}
                                                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 text-red-600 transition-colors">삭제</button>}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {contextMenuPos && (
                <div ref={contextMenuRef}
                     className="fixed bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[120px]"
                     style={{left: contextMenuPos.x, top: contextMenuPos.y}}>
                    <button onClick={handleEdit}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors">편집
                    </button>
                    <button onClick={() => handleAddComment(props.data.id)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors">댓글 달기
                    </button>
                    <button onClick={handleDelete}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 text-red-600 transition-colors">삭제
                    </button>
                </div>
            )}

        </>
    );
}
