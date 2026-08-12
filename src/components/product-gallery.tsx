"use client";

import { useState } from "react";
import Image from "next/image";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
    const [selected, setSelected] = useState(0);

    return (
        <div className="flex flex-col gap-2">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-black/5 dark:bg-white/10">
                {images[selected] ? (
                    <Image
                        src={images[selected]}
                        alt={`${name} - Gambar ${selected + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-black/20 dark:text-white/20">
                        <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                    </div>
                )}
            </div>
            {images.length > 1 && (
                <div className="flex gap-2">
                    {images.map((img, i) => (
                        <button
                            key={img}
                            type="button"
                            onClick={() => setSelected(i)}
                            className={`relative h-16 w-16 overflow-hidden rounded-md border-2 ${i === selected
                                    ? "border-black dark:border-white"
                                    : "border-transparent"
                                }`}
                        >
                            <Image
                                src={img}
                                alt={`${name} thumbnail ${i + 1}`}
                                fill
                                className="object-cover"
                                sizes="64px"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
