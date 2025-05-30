import * as React from "react";
import {Heading} from "@radix-ui/themes";
import {Article} from "@/types/type";

export default ({onSelect}:{onSelect : (question:Article)=>void}) => {

// 샘플 데이터
// 샘플 데이터
    const sampleArticles: Article[] = [
        {
            id: 1,
            title: "React에서 상태 관리는 어떻게 하나요?",
            user: {
                id: 101,
                profile: 1,
                username: "김개발",
                email: "kim.dev@example.com"
            },
            text: "React에서 useState와 useContext를 사용한 상태 관리 방법이 궁금합니다. 특히 복잡한 상태를 관리할 때 어떤 패턴을 사용하는 것이 좋을까요?",
            answer: [
                {
                    id: 101,
                    title: "Re: React에서 상태 관리는 어떻게 하나요?",
                    user: {
                        id: 201,
                        profile: 2,
                        username: "박선배",
                        email: "park.senior@example.com"
                    },
                    text: "useState는 간단한 로컬 상태에, useContext는 전역 상태 공유에 적합합니다. 복잡한 상태라면 useReducer나 Redux Toolkit을 고려해보세요.",
                    answer: []
                },
                {
                    id: 102,
                    title: "Re: React에서 상태 관리는 어떻게 하나요?",
                    user: {
                        id: 202,
                        profile: 3,
                        username: "이전문",
                        email: "lee.expert@example.com"
                    },
                    text: "Zustand나 Jotai 같은 라이브러리도 좋은 선택입니다. 보일러플레이트가 적고 사용하기 쉬워요.",
                    answer: []
                }
            ]
        },
        {
            id: 2,
            title: "TypeScript 제네릭 사용법",
            user: {
                id: 102,
                profile: 2,
                username: "이타입",
                email: "lee.type@example.com"
            },
            text: "TypeScript에서 제네릭을 언제 사용하는지, 어떻게 효과적으로 활용할 수 있는지 알고 싶습니다.",
            answer: [
                {
                    id: 201,
                    title: "Re: TypeScript 제네릭 사용법",
                    user: {
                        id: 203,
                        profile: 4,
                        username: "최타입",
                        email: "choi.type@example.com"
                    },
                    text: "제네릭은 타입을 매개변수화할 때 사용합니다. 예를 들어 Array<T>, Promise<T> 같은 경우죠. 재사용 가능한 컴포넌트나 함수를 만들 때 매우 유용합니다.",
                    answer: []
                }
            ]
        },
        {
            id: 3,
            title: "Next.js 13 App Router 질문",
            user: {
                id: 103,
                profile: 3,
                username: "박넥스트",
                email: "park.next@example.com"
            },
            text: "Next.js 13의 새로운 App Router를 사용하고 있는데, 기존 Pages Router와의 차이점이 무엇인가요?",
            answer: [
                {
                    id: 301,
                    title: "Re: Next.js 13 App Router 질문",
                    user: {
                        id: 204,
                        profile: 5,
                        username: "정넥스트",
                        email: "jung.next@example.com"
                    },
                    text: "App Router는 React Server Components를 기본으로 사용하고, 레이아웃 시스템이 더 직관적입니다. 파일 기반 라우팅도 더 유연해졌어요.",
                    answer: []
                },
                {
                    id: 302,
                    title: "Re: Next.js 13 App Router 질문",
                    user: {
                        id: 205,
                        profile: 1,
                        username: "김라우터",
                        email: "kim.router@example.com"
                    },
                    text: "데이터 페칭 방식도 많이 바뀌었습니다. getServerSideProps 대신 async/await를 직접 컴포넌트에서 사용할 수 있어요.",
                    answer: []
                }
            ]
        },
        {
            id: 4,
            title: "CSS Grid vs Flexbox 선택 기준",
            user: {
                id: 104,
                profile: 4,
                username: "최스타일",
                email: "choi.style@example.com"
            },
            text: "레이아웃을 구성할 때 CSS Grid와 Flexbox 중 어떤 것을 선택해야 할지 고민됩니다.",
            answer: [
                {
                    id: 401,
                    title: "Re: CSS Grid vs Flexbox 선택 기준",
                    user: {
                        id: 206,
                        profile: 2,
                        username: "이레이아웃",
                        email: "lee.layout@example.com"
                    },
                    text: "1차원 레이아웃(가로 또는 세로)은 Flexbox, 2차원 레이아웃(가로와 세로 동시)은 Grid가 적합합니다. 컴포넌트 내부는 Flex, 전체 페이지 레이아웃은 Grid를 주로 사용해요.",
                    answer: []
                }
            ]
        },
        {
            id: 5,
            title: "JavaScript 비동기 처리 베스트 프랙티스",
            user: {
                id: 105,
                profile: 5,
                username: "정비동기",
                email: "jung.async@example.com"
            },
            text: "Promise, async/await, 그리고 콜백 함수의 차이점이 무엇인가요? 에러 핸들링은 어떻게 하는 것이 좋나요?",
            answer: [
                {
                    id: 501,
                    title: "Re: JavaScript 비동기 처리 베스트 프랙티스",
                    user: {
                        id: 207,
                        profile: 3,
                        username: "박비동기",
                        email: "park.async@example.com"
                    },
                    text: "콜백은 콜백 지옥 문제가 있고, Promise는 체이닝으로 해결했지만 async/await가 가장 직관적입니다. try-catch로 에러 핸들링을 하세요.",
                    answer: []
                },
                {
                    id: 502,
                    title: "Re: JavaScript 비동기 처리 베스트 프랙티스",
                    user: {
                        id: 208,
                        profile: 4,
                        username: "김에러",
                        email: "kim.error@example.com"
                    },
                    text: "Promise.all()로 병렬 처리하고, Promise.allSettled()로 일부 실패해도 계속 진행할 수 있습니다. 에러 경계(Error Boundary)도 고려해보세요.",
                    answer: []
                }
            ]
        }
    ];

    return (
        <div className=" p-5 ">
            <Heading>질문 내역</Heading>
            {sampleArticles.map((question) => (
                <div
                    className="mt-2.5 border-t border-t-mauve6 pt-2.5 text-[13px] leading-[18px] text-mauve12"
                    key={question.id}
                    onClick={()=>{onSelect(question)}}>
                    {question.title}
                </div>
            ))}
        </div>
    );
};
