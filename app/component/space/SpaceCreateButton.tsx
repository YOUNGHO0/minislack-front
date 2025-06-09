import * as React from "react";
import {Dialog} from "radix-ui";
import {Cross2Icon} from "@radix-ui/react-icons";
import axios from "axios";
import {PlusCircleIcon} from "@heroicons/react/24/outline";
import {Text} from "@radix-ui/themes";

const SpaceCreateButton = ({fetchChannel}: { fetchChannel: () => void }) => {
    const [channelName, setChannelName] = React.useState(""); // 채널 이름 상태 추가
    const [hasError, setHasError] = React.useState(false);
    const [error, setError] = React.useState("");
    const [isOpen, setIsOpen] = React.useState(false); // 다이얼로그 열림 상태 추가
    const [isLoading, setIsLoading] = React.useState(false); // 로딩 상태 추가

    function addRoom() {
        if (!channelName.trim()) {
            setHasError(true);
            setError("채널 이름을 입력해주세요.");
            return;
        }

        setIsLoading(true);
        setHasError(false);
        setError("");

        axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/space`,
            {name: channelName}, // 사용자 입력값 사용
            {
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        ).then((response) => {
            if (response.status === 200) {
                fetchChannel();
                setIsOpen(false); // 성공시 다이얼로그 닫기
                setChannelName(""); // 입력값 초기화
            } else {
                setHasError(true);
                setError("채널 생성에 실패했습니다.");
            }
        }).catch((error) => {
            setHasError(true);
            setError("채널 생성 중 오류가 발생했습니다.");
        }).finally(() => {
            setIsLoading(false);
        });
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setChannelName(e.target.value);
        if (hasError && e.target.value.trim()) {
            setHasError(false);
            setError("");
        }
    };

    return (<Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
            <Dialog.Trigger asChild>
                <PlusCircleIcon className={"w-10"}></PlusCircleIcon>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-gray-300/60 data-[state=open]:animate-overlayShow"/>
                <Dialog.Content
                    className="fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-md bg-gray1 p-[25px] shadow-[var(--shadow-6)] focus:outline-none data-[state=open]:animate-contentShow">
                    <Dialog.Title className="m-0 text-[17px] font-medium text-mauve12">
                        Create Room
                    </Dialog.Title>
                    <Dialog.Description className="mb-5 mt-2.5 text-[15px] leading-normal text-mauve11">
                        Add Channel Name
                    </Dialog.Description>
                    <fieldset className="mb-[15px] flex items-center gap-5">
                        <input
                            className={`inline-flex h-[35px] w-full flex-1 items-center justify-center rounded px-2.5 text-[15px] leading-none text-violet11 shadow-[0_0_0_1px] outline-none focus:shadow-[0_0_0_2px] ${
                                hasError
                                    ? 'shadow-red-500 focus:shadow-red-500'
                                    : 'shadow-violet7 focus:shadow-violet8'
                            }`}
                            id="name"
                            placeholder="Channel Name"
                            value={channelName}
                            onChange={handleInputChange}
                            disabled={isLoading}
                        />
                    </fieldset>
                    {error && <Text className={"text-red-500 text-sm block -mt-3 mb-2"}>{error}</Text>}
                    <div className="mt-[25px] flex justify-end">
                        <button
                            onClick={addRoom}
                            disabled={isLoading}
                            className="inline-flex h-[35px] items-center justify-center rounded bg-green4 px-[15px] font-medium leading-none text-green11 outline-none outline-offset-1 hover:bg-green5 focus-visible:outline-2 focus-visible:outline-green6 select-none disabled:opacity-50 disabled:cursor-not-allowed">
                            {isLoading ? "Creating..." : "Create Channel"}
                        </button>
                    </div>
                    <Dialog.Close asChild>
                        <button
                            className="absolute right-2.5 top-2.5 inline-flex size-[25px] appearance-none items-center justify-center rounded-full text-violet11 bg-gray3 hover:bg-violet4 focus:shadow-[0_0_0_2px] focus:shadow-violet7 focus:outline-none"
                            aria-label="Close"
                            disabled={isLoading}
                        >
                            <Cross2Icon/>
                        </button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
};

export default SpaceCreateButton;