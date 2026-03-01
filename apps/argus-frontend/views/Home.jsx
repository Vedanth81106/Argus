"use client";

import React from 'react';
import AnimatedAura from '../components/ui/AnimatedComponent.jsx';

const Home = ({ onStart }) => {

    const features = [
        'Logic Analysis',
        'Security Triage',
        'Performance Metrics',
        'System Health',
        'Code Review'
    ];

    return (
        <div className="font-raleway relative min-h-screen bg-background overflow-hidden flex flex-col items-center justify-center">

            {/* glow effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-250 h-125 border-radius: 9999px bg-secondary/15 blur-[120px] rounded-full pointer-events-none" />

            {/* main content */}
            <div className="relative z-10 text-center px-4">
                <h1 className="font-cinzel text-6xl md:text-8xl font-bold  leading-tight bg-linear-to-b from-white to-primary bg-clip-text text-transparent mb-6">
                    Argus
                </h1>

                <p className="max-w-xl mx-auto text-gray-400 text-lg md:text-xl leading-relaxed mb-10">
                    Let Argus configure, review, and secure your code commits
                    in real-time—so you can focus on building what matters.
                </p>

                <AnimatedAura rounded="rounded-full" className="inline-block">
                    <button onClick={onStart}
                            className="px-8 py-3 cursor-pointer bg-background text-secondary hover:bg-transparent transition-colors text-lg">
                        Get Started
                    </button>
                </AnimatedAura>

                {/*
                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={onStart}
                        className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-white/25
                            hover:text-white transition-colors duration-700 ease-in-out active:scale-95 cursor-pointer"
                    >
                        Get started
                    </button>
                </div>
                */}
            </div>

        </div>
    );
};

export default Home;