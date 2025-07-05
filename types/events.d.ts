import {User} from "@/types/type";

export interface UserSpaceInEvent {
    type:"spaceIn"
    spaceId:number
}

export interface ChannelCreateSendEvent {
    type:"channelCreate"
    message:{
        name : string
        userList : number[]
        privateChannel: boolean
        externalBlocked: boolean
    }
}

export interface ChannelUpdateSendEvent {
    type:"channelUpdate"
    message:{
        id:number
        channelName:string
        privateChannel: boolean
        externalBlocked: boolean
    }
}

export interface ChannelDeleteSendEvent {
    type:"channelDelete"
    message:{
        id:number
}
}

export interface ChannelCreateReceiveEvent{
    type:"channelCreate"
    id :number
    channelName : string

}

export interface ChannelUpdateReceiveEvent{
    type : "channelUpdate"
    id :number
    channelName : string
    privateChannel: boolean
}

export interface ChannelDeleteReceiveEvent {
    type : "channelDelete"
    id :number
}

export interface ChatCreateSendEvent {
    type:"chatCreate"
    message:{
        channelId : number
        parent : number
        text : string
    }
}

export interface ChannelJoinSend{

    type:"channelJoin"
    message:{
        id : number
    }
}


export interface ChatCreateReceiveEvent {
    type:"chatCreate"
    chatMessage: string
    id : number
    createdDate: string
    channelId : number
    user:User
}

