import {Button, Dialog, Flex, Text, TextField, Theme} from "@radix-ui/themes";
import axios from "axios";
import {useRef, useState} from "react";

export default (props : {open : boolean, joinWithInviteCode : (inviteCode:string)=>Promise<void>, close: ()=>void })=>{

    const inputRef = useRef<HTMLInputElement>(null);
    const [errorMessage, setErrorMessage] = useState("");
    return (<Dialog.Root open={props.open}>
            <Theme>
            <Dialog.Content maxWidth="450px" className={"gap-3"}>
                <Dialog.Title>초대코드 입력</Dialog.Title>

                <Flex direction="column" gap="3">
                    <label className={"flex flex-col gap-1"}>
                        <Text as="div" size="2" mb="1" weight="bold">
                            초대코드
                        </Text>
                        <TextField.Root
                            placeholder="초대코드 입력"
                            ref={inputRef}
                        />

                        <Text size={"2"}  color={"red"}>{errorMessage}</Text>
                    </label>
                </Flex>


                <Flex gap="3" mt="4" justify="end">
                    <Dialog.Close>
                        <Button variant="soft" color="gray" onClick={()=>{props.close()}}>
                            취소
                        </Button>
                    </Dialog.Close>
                    <Dialog.Close>
                        <Button onClick={()=>{
                            const joinCode = inputRef.current?.value || "";
                            props.joinWithInviteCode(joinCode).catch(()=> setErrorMessage("올바른 초대코드를 입력하세요"))
                        }}>입장</Button>
                    </Dialog.Close>
                </Flex>
            </Dialog.Content>
            </Theme>
        </Dialog.Root>
    );
}