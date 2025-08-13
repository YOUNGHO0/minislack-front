// WebSocketContext.tsx
'use client'

import { createContext, useContext, useEffect, useRef } from 'react'
import emitter from '../WebSocket/Emitter'
import { useParams } from "next/navigation"
import ReconnectingWebSocket from 'reconnecting-websocket'

type WebSocketContextType = {
    sendMessage: (msg: string) => void
}

// 초기값에 함수 넣어 타입 오류 방지
const WebSocketContext = createContext<WebSocketContextType>({
    sendMessage: () => console.warn("WebSocket not initialized"),
})

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
    const wsRef = useRef<ReconnectingWebSocket | null>(null)
    const { space } = useParams()

    useEffect(() => {
        const url = `${process.env.NEXT_PUBLIC_WS_URL}?space=${space}`

        const rws = new ReconnectingWebSocket(url, [], {
            minReconnectionDelay: 1000,   // 재접속 시도 간격 (1초)
            maxReconnectionDelay: 10000,  // 최대 재접속 대기 시간 (10초)
            maxRetries: 10,               // 최대 재접속 시도 횟수
            debug: false,                 // 디버그 로그 출력 여부
        })

        wsRef.current = rws

        rws.addEventListener('open', () => {
            console.log('[WebSocket] Connected')
        })

        rws.addEventListener('message', (event) => {
            try {
                const data = JSON.parse(event.data)
                if (data.type) {
                    console.log("type :" + data.type + " data : " + JSON.stringify(data))
                    emitter.emit(data.type, data)
                    console.log('[WebSocket] Received message ', data.payload)
                }
            } catch (err) {
                console.error('JSON 파싱 에러', err)
            }
        })

        rws.addEventListener('close', () => {
            console.log('[WebSocket] Closed')
        })

        rws.addEventListener('error', (err) => {
            console.error('[WebSocket] Error:', err)
        })

        return () => {
            rws.close()
        }
    }, [space])

    const sendMessage = (msg: string) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(msg)
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

export const useWebSocket = () => useContext(WebSocketContext)
