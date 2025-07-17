"use client";

import * as React from "react";
import { Dialog } from "radix-ui";
import { Cross2Icon } from "@radix-ui/react-icons";
import {useEffect} from "react";
import axios from "axios";
import {useParams} from "next/navigation";

const InviteDialog = ({open, closeWindow} : {open:boolean, closeWindow : ()=>void}) => {
    const [inviteLink, setInviteLink] = React.useState("");
    const {space} = useParams();
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(inviteLink);
            alert("주소가 복사되었습니다!");
        } catch (err) {
            alert("복사에 실패했습니다.");
        }
    };

    useEffect(() => {
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/space/invite?id=${space}`, { withCredentials: true })
            .then((res) => {
                let defaultCode = `${process.env.NEXT_PUBLIC_WEB_URL}/invite/${space}`;
                if(res.data.inviteCode !== "" )
                defaultCode += "?code=" +  res.data.inviteCode;
                setInviteLink(defaultCode);
            });
    }, []);

    return (

        <Dialog.Root open={open}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-blackA6 data-[state=open]:animate-overlayShow" />
                <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-md bg-gray1 p-[25px] shadow-[var(--shadow-6)] focus:outline-none data-[state=open]:animate-contentShow">
                    <Dialog.Title className="m-0 text-[17px] font-medium text-mauve12">
                        주소 공유
                    </Dialog.Title>
                    <Dialog.Description className="mb-5 mt-2 text-[14px] text-gray-600">
                        다른 사람을 초대하려면 아래 링크를 복사하세요.
                    </Dialog.Description>

                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            readOnly
                            value={inviteLink}
                            className="flex-1 rounded px-3 py-2 text-sm text-gray-700 bg-gray-100 border border-gray-300"
                        />
                        <button
                            onClick={copyToClipboard}
                            className="rounded px-3 py-2 text-sm bg-violet5 text-violet12 hover:bg-violet6"
                        >
                            복사
                        </button>
                    </div>

                    <div className="mt-[25px] flex justify-end">
                            <button
                                onClick={closeWindow}
                                className="inline-flex h-[35px] items-center justify-center rounded bg-green4 px-[15px] font-medium leading-none text-green11 outline-none outline-offset-1 hover:bg-green5 focus-visible:outline-2 focus-visible:outline-green6 select-none">
                                확인
                            </button>
                    </div>
                        <button
                            className="absolute right-2.5 top-2.5 inline-flex size-[25px] appearance-none items-center justify-center rounded-full text-violet11 bg-gray3 hover:bg-violet4 focus:shadow-[0_0_0_2px] focus:shadow-violet7 focus:outline-none"
                            aria-label="Close"
                            onClick={closeWindow}
                        >
                            <Cross2Icon />
                        </button>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default InviteDialog;
