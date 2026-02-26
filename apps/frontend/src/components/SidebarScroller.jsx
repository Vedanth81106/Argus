import React, { useEffect, useState } from "react";

export default function SidebarScroller({ items = [] }) {
    const [index, setIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(true);

    // We need at least 3 items to show 3. If you have fewer, we duplicate.
    const baseItems = items.length > 0 ? items : ["No Data"];
    // Create a loop: [Item A, Item B, Item C, Item A, Item B, Item C]
    const displayItems = [...baseItems, ...baseItems];

    useEffect(() => {
        const interval = setInterval(() => {
            setIsTransitioning(true);
            setIndex((prev) => prev + 1);
        }, 2500); // Stay still for 2.5s

        return () => clearInterval(interval);
    }, [baseItems.length]);

    useEffect(() => {
        // When we reach the end of the first set, snap back to the start
        if (index === baseItems.length) {
            const timer = setTimeout(() => {
                setIsTransitioning(false); // Disable animation for the snap
                setIndex(0);
            }, 700); // Matches the duration-700 below
            return () => clearTimeout(timer);
        }
    }, [index, baseItems.length]);

    return (
        /* Height is 28px * 3 = 84px. font-sans uses Inter */
        <div className="relative h-[84px] overflow-hidden font-sans bg-black/20 rounded-lg border border-white/5">
            {/* Visual Highlight Overlay (The "Window") */}
            <div className="absolute inset-0 pointer-events-none">
                {/* The blue arrow pointing to the middle slot */}
                <div className="absolute left-2 top-[28px] h-[28px] flex items-center text-blue-500 text-[10px] animate-pulse">
                    ▶
                </div>
                {/* Gradient Fades */}
                <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-60" />
            </div>

            <div
                className={`flex flex-col ${isTransitioning ? "transition-transform duration-700 ease-in-out" : ""}`}
                style={{ transform: `translateY(-${index * 28}px)` }}
            >
                {displayItems.map((item, i) => {
                    // The "Highlighted" one is always the one that lands in the middle (slot 1)
                    // Since our index starts at 0, the item at [index + 1] is in the middle.
                    const isHighlighted = (i === index + 1) || (index === baseItems.length && i === 1);

                    return (
                        <div
                            key={i}
                            className={`h-[28px] flex items-center pl-8 text-[10px] tracking-[0.25em] uppercase transition-all duration-500
              ${isHighlighted ? "text-blue-400 font-bold scale-105" : "text-gray-600 opacity-30"}`}
                        >
                            {item}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}