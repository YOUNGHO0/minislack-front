import React, { useState, useRef, useEffect } from 'react';
import { UserCircleIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import {Avatar, TextArea} from '@radix-ui/themes';
import {Message} from "@/types/type";


export default function MessageCard(props: { data: Message }) {
    const [showMenu, setShowMenu] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(props.data.text);
    const [textWidth, setTextWidth] = useState<number | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const textRef = useRef<HTMLDivElement>(null);

    // 메뉴 외부 클릭 시 닫기
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
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
            // 텍스트 끝으로 커서 이동
            textareaRef.current.setSelectionRange(editText.length, editText.length);
        }
    }, [isEditing, editText.length]);

    const handleEdit = () => {
        // 편집 모드 진입 전에 현재 텍스트의 너비 측정
        if (textRef.current) {
            const width = textRef.current.offsetWidth;
            setTextWidth(width);
        }
        setIsEditing(true);
        setEditText(props.data.text);
        setShowMenu(false);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditText(props.data.text); // 원래 텍스트로 복원
    };

    const handleSaveEdit = () => {
        console.log('메시지 저장됨 - ID:', props.data.id, '새 텍스트:', editText);
        // 여기서 실제 저장 로직을 구현 (예: API 호출)
        setIsEditing(false);
        // 실제로는 props.data.text를 업데이트해야 하지만,
        // 이는 부모 컴포넌트에서 관리되어야 합니다.
    };

    const handleDelete = () => {
        console.log('삭제 클릭됨 - 메시지 ID:', props.data.id);
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

    // Enter 키 처리 (Shift+Enter는 줄바꿈, Enter만 누르면 저장)
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSaveEdit();
        } else if (e.key === 'Escape') {
            handleCancelEdit();
        }
    };

    return (
        <div
            className="m-4 p-2 flex min-w-60 w-fit rounded-lg border border-gray-200 hover:bg-gray-50 relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="w-fit p-1 flex flex-col">
                <Avatar variant="solid" fallback={props.data.user.username[0]} />
            </div>

            <div className="ml-4 flex-col p-0 flex-1">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="font-medium text-sm text-gray-700">
                            {props.data.user.username}
                        </div>
                        <div className="text-xs text-gray-500">
                            {formatTime(props.data.time)}
                        </div>
                    </div>
                </div>

                <div className="mt-1">
                    {isEditing ? (
                        <div className="space-y-2">
                            <TextArea

                                ref={textareaRef}
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className=" text-xs w-full p-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows={3}
                                placeholder="메시지를 입력하세요..."
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
                {props.data.comment.length > 0 && (
                    <div className="mt-2 text-xs text-blue-600">
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
                            <button
                                onClick={handleEdit}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors"
                            >
                                편집
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
    );
}
