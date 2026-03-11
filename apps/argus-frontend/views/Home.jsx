"use client";

import React from "react";
import { SparklesCore } from "@/components/ui/sparkles";

const Home = ({onStart}) => {
    return (
        <div className="relative min-h-screen overflow-hidden flex items-center justify-center">

            <SparklesCore
                id="sparkles"
                className="absolute inset-0"
                background="background"
                minSize={1.0}
                maxSize={4.0}
                particleDensity={125}
                particleColor="ternary"
                speed={0.4}
            />

            <div className="text-center space-y-5 max-w-2xl z-10 relative text-foreground">
                <div className={"space-y-3 tracking-tighter bg-clip-text text-transparent"}>
                    {/* Main Title */}
                    <h1 className="pb-2 text-7xl font-cinzel font-bold tracking-tight
                    bg-clip-text text-transparent bg-linear-to-r from-secondary from-0% via-primary via-50% to-ternary to-95% ">
                        Argus
                    </h1>

                    {/* Sub Headline */}
                    <h3 className="text-6xl font-semibold pb-4 bg-clip-text text-transparent
                    bg-linear-to-r from-secondary from-0% via-primary via-65% to-ternary to-90% ">
                        Intelligent Repository Oversight
                    </h3>
                </div>

                <p className={"text-lg text-pretty pb-10"}>Automated code reviews and <span className={"bg-clip-text text-transparent bg-linear-to-r from-primary to-ternary"}>security-monitoring</span> powered by AI. Get instant feedback on every commit
                    and keep your <span className={"bg-clip-text text-transparent bg-linear-to-r from-ternary to-primary"}>repositories</span> clean, secure, and optimized.</p>

                <button
                    onClick={onStart}
                    className="group relative -skew-x-12 border order-linear-to-r from-secondary via-primary to-ternary  bg-black px-8 py-3 transition-all hover:bg-white hover:text-black active:scale-95">
                    <span className="cursor-pointer inline-block skew-x-12 text-sm font-bold uppercase tracking-widest text-white group-hover:text-black">
                        Get Started
                    </span>
                </button>

            </div>

        </div>
    );
};

export default Home;