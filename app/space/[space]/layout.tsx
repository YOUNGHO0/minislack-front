import NavBar from "@/app/component/NavBar";
import {WebSocketProvider} from "@/WebSocket/WebSocketProvider";
import {useParams} from "next/navigation";


export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (

      <div className={"flex lg:flex-row flex-col flex-1"}>
          <WebSocketProvider>
              <div className="flex-1 overflow-auto">
                  {children}
              </div>
              <NavBar/>
          </WebSocketProvider>
      </div>

  );
}
