export interface Message {
    id: number;
    text: string;
    user: User;
    time: string; // ISO 8601 형식 문자열
    comment: Message[];
}

export interface User{
    id: number;
    profile:number;
    username: string;
    email: string;
}
