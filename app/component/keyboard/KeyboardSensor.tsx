'use client'
import { useEffect, useRef, useState } from "react";

export default function KeyboardSensor({
                                           children,
                                       }: {
    children: React.ReactNode;
}) {
    const initialHeight = useRef<number | null>(null);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const paddingRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (typeof window === 'undefined' || !window.visualViewport) return;

        const vv = window.visualViewport;
        initialHeight.current = vv.height;

        const handleResize = () => {
            if (initialHeight.current === null) return;

            const delta = initialHeight.current - vv.height;
            const isKeyboardOpen = delta > 100;
            const newHeight = isKeyboardOpen ? delta : 0;
            setKeyboardHeight(newHeight);

            if (isKeyboardOpen && paddingRef.current) {
                // padding이 보이게 스크롤하면 자연히 입력창이 위로 올라온다
                setTimeout(() => {
                    paddingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
                }, 50);
            }
        };

        vv.addEventListener("resize", handleResize);
        return () => vv.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (paddingRef.current) {
            paddingRef.current.style.height = `${keyboardHeight}px`;
        }
    }, [keyboardHeight]);

    return (
        <>
            {children}
            <div
                ref={paddingRef}
                className="w-full pointer-events-none transition-all duration-300"
            />
        </>
    );
}
