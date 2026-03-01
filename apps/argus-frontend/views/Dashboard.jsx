"use client"

import React, {useEffect, useState} from 'react';
import AddNewRepoModal from '../components/AddNewRepoModal.jsx';
import MonitoredRepository from "../components/MonitoredRepository.jsx";

const Dashboard = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [repos, setRepos] = useState([]); // Array of connected repos

    useEffect(() => {
        const fetchSavedRepos = async () => {
            try {
                const response = await fetch("api/repos");
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
        <div className="relative min-h-screen bg-[#020617] text-white p-8 font-atkins">
            {/* top left plus */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="fixed top-8 left-8 w-15 h-15 rounded-xl bg-blue-300 text-black font-bold hover:bg-[#020617] hover:text-white ease-in-out cursor-pointer
                flex items-center justify-center text-2xl transition-all active:scale-95 duration-700 hover:scale-150"
            >
                +
            </button>

            {/* center stage */}
            <main className="max-w-6xl mx-auto mt-20 h-[60vh] flex items-center justify-center">
                {repos.length === 0 ? (
                    <div className="w-full h-full border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-gray-500">
                        <div className="text-4xl mb-4 opacity-20"></div>
                        <p className="tracking-widest uppercase text-[11px] font-bold">No Repositories Observed</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="mt-6 text-blue-400 hover:text-blue-300 text-sm transition-colors"
                        >
                            + Initialize First Monitor
                        </button>
                    </div>
                ) : (
                    <MonitoredRepository repos ={repos} setRepos={setRepos} />
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

export default Dashboard;