import * as React from "react";
import { Dialog } from "radix-ui";
import { Cross2Icon } from "@radix-ui/react-icons";
import {useWebSocket} from "@/WebSocket/WebSocketProvider";
import {ChannelDeleteSendEvent, ChannelUpdateSendEvent} from "@/types/events";

const ChannelUpdateDialog = ({channelId,channelName,closeWindow} : {channelId :number,channelName:string ,closeWindow:()=>void}) => {


    const {sendMessage} = useWebSocket();

    const sendUpdateMessage = ()=>{
        const newName = inputRef.current?.value.trim();
        if (newName && newName !== channelName) {
            let channelUpdateSendEvent :ChannelUpdateSendEvent = {message: {id: channelId , channelName:newName}, type: "channelUpdate"}
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
                <Dialog.Description className="mb-5 mt-2.5 text-[15px] leading-normal text-mauve11">
                    변경할 채널 이름을 입력하세요
                </Dialog.Description>
                <fieldset className="mb-[15px] flex items-center gap-5">
                    <label
                        className="w-[90px] text-right text-[15px] text-violet11"
                        htmlFor="name"
                    >
                        Name
                    </label>
                    <input
                        ref={inputRef}
                        className="inline-flex h-[35px] w-full flex-1 items-center justify-center rounded px-2.5 text-[15px] leading-none text-violet11 shadow-[0_0_0_1px] shadow-violet7 outline-none focus:shadow-[0_0_0_2px] focus:shadow-violet8"
                        id="name"
                        defaultValue={channelName}
                    />
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
