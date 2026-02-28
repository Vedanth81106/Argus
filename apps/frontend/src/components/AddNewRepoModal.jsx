import React, {useCallback, useEffect, useState} from 'react';
import useSearch from '../hooks/useSearch.jsx';

const AddNewRepoModal = ({ onClose, onAdd }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ username: '', repoName: '', avatar: '' });
    const [displayResults, setDisplayResults] = useState([]);

    const currentQuery = step === 1 ? formData.username : formData.repoName;
    const { results, isLoading } = useSearch(currentQuery, step === 1 ? 'users' : 'repos',formData.username);

    useEffect(() => {
        setDisplayResults(results);
    }, [results]);

    const handleUserSelect = (user) => {
        setDisplayResults([]);
        setFormData({ ...formData, username: user.username, avatar: user.avatarUrl });
        setStep(2);
    };

    const handleEscKeyPress = useCallback((event) => {
        if(event.key === 'Escape'){
            onClose();
        }
    },[onClose]);

    useEffect(() => {
        document.addEventListener('keydown', handleEscKeyPress);

        return () => {
            document.removeEventListener('keydown', handleEscKeyPress);
        };
    }, [handleEscKeyPress]);

    const handleRepoSelect = async (name) => {
        const payload = {
            owner: formData.username,
            repoName: name
        };

        try {
            const response = await fetch("http://localhost:8080/api/repos/add", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const savedRepoFromDb = await response.json();
                onAdd(savedRepoFromDb);
                onClose();
            } else {
                console.error("Server error while adding repo");
            }
        } catch (error) {
            console.error("Failed to add repo: " + error);
        }
    };

    const handleUrlPaste = (e) => {
        const url = e.target.value;
        const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);

        if (match) {
            const owner = match[1];
            const repo = match[2].replace('.git', '');

            onAdd({ name: `${owner}/${repo}`, avatar: `https://github.com/${owner}.png` });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-[#0a0f1e] border border-white/10 rounded-3xl p-8 shadow-2xl">
                <div className="flex gap-2 mb-8">
                    <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-blue-500' : 'bg-white/10'}`} />
                    <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-blue-500' : 'bg-white/10'}`} />
                </div>

                <h2 className="text-2xl font-bold mb-2">
                    {step === 1 ? "Target Username" : "Select Repository"}
                </h2>
                <p className="text-gray-500 text-sm mb-8 font-atkins">
                    {step === 1 ? "Enter the GitHub handle to scan." : `Searching ${formData.username}'s stack...`}
                </p>

                <div className="relative mb-6">
                    <input
                        autoFocus
                        className="w-full bg-transparent border-b border-white/20 pb-2 text-xl outline-none focus:border-blue-500 transition-colors text-white font-atkins"
                        placeholder={step === 1 ? "e.g. octocat" : "e.g. Hello-World"}
                        value={currentQuery}
                        onChange={(e) => setFormData({
                            ...formData,
                            [step === 1 ? 'username' : 'repoName']: e.target.value
                        })}
                    />
                </div>

                <div className="max-h-48 overflow-y-auto mb-8 space-y-2 custom-scrollbar">
                    {isLoading && <div className="text-blue-400 text-sm animate-pulse p-2">Scanning GitHub...</div>}

                    {step === 1 && displayResults.map((user) => (
                        <div
                            key={user.username}
                            onClick={() => handleUserSelect(user)}
                            className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl cursor-pointer transition-colors group"
                        >
                            <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full border border-white/10" />
                            <span className="group-hover:text-blue-400 transition-colors">{user.username}</span>
                        </div>
                    ))}

                    {step === 2 && displayResults
                        .filter(repo => !formData.repoName || repo.toLowerCase().includes(formData.repoName.toLowerCase()))
                        .map((repo) => (
                            <div
                                key={repo}
                                onClick={() => {handleRepoSelect(repo), onClose()}}
                                className="p-3 hover:bg-white/5 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-white/10 flex justify-between items-center group"
                            >
                                <span className="group-hover:text-blue-400">{repo}</span>
                            </div>
                        ))}
                </div>
                <div className="mt-8 pt-6 border-t border-white/5">
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-3 font-bold">
                        Quick Actions
                    </p>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Or paste GitHub URL here..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-blue-500/50 transition-all font-atkins"
                            onChange={handleUrlPaste}
                        />
                        <div className="absolute right-3 top-3 opacity-20 pointer-events-none">
                            🔗
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-10">
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        Cancel
                    </button>
                    {step === 2 && (
                        <button onClick={() => setStep(1)} className="text-sm text-blue-400 hover:underline">
                            Back to user
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddNewRepoModal;