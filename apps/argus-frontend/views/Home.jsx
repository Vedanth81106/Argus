"use client";

import React from "react";
import { SparklesCore } from "@/components/ui/sparkles";
import Navbar from "@/components/ui/Navbar";
import {HoverBorderGradient} from "@/components/ui/hover-border-gradient";

const Home = () => {
    return (
        <div className="relative min-h-screen overflow-hidden flex items-center justify-center">

            <Navbar />
            <SparklesCore
                id="sparkles"
                className="absolute inset-0"
                background="background"
                minSize={1.0}
                maxSize={4.0}
                particleDensity={90}
                particleColor="ternary"
                speed={0.4}
            />

            <div className="text-center space-y-5 max-w-2xl z-10 relative text-foreground">
                <div className={"space-y-3 tracking-tighter bg-linear-to-r from-secondary from-0% via-primary via-80% to-ternary to-100% bg-clip-text text-transparent"}>
                    {/* Main Title */}
                    <h1 className="pb-2 text-7xl font-cinzel font-bold tracking-tight ">
                        Argus
                    </h1>

                    {/* Sub Headline */}
                    <h3 className="text-6xl font-semibold pb-4">
                        Intelligent Repository Oversight
                    </h3>
                </div>

                <p className={"text-lg text-pretty"}>Automated code reviews and <span className={"bg-clip-text text-transparent bg-linear-to-r from-primary via-rose-500 to-ternary"}>security-monitoring</span> powered by AI. Get instant feedback on every commit
                    and keep your <span className={"bg-clip-text text-transparent bg-linear-to-r from-ternary via-rose-500 to-primary"}>repositories</span> clean, secure, and optimized.</p>

                <div className="flex justify-center mt-12">
                    <HoverBorderGradient className="text-foreground font-bold tracking-widest text-sm">
                        Get Started
                    </HoverBorderGradient>
                </div>

            </div>

        </div>
    );
};

export default Home;