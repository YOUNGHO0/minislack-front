import * as React from "react";
import {Dialog} from "radix-ui";
import {Cross2Icon} from "@radix-ui/react-icons";
import {useWebSocket} from "@/WebSocket/WebSocketProvider";
import {ChannelUpdateSendEvent} from "@/types/events";

const ChannelUpdateDialog = ({channelId, channelName, closeWindow}: {
    channelId: number,
    channelName: string,
    closeWindow: () => void
}) => {


    const {sendMessage} = useWebSocket();
    const [isPrivate, setIsPrivate] = React.useState(false);
    const [isExternalBlocked, setIsExternalBlocked] = React.useState(false);
    const sendUpdateMessage = () => {
        const newName = inputRef.current?.value.trim();
        if (newName) {
            let channelUpdateSendEvent: ChannelUpdateSendEvent = {
                message: {
                    id: channelId,
                    channelName: newName,
                    privateChannel: isPrivate,
                    externalBlocked: isExternalBlocked
                }, type: "channelUpdate"
            }
            sendMessage(JSON.stringify(channelUpdateSendEvent))
            console.log(channelUpdateSendEvent)
        }
        closeWindow();
    }

    const inputRef = React.useRef<HTMLInputElement>(null);


    return <Dialog.Root open={true}>
        <Dialog.Trigger asChild>
        </Dialog.Trigger>
        <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-neutral-200/80 data-[state=open]:animate-overlayShow"/>
            <Dialog.Content
                className="fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-md bg-gray1 p-[25px] shadow-[var(--shadow-6)] focus:outline-none data-[state=open]:animate-contentShow">
                <Dialog.Title className="m-0 text-[17px] font-medium text-mauve12">
                    채널 이름 변경
                </Dialog.Title>
                <fieldset className="mt-2 mb-[15px] flex flex-col gap-2">
                    <label htmlFor="name" className="text-[15px] text-violet11">
                        Name
                    </label>
                    <input
                        ref={inputRef}
                        className="inline-flex h-[35px] w-full items-center justify-center rounded px-2.5 text-[15px] leading-none text-violet11 shadow-[0_0_0_1px] shadow-violet7 outline-none focus:shadow-[0_0_0_2px] focus:shadow-violet8"
                        id="name"
                        defaultValue={channelName}
                    />
                </fieldset>

                {/* 채널 옵션 */}
                <fieldset className="mb-[15px] flex flex-col gap-2">
                    <label className="text-[15px] text-violet11">Channel Options</label>

                    {/* 외부 참여 불가 */}
                    <label className="inline-flex items-center gap-2 text-[14px] text-mauve12">
                        <input
                            type="checkbox"
                            checked={isExternalBlocked}
                            onChange={() => setIsExternalBlocked(!isExternalBlocked)}
                            className="w-4 h-4 accent-violet9"
                            disabled={isPrivate} // 비공개일 경우 비활성화
                        />
                        외부 참여 불가
                        {isPrivate && (
                            <span className="text-[12px] text-mauve10">(비공개 채널에서는 자동 적용됨)</span>
                        )}
                    </label>

                    {/* 비공개 채널 */}
                    <label className="inline-flex items-center gap-2 text-[14px] text-mauve12">
                        <input
                            type="checkbox"
                            checked={isPrivate}
                            onChange={() => {
                                setIsPrivate(!isPrivate);
                                if (!isPrivate) {
                                    setIsExternalBlocked(true); // 비공개 선택 시 외부참여 자동 비활성화
                                }
                            }}
                            className="w-4 h-4 accent-violet9"
                        />
                        비공개 채널
                    </label>
                </fieldset>


                <div className="mt-[25px] flex justify-end">
                    <Dialog.Close asChild>
                        <button
                            onClick={sendUpdateMessage}
                            className="inline-flex h-[35px] items-center justify-center rounded bg-green4 px-[15px] font-medium leading-none text-green11 outline-none outline-offset-1 hover:bg-green5 focus-visible:outline-2 focus-visible:outline-green6 select-none">
                            Save changes
                        </button>
                    </Dialog.Close>
                </div>
                <Dialog.Close asChild>
                    <button onClick={() => {
                        closeWindow()
                    }}
                            className="absolute right-2.5 top-2.5 inline-flex size-[25px] appearance-none items-center justify-center rounded-full text-violet11 bg-gray3 hover:bg-violet4 focus:shadow-[0_0_0_2px] focus:shadow-violet7 focus:outline-none"
                            aria-label="Close"
                    >
                        <Cross2Icon/>
                    </button>
                </Dialog.Close>
            </Dialog.Content>
        </Dialog.Portal>
    </Dialog.Root>
};

export default ChannelUpdateDialog;
