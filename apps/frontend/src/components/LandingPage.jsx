import React from 'react';
const LandingPage = ({ onStart }) => {

    const features = [
        'Logic Analysis',
        'Security Triage',
        'Performance Metrics',
        'System Health',
        'Code Review'
    ];

    return (
        <div className="font-atkins relative min-h-screen bg-[#020617] overflow-hidden flex flex-col items-center justify-center font-sans">

            {/* glow effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border-radius: 9999px bg-blue-500/15 blur-[120px] rounded-full pointer-events-none" />

            {/* main content */}
            <div className="relative z-10 text-center px-4">
                <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-tight bg-gradient-to-b from-white via-blue-200 to-blue-500 bg-clip-text text-transparent mb-6">
                    Argus
                </h1>

                <p className="max-w-xl mx-auto text-gray-400 text-lg md:text-xl leading-relaxed mb-10">
                    Let Argus configure, review, and secure your code commits
                    in real-time—so you can focus on building what matters.
                </p>

                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={onStart}
                        className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-white/25
                            hover:text-white transition-colors duration-700 ease-in-out active:scale-95 cursor-pointer"
                    >
                        Get started
                    </button>
                </div>
            </div>

        </div>
    );
};

export default LandingPage;