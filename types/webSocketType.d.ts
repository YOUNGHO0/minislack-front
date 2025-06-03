import {ReceivedMessage, SendChannelMessage, SendChatMessage} from "@/types/type";

export interface JsonReceivedChannelInfo {
    type : string;
    message : ReceivedMessage;
}

export interface JsonReceivedMessageInfo {
    channelId: number;
    type : string;
    message: ReceivedMessage;

}
export interface JsonSendChannelInfo{
    type: string;
    message: SendChannelMessage;
}

export interface JsonSendMessageInfo {
    type : string;
    message: SendChatMessage
}