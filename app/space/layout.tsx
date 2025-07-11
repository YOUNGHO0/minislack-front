'use client'
import UserAuthenticate from "@/app/component/space/UserAuthenticate";


export default function RootLayout({ children}: Readonly<{ children: React.ReactNode }>) {

    return (
        <>
            {UserAuthenticate()}
            {children}
        </>
    );
}
