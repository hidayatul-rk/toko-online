"use client";

import { useState } from "react";
import { updateSettings } from "@/lib/settings-actions";

type Tab = {
    id: string;
    label: string;
    content: React.ReactNode;
};

export function SettingsTabs({ tabs }: { tabs: Tab[] }) {
    const [active, setActive] = useState(tabs[0]?.id ?? "");

    return (
        <form action={updateSettings} className="flex max-w-lg flex-col gap-4">
            {/* Tab Header */}
            <div className="flex border-b border-black/10 dark:border-white/10">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActive(tab.id)}
                        className={`px-4 py-2.5 text-sm font-medium transition ${active === tab.id
                                ? "border-b-2 border-black text-black dark:border-white dark:text-white"
                                : "text-black/40 hover:text-black/60 dark:text-white/40 dark:hover:text-white/60"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
                {tabs.find((t) => t.id === active)?.content}
            </div>

            {/* Submit */}
            <button
                type="submit"
                className="rounded-md bg-black px-5 py-2 text-white dark:bg-white dark:text-black"
            >
                Simpan Pengaturan
            </button>
        </form>
    );
}
