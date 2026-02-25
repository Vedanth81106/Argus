import { useEffect, useState } from 'react'
import LandingPage from "./components/LandingPage.jsx";
import Dashboard from "./components/Dashboard.jsx";

export default function App() {
    const [isStarted, setIsStarted] = useState(false);

    return (
        <div className="overflow-hidden h-screen w-screen bg-[#020617]">
            <div
                className={`flex w-[200vw] h-full transition-transform duration-1000 ease-in-out ${
                    isStarted ? "-translate-x-100vw" : "translate-x-0"
                }`}
            >
                {/* landing page */}
                <div className="w-screen h-full">
                    <LandingPage onStart={() => setIsStarted(true)} />
                </div>

                {/* dashboard */}
                <div className="w-screen h-full overflow-y-auto">
                    <Dashboard />
                </div>
            </div>
        </div>
    );
}
