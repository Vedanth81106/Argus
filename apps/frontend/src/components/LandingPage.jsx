import React from 'react';

const LandingPage = ({ onStart }) => {
    return (
        <div className="relative min-h-screen bg-[#020617] overflow-hidden flex flex-col items-center justify-center font-sans">

            {/* glow effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border-radius: 9999px bg-blue-500/15 blur-[120px] rounded-full pointer-events-none" />

            {/* sidebar */}
            <div className="absolute left-25 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-6 border-l border-white/5 pl-6">
                {['Logic Analysis', 'Security Triage', 'Performance Metrics', 'System Health', 'Code Review'].map((item, i) => (
                    <div key={item} className="group cursor-pointer">
            <span className={`text-sm tracking-widest uppercase ${i === 1 ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300 transition-colors'}`}>
              {i === 1 && <span className="mr-2">▶</span>}
                {item}
            </span>
                    </div>
                ))}
            </div>

            {/* 3. MAIN CONTENT */}
            <div className="relative z-10 text-center px-4">
                <h1 className="text-6xl md:text-8xl font-bold tracking-tighter bg-gradient-to-b from-white via-white to-gray-500 bg-clip-text text-transparent mb-6">
                    Argus
                </h1>

                <p className="max-w-xl mx-auto text-gray-400 text-lg md:text-xl leading-relaxed mb-10">
                    Let Argus configure, review, and secure your code commits
                    in real-time—so you can focus on building what matters.
                </p>

                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={onStart}
                        className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-all active:scale-95"
                    >
                        Get started
                    </button>
                    <button className="px-8 py-3 bg-white/5 border border-white/10 text-white font-medium rounded-full hover:bg-white/10 transition-all">
                        How it works
                    </button>
                </div>
            </div>

            {/* 4. FOOTER LOGO (Minimalist '9' style) */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 opacity-50">
                <div className="w-10 h-10 border-2 border-white flex items-center justify-center font-black text-xl">
                    A
                </div>
            </div>
        </div>
    );
};

export default LandingPage;