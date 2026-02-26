import React, { useState } from 'react';
import RepoModal from './RepoModal';

const Dashboard = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [repos, setRepos] = useState([]); // Array of connected repos

    return (
        <div className="relative min-h-screen bg-[#020617] text-white p-8 font-atkins">
            {/* top left plus */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="fixed top-8 left-8 w-15 h-15 rounded-xl bg-blue-300 text-black font-bold hover:bg-[#020617] hover:text-white ease-in-out cursor-pointer
                flex items-center justify-center text-2xl transition-all active:scale-95 duration-700 hover:scale-150"
            >
                +
            </button>

            {/* center stagec */}
            <main className="max-w-6xl mx-auto mt-20 h-[60vh] flex items-center justify-center">
                {repos.length === 0 ? (
                    <div className="w-full h-full border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-gray-500">
                        <div className="text-4xl mb-4 opacity-20">👁️</div>
                        <p className="tracking-widest uppercase text-[11px] font-bold">No Repositories Observed</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="mt-6 text-blue-400 hover:text-blue-300 text-sm transition-colors"
                        >
                            + Initialize First Monitor
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                        {/* Map through repos here in Phase 2 */}
                        {repos.map((repo, idx) => (
                            <div key={idx} className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                                {repo.name}
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Modal Integration */}
            {isModalOpen && (
                <RepoModal
                    onClose={() => setIsModalOpen(false)}
                    onAdd={(newRepo) => setRepos([...repos, newRepo])}
                />
            )}
        </div>
    );
};

export default Dashboard;