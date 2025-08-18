'use cline'
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {useParams} from "next/navigation";
import {useWebSocket} from "@/WebSocket/WebSocketProvider";
import {ReceivedMessage, User} from "@/types/type";
import MessageReplyBar from "@/app/component/message/MessageReplyBar";
import "quill/dist/quill.snow.css";
import Quill from "quill";
import axios from "axios";

export default ({
                    messages,
                    replyMessageId,
                    setReplyMessageId,
                    keyboardHeight,
                    setKeyboardHeight,
                }: {
    keyboardHeight:number,
    setKeyboardHeight: React.Dispatch<React.SetStateAction<number>>,
    messages: ReceivedMessage[],
    replyMessageId: number | null,
    setReplyMessageId: React.Dispatch<React.SetStateAction<number | null>>
}) => {
    const [value, setValue] = useState('');
    const editorRef = useRef<HTMLDivElement>(null);
    const quillRef = useRef<Quill>(null);
    const params = useParams();
    const space = params.space;
    const channelId = params.channel;
    const { sendMessage } = useWebSocket();
    const [mentionOpen,setMentionOpen] = useState(false);

    useLayoutEffect(() => {
        axios
            .get<User[]>(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/space/users/without?spaceId=${space}`, {
                withCredentials: true,
            })
            .then((res) => {
               setAtValues(res.data)
            });
    }, []);

    const [atValues,setAtValues] = useState<User[]>([]);

    const hashValues = [
        { id: 3, value: "Fredrik Sundqvist 2" },
        { id: 4, value: "Patrik Sjölin 2" }
    ];

    const [isQuillReady, setIsQuillReady] = useState(false);

    useEffect(() => {
        if (!editorRef.current) return;

        import('quill').then((QuillModule) => {
            import('quill-mention').then((MentionModule) => {
                const { Mention, MentionBlot } = MentionModule;

                QuillModule.default.register({
                    'blots/mention': MentionBlot,
                    'modules/mention': Mention,
                });

                const quill = new QuillModule.default(editorRef.current!, {
                    theme: 'bubble',
                    modules: {
                        toolbar: false,
                        mention: {
                            allowedChars: /^[\w\s가-힣]*$/,
                            mentionDenotationChars: ['@',],
                            isolateCharacter: true,
                            allowInlineMentionChar: false,
                            showDenotationChar: true,
                            onOpen: () => setMentionOpen(true),
                            onClose: () => setTimeout(() => setMentionOpen(false), 150),
                            renderItem: function (item: User, searchTerm: string) {
                                const wrapper = document.createElement("div");
                                wrapper.className = "flex items-center gap-2";
                                // 아바타 컨테이너
                                const avatar = document.createElement("div");
                                avatar.style.width = "32px";
                                avatar.style.height = "32px";
                                avatar.style.borderRadius = "50%";
                                avatar.style.backgroundColor = "#ccc";
                                avatar.style.display = "flex";
                                avatar.style.alignItems = "center";
                                avatar.style.justifyContent = "center";
                                avatar.textContent = item.nickName[0]; // 첫 글자 fallback

                                // 닉네임
                                const name = document.createElement("div");
                                name.textContent = item.nickName;

                                wrapper.appendChild(avatar);
                                wrapper.appendChild(name);

                                return wrapper;
                            },
                            source: function (
                                searchTerm: string,
                                renderList: (items: any[], searchTerm: string) => void,
                                mentionChar: string
                            ) {
                                let values = mentionChar === '@'
                                    ? atValues.map(user => ({ ...user, value: user.nickName }))
                                    : hashValues;
                                console.log(atValues)
                                if (searchTerm.length === 0) {
                                    renderList(values, searchTerm);
                                } else {
                                    const matches = values.filter(v =>
                                        v.value.toLowerCase().includes(searchTerm.toLowerCase())
                                    );
                                    renderList(matches, searchTerm);
                                }
                            },

                        },
                    },
                });

                quillRef.current = quill;
                setIsQuillReady(true);
            });
        });
    }, [atValues]);



    const createChat = () => {
        const plainText = quillRef.current?.getText().trim() || '';

        if (plainText === '') {
            quillRef.current?.setText('');
            setValue('');
            return;
        }

        const parent = replyMessageId

        const chatCreateSendEvent = {
            message: { channelId: Number(channelId), parent, text: quillRef.current?.root.innerHTML || '' },
            type: "chatCreate",
        };

        sendMessage(JSON.stringify(chatCreateSendEvent));

        quillRef.current?.setText('');
        setValue('');
        setReplyMessageId(null);
    };

    return (
        <div className={"w-full flex flex-col"}>
            <div className={"w-full"}>
                {replyMessageId !== null && (
                    <MessageReplyBar
                        onCancel={() => setReplyMessageId(null)}
                        message={messages.find(msg => msg.id === replyMessageId)}
                    />
                )}
            </div>

            <div className={"px-2 flex w-full items-center"}
                 onKeyDownCapture={(e) => {
                     if (e.code === 'Enter') {
                         if (mentionOpen) return;
                         e.preventDefault()
                     }
                 }}
            >
                <div
                    className="focus:border-[#f77915] border-neutral-400 focus:shadow-md hover:border-[#f77915] hover:shadow-md w-full min-h-13 max-h-30 px-2 py-1 rounded border-3 transition-all duration-300 ease-in-out"
                    style={{height: 'auto', overflowY: 'auto'}}
                    ref={editorRef}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                        }
                    }}
                    onKeyUp={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            if (!mentionOpen) {
                                createChat();
                                if(quillRef.current){
                                    quillRef.current.focus();
                                }
                            }
                        }
                    }}
                />
                <input
                    type="button"
                    value="전송"
                    className="bg-[#f77915] m-2 h-10 lg:hidden px-4 py-2  text-white rounded"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        createChat();

                        // 키보드가 열려있을 때만 포커스 유지
                        if (keyboardHeight > 0 && quillRef.current) {
                            quillRef.current.focus();
                        }
                    }}
                />
            </div>
            <style jsx global>{`
                .ql-mention-list-container {
                    position: absolute !important;
                    z-index: 90;
                    background: white !important;
                    border: 1px solid #e5e7eb !important;
                    border-radius: 6px !important;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
                    max-height: 200px !important;
                    overflow-y: auto !important;
                    min-width: 200px !important;
                }

                .ql-mention-list {
                    padding: 4px 0 !important;
                    margin: 0 !important;
                    list-style: none !important;
                }

                .ql-mention-list-item {
                    padding: 8px 12px !important;
                    cursor: pointer !important;
                    border: none !important;
                    background: none !important;
                    width: 100% !important;
                    text-align: left !important;
                    color: #374151 !important;
                    font-size: 14px !important;
                    transition: background-color 0.15s ease-in-out !important;
                }

                .ql-mention-list-item:hover,
                .ql-mention-list-item.selected {
                    background-color: #f3f4f6 !important;
                    color: #111827 !important;
                }

                .ql-mention-list-item.selected {
                    background-color: #dbeafe !important;
                    color: #1e40af !important;
                }

                .mention-item {
                    display: block;
                    width: 100%;
                }

                /* Quill 컨테이너의 overflow 문제 해결 */
                .ql-container {
                    overflow: visible !important;
                    border-color: rgba(247, 121, 21, 0.3);
                }
                .ql-container:focus-within {
                    border-color: #f77915;
                }

                .ql-editor {
                    overflow-y: auto;
                    padding: 0px;
                  
                }

                .mention {
                    background-color: #e6f3ff; /* 연한 파란 배경 */
                    border-radius: 4px;
                    padding: 2px 4px;
                    color: #0366d6; /* 파란 글자 */
                    font-weight: bold;
                    cursor: pointer;
                }

                /* 멘션 앞의 @ 기호 스타일 */
                .mention .ql-mention-denotation-char {
                    color: #0055aa;
                }

                /* 마우스 오버 시 효과 */
                .mention:hover {
                    background-color: #d0e8ff;
                }
            `}</style>
        </div>
    );
};
