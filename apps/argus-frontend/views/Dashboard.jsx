"use client"

import React, {useEffect, useState} from 'react';
import AddNewRepoModal from '../components/AddNewRepoModal.jsx';
import MonitoredRepositoryComponent from "../components/MonitoredRepositoryComponent.jsx";
import { SparklesCore } from "@/components/ui/sparkles";
import AddButton from "@/components/ui/AddButton";

export default function RepositoryDashboard() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [repos, setRepos] = useState([]);

    useEffect(() => {
        const fetchSavedRepos = async () => {
            try {
                const response = await fetch("/api/repos");
                if (response.ok) {
                    const data = await response.json();
                    setRepos(data);
                }
            } catch (error) {
                console.error("Failed to load monitors:", error);
            }
        };
        fetchSavedRepos();
    }, []);

    return (
        <div className="relative min-h-screen overflow-hidden bg-background text-foreground p-8 font-space">

            {/* Background Sparkles */}
            <div className="absolute inset-0 w-full h-full">
                <SparklesCore
                    id="dashboard-sparkles"
                    background="transparent"
                    minSize={1.0}
                    maxSize={3.0}
                    particleDensity={100}
                    className="w-full h-full"
                    particleColor="secondary"
                    speed={0.2}
                />
            </div>

            {/* Corrected Radial Gradient Syntax for Tailwind v4/v3 arbitrary values */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--background)_100%)] pointer-events-none" />

            <div className="relative z-20">
                <AddButton onClick={() => setIsModalOpen(true)} text={"Add Repository"} />
            </div>

            {/* Main Content Area: Use min-h-screen or a larger min-h to ensure centering in the viewport */}
            <main className="relative z-10 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[75vh]">
                {repos.length === 0 ? (
                    <div className="w-full max-w-3xl aspect-video rounded-3xl flex flex-col items-center justify-center">

                        {/* Empty State Visual */}
                        <div className="mb-8 relative">
                            <div className="relative w-16 h-16 border-2 border-dashed border-ternary/50 rounded-full flex items-center justify-center animate-[spin_10s_linear_infinite]">
                                <div className="w-2 h-2 bg-ternary rounded-full" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-8">
                            No Repositories Observed
                        </h2>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="duration-700 group relative -skew-x-12 border border-white/10 bg-black px-8 py-3 transition-all hover:bg-white hover:text-black active:scale-95"
                        >
                            <span className="cursor-pointer inline-block skew-x-12 text-sm font-bold uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-secondary via-primary to-ternary">
                                Initialize First Monitor
                            </span>
                        </button>
                    </div>
                ) : (
                    /* 🔥 Centering Fix: Ensure w-full and proper flex alignment */
                    <div className="w-full flex justify-center items-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        <MonitoredRepositoryComponent repos={repos} setRepos={setRepos}/>
                    </div>
                )}
            </main>

            {isModalOpen && (
                <AddNewRepoModal
                    onClose={() => setIsModalOpen(false)}
                    onAdd={(newRepo) => setRepos([...repos, newRepo])}
                />
            )}
        </div>
    );
};