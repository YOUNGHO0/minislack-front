'use client'
import {Button, Dialog, Flex, Text, TextField} from "@radix-ui/themes";
import {useParams, useRouter} from "next/navigation";
import axios from "axios";
import {useWebSocket} from "@/WebSocket/WebSocketProvider";
import {ChannelJoinSend} from "@/types/events";

export default ({close, getMessage}: {getMessage:()=>void,close :()=> void }) => {

    const router = useRouter();
    const closeWindow = ()=>{close(); router.back();}
    const {channel,space} = useParams();
    const {sendMessage} = useWebSocket()
    console.log("channel " + channel, "space :" + space);

    const joinChannel = ()=>{
        const joinSendMessage: ChannelJoinSend = {
            message: { id: Number(channel) },
            type: "channelJoin"
        };

        sendMessage(JSON.stringify(joinSendMessage));

        setTimeout(() => {
            getMessage();
            close();
        }, 700);
    }

    return (
        <Dialog.Root open={true}>
            <Dialog.Content maxWidth="450px">
                <Dialog.Title>채널 참여</Dialog.Title>
                <Dialog.Description size="2" mb="4">
                    채널에 참여하시겠습니까?
                </Dialog.Description>

                <Flex direction="column" gap="3">

                </Flex>
                <Flex gap="3" mt="4" justify="end">
                    <Dialog.Close>
                        <Button onClick={closeWindow} variant="soft" color="gray">
                            취소
                        </Button>
                    </Dialog.Close>
                    <Dialog.Close>
                        <Button onClick={()=>{joinChannel()}}>입장</Button>
                    </Dialog.Close>
                </Flex>
            </Dialog.Content>
        </Dialog.Root>
    );

}

