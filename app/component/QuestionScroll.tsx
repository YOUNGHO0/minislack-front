import * as React from "react";
import {Heading} from "@radix-ui/themes";
import {Article} from "@/types/type";

export default ({onSelect}: { onSelect: (question: Article) => void }) => {


    return (
        <div className=" p-5 ">
            <Heading>질문 내역</Heading>
            {/*{sampleArticles.map((question) => (*/}
            {/*    <div*/}
            {/*        className="mt-2.5 border-t border-t-mauve6 pt-2.5 text-[13px] leading-[18px] text-mauve12"*/}
            {/*        key={question.id}*/}
            {/*        onClick={()=>{onSelect(question)}}>*/}
            {/*        {question.title}*/}
            {/*    </div>*/}
            {/*))}*/}
        </div>
    );
};
