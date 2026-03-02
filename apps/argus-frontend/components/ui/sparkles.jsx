"use client";

import React, { useEffect, useId, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { motion, useAnimation } from "motion/react";
import { cn } from "@/lib/utils";

const resolveColor = (value) => {
    if (!value) return value;

    // if already hex/rgb
    if (value.startsWith("#") || value.startsWith("rgb")) return value;

    const cssVar = value.startsWith("var(")
        ? value.slice(4, -1).trim()
        : `--${value}`;

    return getComputedStyle(document.documentElement)
        .getPropertyValue(cssVar)
        .trim();
};

export const SparklesCore = ({
                                 id,
                                 className,
                                 background = "transparent",
                                 minSize = 0.4,
                                 maxSize = 1.2,
                                 speed = 0.5,
                                 particleColor = "#ffffff",
                                 particleDensity = 80,
                             }) => {
    const [ready, setReady] = useState(false);
    const generatedId = useId();
    const controls = useAnimation();

    // load particle engine once
    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => setReady(true));
    }, []);

    // fade in when loaded
    const particlesLoaded = async (container) => {
        if (container) {
            controls.start({
                opacity: 1,
                transition: { duration: 1 },
            });
        }
    };

    return (
        <motion.div animate={controls} className={cn("opacity-0", className)}>
            {ready && (
                <Particles
                    id={id || generatedId}
                    particlesLoaded={particlesLoaded}
                    className="h-full w-full"
                    options={{
                        background: { color: { value: resolveColor(background) } },

                        fullScreen: { enable: false },

                        fpsLimit: 60,

                        interactivity: {
                            events: {
                                onHover: {
                                    enable: true,
                                    mode: [/*"attract",*/ "grab"],
                                },

                            },
                            modes: {
                                grab: {
                                    distance: 150,       // Lines only appear within 150px
                                    links: {
                                        opacity: 0.3,    // Faint lines feel "slower" to the eye
                                    },
                                },
                                /*attract: {
                                    distance: 200,
                                    speed: 1,
                                    factor: 0.1,
                                    easing: "ease-out-quad",
                                },*/


                            }
                        },

                        particles: {
                            number: {
                                value: particleDensity,
                                density: { enable: true },
                                limit: 125,
                            },

                            color: { value: resolveColor(particleColor) },

                            size: {
                                value: { min: minSize, max: maxSize },
                            },

                            move: {
                                enable: true,
                                speed: { min: 0.3, max: 1 },
                                direction: "none",
                                outModes: { default: "out" },
                            },

                            opacity: {
                                value: { min: 0.1, max: 1 },
                                animation: {
                                    enable: true,
                                    speed: speed,
                                    startValue: "random",
                                    sync: false,
                                },
                            },
                        },

                        detectRetina: true,
                    }}
                />
            )}
        </motion.div>
    );
};