"use client";

import { useState, useEffect } from "react";

export function ScrollToTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        function onScroll() {
            setVisible(window.scrollY > 400);
        }
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className={`fixed bottom-6 right-6 z-50 rounded-full border border-black/10 bg-white p-3 shadow-sm transition-all dark:border-white/10 dark:bg-black ${visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
                }`}
            aria-label="Scroll ke atas"
        >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
        </button>
    );
}
