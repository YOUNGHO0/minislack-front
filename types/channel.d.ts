export interface Channel {
    id: number;
    name: string;
}
export interface Space {
    id: number;
    name: string;
    searchEnable : boolean;
    codeRequired : boolean;
    mine : boolean;
}