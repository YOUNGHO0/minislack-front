'use client'
import {Button, Heading, Text, TextArea, TextField} from "@radix-ui/themes";
import QuestionScroll from "@/app/component/QuestionScroll";
import {useState} from "react";
import {Article} from "@/types/type";

export default () => {

    let [question, setQuestion] = useState<Article>();

    const onClick = (question: Article) => {
        setQuestion(question)
    }

    return <div className={"flex w-full h-full min-h-0"}>
        <div className={"flex-1 flex flex-col h-full min-h-0"}>
            {/* 질문 작성 영역 - 고정 크기 */}
            <div className={"flex-1 flex flex-col border-b h-full min-h-0"}>
                <Heading className={"p-5 min-h-0"}>질문하기</Heading>
                <div className={"p-5 flex flex-col space-y-5 min-h-0 h-full"}>
                    <TextField.Root size="3" placeholder="제목"/>
                    <TextArea
                        placeholder={"내용"}
                        size="3"
                        className={"h-full"}
                        rows={4}
                    />
                    <div className={"flex justify-end"}>
                        <Button>작성</Button>
                    </div>
                </div>
            </div>

            <div className={"flex-1 flex flex-col min-h-0"}>
                <div className={"flex-1 overflow-y-auto min-h-0"}>
                    <QuestionScroll onSelect={onClick}/>
                </div>

            </div>

        </div>
        <div className={"flex-1 flex flex-col w-full"}>
            <div className={"flex-1 flex flex-col p-5 w-full h-full space-y-8"}>
                <div><Heading>질문 내용</Heading></div>
                <div><Text size={"5"}> {question?.title}</Text></div>
                <div>{question?.text}</div>
            </div>
            <div className={"flex-3"}>
                <div className={"p-5"}>

                    {question?.answer.map((ans: Article) => (
                        <div key={ans?.id} className={"mt-5"}>
                            <div>{ans?.user?.nickName}</div>
                            <div key={ans.id}>{ans?.text}</div>
                        </div>

                    ))}
                </div>
            </div>

            <div className={"flex-1 p-5 flex flex-col space-y-5 min-h-0 h-full"}>
                <TextArea
                    placeholder={"답글 작성"}
                    size="3"
                    className={"h-full"}
                    rows={4}
                />
                <div className={"flex justify-end"}>
                    <Button>작성</Button>
                </div>
            </div>

        </div>
    </div>
}