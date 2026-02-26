import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';

function App() {
    // Use a boolean or a string to track the current "page"
    const [view, setView] = useState('landing');

    return (
        <div className="min-h-screen bg-[#020617] font-sans selection:bg-blue-500/30 animate-in fade-in zoom-in-95 duration-700">
            {view === 'landing' ? (
                <LandingPage onStart={() => setView('dashboard')} />
            ) : (
                <Dashboard onBack={() => setView('landing')} />
            )}
        </div>
    );
}

export default App;