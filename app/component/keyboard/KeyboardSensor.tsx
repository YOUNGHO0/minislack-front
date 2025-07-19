'use client'
import { useEffect, useRef, useState } from "react";

export default function KeyboardSensor({
                                           children,
                                       }: {
    children: React.ReactNode;
}) {
    const initialHeight = useRef<number | null>(null);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    useEffect(() => {
        if (typeof window === 'undefined' || !window.visualViewport) return;

        const vv = window.visualViewport;
        initialHeight.current = vv.height;

        const handleResize = () => {
            if (initialHeight.current !== null) {
                const delta = initialHeight.current - vv.height;
                const isKeyboardOpen = delta > 100;
                setKeyboardHeight(isKeyboardOpen ? delta : 0);
                console.log("Keyboard opened:", isKeyboardOpen, "Keyboard height:", isKeyboardOpen ? delta : 0);
            }
        };

        vv.addEventListener("resize", handleResize);
        return () => vv.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div
            className="transition-all duration-300 overflow-hidden"
            style={{ height: `calc(100vh - ${keyboardHeight}px)` }}
        >
            {children}
        </div>
    );
}
