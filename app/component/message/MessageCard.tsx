import React, { useState, useRef, useEffect } from 'react';
import { UserCircleIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import {Avatar, TextArea} from '@radix-ui/themes';
import {ReceivedMessage} from "@/types/type";
import {useWebSocket} from "@/WebSocket/WebSocketProvider";
import {MessageDeleteSendEvent, MessageEditSendEvent} from "@/types/events";
import {useParams} from "next/navigation";


export default function MessageCard(props: { data: ReceivedMessage }) {
    const [showMenu, setShowMenu] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(props.data.text);
    const [textWidth, setTextWidth] = useState<number | null>(null);
    const [showCommentBox, setShowCommentBox] = useState(false);
    const [showCommentList, setShowCommentList] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [contextMenuPos, setContextMenuPos] = useState<{x: number, y: number} | null>(null);

    const menuRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const commentRef = useRef<HTMLTextAreaElement>(null);
    const contextMenuRef = useRef<HTMLDivElement>(null);
    const {sendMessage} = useWebSocket();
    const {space,channel} = useParams();
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

    // 댓글 입력 창 포커스
    useEffect(() => {
        if (showCommentBox && commentRef.current) {
            commentRef.current.focus();
        }
    }, [showCommentBox]);

    const handleEdit = () => {
        if (textRef.current) {
            const width = textRef.current.offsetWidth;
            setTextWidth(width);
        }
        setIsEditing(true);
        setEditText(props.data.text);
        setShowMenu(false);
        setContextMenuPos(null);
        setShowCommentList(false);
    };

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

    const handleAddComment = () => {
        setShowCommentBox(true);
        setShowMenu(false);
        setContextMenuPos(null);
        // 댓글 목록이 열려있을 때만 유지, 닫혀있으면 그대로 둠
        // setShowCommentList(false); 제거
    };

    const handleShowComments = () => {
        setShowCommentList(!showCommentList);
        setShowCommentBox(false);
    };

    const handleSaveComment = () => {
        if (commentText.trim()) {
            console.log('댓글 저장됨 - 메시지 ID:', props.data.id, '댓글:', commentText);
            // 여기서 실제 댓글 저장 로직 구현
            setCommentText('');
            setShowCommentBox(false);
        }
    };

    const handleCancelComment = () => {
        setCommentText('');
        setShowCommentBox(false);
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
                className="m-4 p-2 flex min-w-60 w-fit rounded-lg border border-gray-200 hover:bg-gray-50 relative"
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
                            <div className="text-gray-900">{editText}</div>
                        )}
                    </div>

                    {/* 댓글 수 표시 */}
                    {props.data.comment && props.data.comment.length > 0 && (
                        <div
                            className="mt-2 text-xs text-blue-600 cursor-pointer hover:underline"
                            onClick={handleShowComments}
                        >
                            댓글 {props.data.comment.length}개
                        </div>
                    )}
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
                                {!props.data.flushed &&
                                    (<button
                                        onClick={handleEdit}
                                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors"
                                    >
                                        편집
                                    </button>
                                )}
                                <button
                                    onClick={handleAddComment}
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
                    </div>
                )}
            </div>

            {/* 댓글 목록 */}
            {showCommentList && props.data.comment && props.data.comment.length > 0 && (
                <div className="mx-4 mb-4 ml-16">
                    {props.data.comment.map((comment, index) => (
                        <div key={index} className="mb-2 p-3 bg-gray-50 border border-gray-200 rounded-lg w-fit min-w-60">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="text-xs font-medium text-gray-700">
                                    {/*{comment.user?.username || '익명'}*/}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {comment.createdDate ? formatTime(comment.createdDate) : '시간 정보 없음'}
                                </div>
                            </div>
                            <div className="text-sm text-gray-900">
                                {comment.text}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 댓글 입력 창 */}
            {showCommentBox && (
                <div className="mx-4 mb-4 ml-16 p-3 bg-gray-50 border border-gray-200 rounded-lg w-fit min-w-80">
                    <div className="text-sm text-gray-600 mb-2">댓글 작성</div>
                    <TextArea
                        ref={commentRef}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={handleCommentKeyDown}
                        className="text-xs w-full p-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={2}
                        placeholder="댓글을 입력하세요..."
                    />
                    <div className="flex justify-end gap-2 mt-2">
                        <button
                            onClick={handleCancelComment}
                            className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleSaveComment}
                            className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                        >
                            댓글 달기
                        </button>
                    </div>
                </div>
            )}

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
                        onClick={handleAddComment}
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