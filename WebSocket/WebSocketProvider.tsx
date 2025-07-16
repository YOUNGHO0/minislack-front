// WebSocketContext.tsx
'use client'

import {createContext, useContext, useEffect, useRef} from 'react'
import emitter from '../WebSocket/Emitter'
import {useParams} from "next/navigation";
// WebSocket 타입 정의
type WebSocketContextType = {
    sendMessage: (msg: string) => void
}

// 기본값 (초기값에서 함수를 넣어야 타입 오류 방지)
const WebSocketContext = createContext<WebSocketContextType>({
    sendMessage: () => console.warn("WebSocket not initialized"),
})

// Provider 정의
export const  WebSocketProvider =({ children }: { children: React.ReactNode }) => {
    const socketRef = useRef<WebSocket | null>(null)
    const {space} = useParams();
    useEffect(() => {
        const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}?space=${space}`);
        socketRef.current = ws

        ws.onopen = () => {
            console.log('[WebSocket] Connected')
        }

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type) {
                    console.log("type :" + data.type + " data : " + JSON.stringify(data));
                    // type이 Events 타입에 포함되어 있으면 emit 가능
                    emitter.emit(data.type, data);
                    console.log('[WebSocket] Received message ', data.payload);

                }
            } catch (err) {
                console.error('JSON 파싱 에러', err);
            }
        };

        ws.onclose = () => {
            console.log('[WebSocket] Closed')
        }

        ws.onerror = (err) => {
            console.error('[WebSocket] Error:', err)
        }

        return () => {
            ws.close()
        }
    }, [])

    const sendMessage = (msg: string) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(msg)
        } else {
            console.warn('WebSocket is not open')
        }
    }

    return (
        <WebSocketContext.Provider value={{ sendMessage }}>
            {children}
        </WebSocketContext.Provider>
    )
}

// custom hook
export const useWebSocket = ()=> useContext(WebSocketContext)