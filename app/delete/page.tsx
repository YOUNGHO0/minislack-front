"use client";

import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteAccountPage() {
    const [inputValue, setInputValue] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const router = useRouter();

    const handleUserDelete = async () => {
        if (inputValue !== "동의합니다") {
            setErrorMessage("올바른 문구를 입력해주세요.");
            return;
        }

        try {
            await axios.delete(
                `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user`,
                { withCredentials: true }
            );
            window.location.href = "/";
        } catch (error) {
            setErrorMessage("계정 삭제 중 문제가 발생했습니다. 관리자에게 문의하세요.");
        }
    };

    return (
        <div className="flex w-full h-full bg-gray-50 px-4 pt-10 sm:px-6 lg:px-[30%]">
            <div className="h-full bg-white shadow-lg rounded-2xl p-8">
                {/* 제목 */}
                <h1 className="text-2xl font-bold text-red-600 mb-4">계정 삭제</h1>

                {/* 안내 문구 */}
                <p className="text-gray-700 mb-6 leading-relaxed">
                    계정이 <span className="font-semibold">영구적으로 삭제</span>됩니다. <br />
                    삭제 이후에는 해당 계정으로 더 이상 서비스를 이용할 수 없으며, 복구가 불가능합니다. <br />
                    계속 진행하시려면 아래 입력창에 <span className="font-semibold">"동의합니다"</span>를 입력해주세요.
                </p>

                {/* 입력창 */}
                <div className="mb-2">
                    <input
                        type="text"
                        placeholder="동의합니다"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                </div>

                {/* 에러 메시지 */}
                {errorMessage && (
                    <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
                )}

                {/* 버튼 영역 */}
                <div className="flex justify-between pb-4">
                    <button
                        className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
                        onClick={() => router.push("/")}
                    >
                        취소
                    </button>
                    <button
                        onClick={handleUserDelete}
                        className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                    >
                        계정 삭제하기
                    </button>
                </div>
            </div>
        </div>
    );
}
