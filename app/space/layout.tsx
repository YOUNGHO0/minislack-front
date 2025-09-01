'use client'
import UserAuthenticate from "@/app/component/space/UserAuthenticate";


export default function RootLayout({children}: Readonly<{ children: React.ReactNode }>) {
    UserAuthenticate()
    return (
        <div className="flex-1 flex flex-col">
            {children}
        </div>
    );
}
