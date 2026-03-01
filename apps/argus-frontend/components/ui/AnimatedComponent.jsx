"use client";

export default function AnimatedComponent({ children, className = "", rounded = "rounded-3xl", isActive = false }){
    return (
        <div className={`aura-wrapper ${rounded} ${className} group isolate`}>
            {/* The Glow: Shows on hover OR if isActive is true */}
            <div className={`aura-glow transition-opacity duration-700 
                ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            />

            {/* content goes here */}
            <div className={`aura-content ${rounded}`}>
                {children}
            </div>
        </div>
    );
};