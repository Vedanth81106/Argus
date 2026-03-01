"use client";
import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function HoverBorderGradient({
                                        children,
                                        containerClassName,
                                        className,
                                        as: Tag = "button",
                                        duration = 1,
                                        clockwise = true,
                                        ...props
                                    }) {
    const [hovered, setHovered] = useState(false);
    const [direction, setDirection] = useState("TOP");

    const rotateDirection = currentDirection => {
        const directions = ["TOP", "LEFT", "BOTTOM", "RIGHT"];
        const currentIndex = directions.indexOf(currentDirection);
        const nextIndex = clockwise
            ? (currentIndex - 1 + directions.length) % directions.length
            : (currentIndex + 1) % directions.length;
        return directions[nextIndex];
    };

    const movingMap = {
        TOP: "radial-gradient(20.7% 50% at 50% 0%, var(--color-primary) 0%, var(--color-primary) 40%, transparent 100%)",
        LEFT: "radial-gradient(16.6% 43.1% at 0% 50%, var(--color-secondary) 0%, var(--color-secondary) 40%, transparent 100%)",
        BOTTOM: "radial-gradient(20.7% 50% at 50% 100%, var(--color-ternary) 0%, var(--color-ternary) 40%, transparent 100%)",
        RIGHT: "radial-gradient(16.2% 41.2% at 100% 50%, var(--color-primary) 0%, var(--color-primary) 40%, transparent 100%)",
    };

    const highlight =
        "radial-gradient(75% 181% at 50% 50%, var(--color-secondary) 0%, transparent 100%)";

    useEffect(() => {
        if (!hovered) {
            const interval = setInterval(() => {
                setDirection((prevState) => rotateDirection(prevState));
            }, duration * 1000);
            return () => clearInterval(interval);
        }
    }, [hovered]);

    return (
        <Tag
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={cn(
                "relative flex rounded-none border content-center bg-black/20 hover:bg-black/10 transition duration-500 items-center flex-col flex-nowrap gap-10 h-min justify-center overflow-visible p-px decoration-clone w-fit -skew-x-12",
                containerClassName
            )}
            {...props}
        >
            <div className={cn("w-auto z-10 bg-[var(--color-background)] px-6 py-2 rounded-none skew-x-12", className)}>
                {children}
            </div>
            <motion.div
                className={cn("flex-none inset-0 overflow-hidden absolute z-0 rounded-none")}
                style={{
                    filter: "blur(8px)",
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                }}
                initial={{ background: movingMap[direction] }}
                animate={{
                    background: hovered
                        ? [movingMap[direction], highlight]
                        : movingMap[direction],
                }}
                transition={{ ease: "linear", duration: duration ?? 1 }}
            />
            <div className="bg-[var(--color-background)] absolute z-1 flex-none inset-[2px] rounded-none" />
        </Tag>
    );
}