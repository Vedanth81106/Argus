"use client";
import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function HoverBorderGradient({
                                        children,
                                        containerClassName,
                                        className,
                                        as: Tag = "div",
                                        duration = 1,
                                        clockwise = true,
                                        ...props
                                    }) {
    const [hovered, setHovered] = useState(false);
    const [direction, setDirection] = useState("TOP");

    const rotateDirection = (currentDirection) => {
        const directions = ["TOP", "LEFT", "BOTTOM", "RIGHT"];
        const currentIndex = directions.indexOf(currentDirection);
        const nextIndex = clockwise
            ? (currentIndex - 1 + directions.length) % directions.length
            : (currentIndex + 1) % directions.length;
        return directions[nextIndex];
    };

    const movingMap = {
        TOP: "radial-gradient(30% 50% at 50% 0%, var(--color-primary) 0%, var(--color-primary) 60%, transparent 100%)",
        LEFT: "radial-gradient(30% 50% at 0% 50%, var(--color-secondary) 0%, var(--color-secondary) 60%, transparent 100%)",
        BOTTOM: "radial-gradient(30% 50% at 50% 100%, var(--color-ternary) 0%, var(--color-ternary) 60%, transparent 100%)",
        RIGHT: "radial-gradient(30% 50% at 100% 50%, var(--color-primary) 0%, var(--color-primary) 60%, transparent 100%)",
    };

    const highlight =
        "radial-gradient(80% 200% at 50% 50%, var(--color-secondary) 0%, transparent 100%)";

    useEffect(() => {
        const interval = setInterval(() => {
            setDirection((prev) => rotateDirection(prev));
        }, duration * 1000);

        return () => clearInterval(interval);
    }, [duration]);

    return (
        <Tag
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={cn(
                "relative rounded-[inherit] p-px overflow-visible",
                containerClassName
            )}
            {...props}
        >
            {/* ===== STATIC WHITE BORDER ===== */}
            <div className="absolute inset-0 rounded-[inherit] bg-white/80 z-0" />

            {/* ===== ANIMATED BORDER ===== */}
            <motion.div
                className="absolute inset-0 rounded-[inherit] z-10 pointer-events-none"
                animate={{
                    background: hovered
                        ? [
                            movingMap.TOP,
                            movingMap.LEFT,
                            movingMap.BOTTOM,
                            movingMap.RIGHT,
                        ]
                        : "rgba(255,255,255,0.9)",
                }}
                transition={{
                    duration: duration * 4,
                    ease: "linear",
                    repeat: hovered ? Infinity : 0,
                }}
            />

            {/* ===== GLOW ===== */}
            <motion.div
                className="absolute inset-0 rounded-[inherit] z-0 pointer-events-none"
                style={{ filter: "blur(12px)" }}
                animate={{
                    opacity: hovered ? 0.9 : 0,
                    background: highlight,
                }}
                transition={{ duration: 0.35 }}
            />

            {/* ===== INNER MASK ===== */}
            <div className="absolute inset-[2px] rounded-[inherit] bg-background z-20" />

            {/* ===== CONTENT ===== */}
            <div className={cn("relative z-30 rounded-[inherit]", className)}>
                {children}
            </div>
        </Tag>
    );
}