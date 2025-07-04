export interface ReceivedMessage {
    id: number;
    text: string;
    user: User|null;
    createdDate: string |null; // ISO 8601 형식 문자열
    comment: ReceivedMessage[]|null;
}

export interface SendChatMessage {
    channelId: number;
    parent:number|null
    id: number;
    text: string;
}

export interface SendChannelMessage {
    parent:number|null
    id: number;
    text: string;
}

export interface User{
    id: number;
    profile:number;
    nickName: string;
}

export interface Article {
    id: number;
    title:string;
    user: User;
    text: string;
    answer:Article[]
}

export interface ChannelInfo{
    id:number
    name:string
    mine : boolean
}


