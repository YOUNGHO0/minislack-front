// emitter.ts
import mitt from 'mitt'
import {JsonReceivedChannelInfo, JsonReceivedMessageInfo} from "@/types/webSocketType";
import {
    ChannelCreateReceiveEvent,
    ChannelDeleteReceiveEvent,
    ChannelUpdateReceiveEvent,
    ChatCreateReceiveEvent,
    UserSpaceInEvent
} from "@/types/events";

const emitter = mitt<Events>()
export default emitter

// 이벤트 타입 맵 정의
type Events = {
    channel: JsonReceivedChannelInfo;
    channelMessage: JsonReceivedMessageInfo
    spaceIn: UserSpaceInEvent
    channelCreate : ChannelCreateReceiveEvent
    channelUpdate : ChannelUpdateReceiveEvent
    channelDelete : ChannelDeleteReceiveEvent
    chatCreate: ChatCreateReceiveEvent
    // 다른 이벤트도 추가 가능
};