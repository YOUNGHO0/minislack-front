import {AlertDialog, Button, Flex} from "@radix-ui/themes";
import * as React from "react";

export default  ({alertState, closeWindow}: {alertState:boolean, closeWindow: ()=>void}) =>{

    return (        <AlertDialog.Root open={alertState} >
        <AlertDialog.Content maxWidth="450px">
            <AlertDialog.Title>관리자 변경 필요</AlertDialog.Title>
            <AlertDialog.Description size="2">
                <>방 관리자는 나갈 수 없습니다.</>
                <>다른 사람으로 관리자를 변경하세요</>
            </AlertDialog.Description>

            <Flex gap="3" mt="4" justify="end">
                <AlertDialog.Cancel>
                    <Button variant="solid" color="blue"
                            onClick={closeWindow}
                    >확인
                    </Button>
                </AlertDialog.Cancel>
            </Flex>
        </AlertDialog.Content>
    </AlertDialog.Root>)
}