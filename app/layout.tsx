import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import {Theme} from "@radix-ui/themes";
import HomeAppBar from "@/app/component/layout/HomeAppBar";
import KeyboardSensor from "@/app/component/keyboard/KeyboardSensor";
import React from "react";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Elive chat",
    description: "쉽고 빠른 채팅",
    icons:"/icon.ico"
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body
            className={`${geistSans.variable} ${geistMono.variable}`}
        >
        <Theme>
            <div className={"flex flex-col min-h-0 overflow-y-hidden"}
                 style={{
                     height: `100dvh`,
                     maxHeight:`100dvh`,
                 }}
            >
                <HomeAppBar></HomeAppBar>
                {children}
            </div>
        </Theme>
        </body>
        </html>
    );
}
