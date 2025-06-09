export interface UserSpaceInEvent {
    type:"spaceIn"
    spaceId:number
}

export interface ChannelCreateEvent {
    type:"channelCreate"
    message:{
        name : string
        userList : number[]
    }
}