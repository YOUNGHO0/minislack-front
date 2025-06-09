'use client'
import UserAuthenticate from "@/app/component/space/UserAuthenticate";


export default function RootLayout({ children, params }: Readonly<{ children: React.ReactNode; params: { space: string }}>) {

    return (
        <>
            {UserAuthenticate()}
            {children}
        </>
    );
}
