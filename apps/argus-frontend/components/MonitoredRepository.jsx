"use client";
import React from "react";

// Added setRepos so we can remove the card from the UI instantly
export default function MonitoredRepository({ repos, setRepos }) {

    const handleRepoDelete = async (repo) => {
        const payload = {
            owner: repo.owner,
            repoName: repo.repositoryName
        };

        try {
            const response = await fetch("/api/repos/delete", {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                console.log("Resource successfully deleted!");
                setRepos(repos.filter(r => r.id !== repo.id));
            } else {
                console.error("Server error while deleting repo");
            }
        } catch (e) {
            console.error("Failed to delete repo: " + e);
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {repos.map((repo) => (
                <div key={repo.id} className="p-6 bg-white/5 border border-blue-500 rounded-2xl flex justify-between items-center group">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase tracking-widest">{repo.owner}</span>
                        <span className="font-bold text-white">{repo.repositoryName}</span>
                    </div>

                    <button
                        className="w-10 h-10 bg-red-700/20 text-red-500 font-bold cursor-pointer
                                   hover:bg-red-700 hover:text-white rounded-lg transition-all flex items-center justify-center text-2xl"
                        onClick={() => handleRepoDelete(repo)}
                    >
                        −
                    </button>
                </div>
            ))}
        </div>
    );
}