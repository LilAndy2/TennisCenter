import { useEffect, useRef, useState } from "react";

type AnimatedCounterProps = {
    value: number;
    duration?: number;
    prefix?: string;
    suffix?: string;
    className?: string;
};

function AnimatedCounter({
                             value,
                             duration = 800,
                             prefix = "",
                             suffix = "",
                             className,
                         }: AnimatedCounterProps) {
    const [display, setDisplay] = useState(0);
    const rafRef = useRef<number | undefined>(undefined);
    const startRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        startRef.current = undefined;

        const step = (timestamp: number) => {
            if (!startRef.current) startRef.current = timestamp;
            const elapsed = timestamp - startRef.current;
            const progress = Math.min(elapsed / duration, 1);

            // Ease-out cubic for a natural deceleration
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(eased * value));

            if (progress < 1) {
                rafRef.current = requestAnimationFrame(step);
            }
        };

        rafRef.current = requestAnimationFrame(step);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [value, duration]);

    return (
        <span className={className}>
            {prefix}{display.toLocaleString()}{suffix}
        </span>
    );
}

export default AnimatedCounter;