import {Message} from "@/types/type";
import {UserCircleIcon} from "@heroicons/react/24/outline";
import {Avatar, Separator} from "@radix-ui/themes";
export default (props :{data : Message})=>{


    return <div className={"m-4 p-2 flex w-[fit-content] max-w-full rounded-lg border-black"}>
        <div className={" w-fit p-1 flex flex-col"}>
            <Avatar variant={"solid"} fallback={props.data.user.username[0]}></Avatar>
        </div>
        <div className={" ml-4 flex-col p-0"}>
            <div className={"flex"}>{props.data.user.username}</div>
            <div>
                <div>{props.data.text}</div>
            </div>
        </div>

        {/*<Separator orientation="horizontal" size="4" />*/}

    </div>
}