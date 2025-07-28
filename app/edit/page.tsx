import { Suspense } from "react";
import SpaceEditPageWrapper from "./SpaceEditPageWrapper";

export default function Page() {
    return (
        <Suspense fallback={<div className="p-6 text-center">로딩 중...</div>}>
            <SpaceEditPageWrapper />
        </Suspense>
    );
}