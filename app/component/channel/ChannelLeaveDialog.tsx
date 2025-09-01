import * as React from "react";
import {AlertDialog, Button, Flex} from "@radix-ui/themes";
import {useParams, useRouter} from "next/navigation";

export default ({alertState, closeWindow, leave}: {
    alertState: boolean,
    closeWindow: () => void,
    leave: () => void
}) => {
    const router = useRouter();
    const params = useParams();
    return (
        <AlertDialog.Root open={alertState}>
            <AlertDialog.Content maxWidth="450px">
                <AlertDialog.Title>Revoke access</AlertDialog.Title>
                <AlertDialog.Description size="2">
                    채널을 나가시겠습니까?
                </AlertDialog.Description>

                <Flex gap="3" mt="4" justify="end">
                    <AlertDialog.Cancel>
                        <Button variant="soft" color="gray"
                                onClick={closeWindow}>
                            취소
                        </Button>
                    </AlertDialog.Cancel>
                    <AlertDialog.Action>
                        <Button variant="solid" color="red"
                                onClick={() => {
                                    closeWindow();
                                    leave();
                                }}>
                            채널 나가기
                        </Button>
                    </AlertDialog.Action>
                </Flex>
            </AlertDialog.Content>
        </AlertDialog.Root>
    );
};
