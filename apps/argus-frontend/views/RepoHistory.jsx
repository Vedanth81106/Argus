"use client"

import React, { useEffect, useState } from "react";
import ReviewModalComponent from "@/components/ReviewModalComponent";

export default function RepoHistory({ repoId }) {
    const [commits, setCommits] = useState([]);
    const [selectedSha, setSelectedSha] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false); // Track if stream is active

    const handleOpenReview = async (sha) => {

        try {
            await fetch(`/api/repos/${repoId}/audit/${sha}`, { method: "POST" });
        } catch (e) {
            console.error("Audit trigger failed", e);
        }

        // 2. Open the modal to show the progress/results
        setSelectedSha(sha);
        setIsModalOpen(true);
    };

    const fetchCommitsStream = async () => {
        setIsStreaming(true);
        try {
            const response = await fetch(`/api/repos/${repoId}/commits/stream`);
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");

                // Keep the last partial line in the buffer
                buffer = lines.pop() || "";

                for (const line of lines) {
                    if (line.trim()) {
                        try {
                            const newCommit = JSON.parse(line);

                            setCommits((prev) => {
                                // Only add if the sha isnt already in our list
                                const exists = prev.some(c => c.sha === newCommit.sha);
                                if (exists) return prev;
                                return [...prev, newCommit];
                            });

                        } catch (e) {
                            console.error("JSON Parse Error:", e);
                        }
                    }
                }
            }
        } catch (e) {
            console.error("Stream failed", e);
        } finally {
            setIsStreaming(false);
        }
    };

    useEffect(() => {
        if (repoId) {
            setCommits([]);
            fetchCommitsStream();
        }
    }, [repoId]);

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-foreground">Commit History</h1>
                {isStreaming && (
                    <span className="text-xs text-primary animate-pulse uppercase tracking-widest">
                        Streaming Live Data...
                    </span>
                )}
            </div>

            <div className="space-y-4">
                {commits.map((commit) => (
                    <div key={commit.sha} className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg flex justify-between items-center hover:border-primary/30 transition-all">
                        <div className="flex flex-col">
                            <span className="font-mono text-xs text-primary">{commit.sha?.substring(0, 7)}</span>
                            <span className="text-sm font-medium">{commit.message}</span>
                            {/* FIX: commit.date (lowercase) to match your Java DTO */}
                            <span className="text-[10px] text-zinc-500 uppercase">
                                {commit.author} • {commit.date ? new Date(commit.date).toLocaleDateString() : "Unknown Date"}
                            </span>
                        </div>

                        <button
                            onClick={() => handleOpenReview(commit.sha)}
                            className="px-4 py-2 cursor-pointer bg-white text-black text-xs font-bold rounded uppercase hover:bg-primary transition-colors"
                        >
                            Audit
                        </button>
                    </div>
                ))}

                {/* Empty State */}
                {!isStreaming && commits.length === 0 && (
                    <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-xl">
                        <p className="text-zinc-500">No commits found for this contributor.</p>
                    </div>
                )}
            </div>

            {/* Modal Logic Remains Same */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-zinc-950 border border-zinc-800 w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-xl relative p-4">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white">✕</button>
                        <ReviewModalComponent commitSha={selectedSha} repoId={repoId} />
                    </div>
                </div>
            )}
        </div>
    );
}