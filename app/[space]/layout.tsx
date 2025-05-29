import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import NavBar from "@/app/component/NavBar";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

          <div className={"flex lg:flex-row flex-col h-64  w-full h-full"}>
              {children}
              <NavBar ></NavBar>
          </div>

  );
}
