import React, { useState } from 'react';

const RepoModal = ({ onClose, onAdd }) => {
    const [step, setStep] = useState(1); // 1: Username, 2: Repo
    const [formData, setFormData] = useState({ username: '', repoName: '' });

    function handleNext () {
        if (step === 1 && formData.username) setStep(2);
        if (step === 2 && formData.repoName) {
            onAdd({ name: `${formData.username}/${formData.repoName}` });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-[#0a0f1e] border border-white/10 rounded-3xl p-8 shadow-2xl">

                {/* step indicator*/}
                <div className="flex gap-2 mb-8">
                    <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-blue-500' : 'bg-white/10'}`} />
                    <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-blue-500' : 'bg-white/10'}`} />
                </div>

                <h2 className="text-2xl font-bold mb-2">
                    {step === 1 ? "Target Username" : "Select Repository"}
                </h2>
                <p className="text-gray-500 text-sm mb-8">
                    {step === 1 ? "Enter the GitHub handle to scan." : `Searching ${formData.username}'s stack...`}
                </p>

                {/* Dynamic Input */}
                <div className="relative mb-10">
                    <input
                        autoFocus
                        className="w-full bg-transparent border-b border-white/20 pb-2 text-xl outline-none focus:border-blue-500 transition-colors"
                        placeholder={step === 1 ? "e.g. octocat" : "e.g. Hello-World"}
                        value={step === 1 ? formData.username : formData.repoName}
                        onChange={(e) => setFormData({
                            ...formData,
                            [step === 1 ? 'username' : 'repoName']: e.target.value
                        })}
                    />
                    {/* Results List could be mapped here */}
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center">
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleNext}
                        className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-blue-500 hover:text-white transition-all active:scale-95"
                    >
                        {step === 1 ? "Next Step" : "Initialize Monitor"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RepoModal;