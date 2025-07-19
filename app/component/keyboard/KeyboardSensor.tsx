'use client'
import { useEffect, useRef, useState } from "react";

export default function KeyboardSensor({
                                           children,
                                       }: {
    children: React.ReactNode;
}) {
    const initialHeight = useRef<number | null>(null);
    const [opened, setOpened] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined' || !window.visualViewport) return;

        const vv = window.visualViewport;

        initialHeight.current = vv.height;

        const handleResize = () => {
            if (initialHeight.current !== null && window.visualViewport) {
                const isKeyboardOpen = window.visualViewport.height < initialHeight.current - 100;
                setOpened(isKeyboardOpen);
                console.log("Keyboard opened:", isKeyboardOpen);
            }
        };

        vv.addEventListener("resize", handleResize);

        return () => {
            vv.removeEventListener("resize", handleResize);
        };
    }, []);

    return <>{children}</>;
}
