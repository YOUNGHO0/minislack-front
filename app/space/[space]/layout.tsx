import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import NavBar from "@/app/component/NavBar";
import {WebSocketProvider} from "@/WebSocket/WebSocketProvider";
import {use} from "react";


export default function RootLayout({ children, params }: Readonly<{ children: React.ReactNode; params: { space: string }}>) {
    const { space } = params;
    const spaceNumber = Number(space)
    console.log(space)
  return (

      <div className={"flex lg:flex-row flex-col w-full h-full"}>
          <WebSocketProvider space={spaceNumber}>
              <div className="flex-1 overflow-auto">
                  {children}
              </div>
              <NavBar/>
          </WebSocketProvider>
      </div>

  );
}
