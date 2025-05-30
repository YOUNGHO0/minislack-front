// WebSocketContext.tsx
'use client'

import { createContext, useContext, useEffect, useRef } from 'react'

// WebSocket 타입 정의
type WebSocketContextType = {
    sendMessage: (msg: string) => void
}

// 기본값 (초기값에서 함수를 넣어야 타입 오류 방지)
const WebSocketContext = createContext<WebSocketContextType>({
    sendMessage: () => console.warn("WebSocket not initialized"),
})

// Provider 정의
export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
    const socketRef = useRef<WebSocket | null>(null)

    useEffect(() => {
        const ws = new WebSocket('wss://your-websocket-server.com')
        socketRef.current = ws

        ws.onopen = () => {
            console.log('[WebSocket] Connected')
        }

        ws.onmessage = (event) => {
            console.log('[WebSocket] Received:', event.data)
        }

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
export const useWebSocket = () => {
    console.log("[useWebSocket] 훅 실행됨")
    return useContext(WebSocketContext)
}