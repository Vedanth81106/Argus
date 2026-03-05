"use client";
import React from "react";
import {HoverBorderGradient} from "@/components/ui/HoverBorderGradient";
import{ useRouter } from "next/navigation";

export default function MonitoredRepositoryComponent({repos, setRepos}) {

    const router = useRouter();

    const handleRepoDelete = async (repo) => {
        const payload = {
            owner: repo.owner, repoName: repo.repositoryName
        };

        try {
            const response = await fetch("/api/repos/delete", {
                method: "DELETE", headers: {"Content-Type": "application/json"}, body: JSON.stringify(payload)
            });

            if (response.ok) {
                setRepos(repos.filter(r => r.id !== repo.id));
            }
        } catch (e) {
            console.error("Failed to delete repo:", e);
        }
    };

    return (<div className="min-h-screen w-full flex items-center justify-center p-6 bg-background">
        <div className="flex flex-col gap-6 w-full max-w-4xl">

            {repos.map((repo) => (
                <div key={repo.id}
                     onClick={() => {router.push(`/dashboard/${repo.id}/history`)}}
                     className="-skew-x-12 will-change-transform cursor-pointer">
                    <HoverBorderGradient
                        containerClassName="w-full rounded-none"
                        className="rounded-none bg-black/40 backdrop-blur-xl h-24 flex items-center "
                    >
                        <div className="skew-x-12 flex justify-between items-center w-full px-8">

                            {/* Left: Identity */}
                            <div className="flex items-center gap-6">
                                {/* Status Dot */}
                                <div
                                    className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_var(--color-primary)]"/>

                                <div className="flex flex-col gap-1 text-left">
                                    <span className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-bold">
                                      {repo.owner}
                                    </span>
                                    <span className="text-xl font-semibold text-white tracking-tight">
                                      {repo.repositoryName}
                                    </span>
                                </div>
                            </div>

                            {/* Center: "Stuff" (Metadata) */}
                            <div className="hidden md:flex items-center gap-12 text-gray-500">
                                <div className="flex flex-col items-start">
                                    <span className="text-[9px] uppercase tracking-widest text-gray-600">Health</span>
                                    <span className="text-sm font-medium text-gray-300">98%</span>
                                </div>
                                <div className="flex flex-col items-start">
                                    <span
                                        className="text-[9px] uppercase tracking-widest text-gray-600">Vulnerabilities</span>
                                    <span className="text-sm font-medium text-ternary">0</span>
                                </div>
                                <div className="flex flex-col items-start">
                                    <span
                                        className="text-[9px] uppercase tracking-widest text-gray-600">Last Audit</span>
                                    <span className="text-sm font-medium text-gray-300">2m ago</span>
                                </div>
                            </div>

                            {/* Right: Actions */}
                            <button
                                className="w-9 h-9 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center text-2xl relative z-50 cursor-pointer shadow-lg hover:shadow-red-500/40"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRepoDelete(repo);
                                }}
                            >
                                −
                            </button>
                        </div>
                    </HoverBorderGradient>
                </div>
            ))}

        </div>
    </div>);
}