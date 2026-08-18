"use client";

import { useState, useActionState, useEffect } from "react";
import { toast } from "sonner";

type Props = {
    id: string;
    label?: string;
    action: (
        prevState: { success: boolean; message: string } | null,
        formData: FormData,
    ) => Promise<{ success: boolean; message: string }>;
};

export function DeleteButton({ id, label = "Hapus", action }: Props) {
    const [showConfirm, setShowConfirm] = useState(false);
    const [state, formAction, isPending] = useActionState(action, null);

    useEffect(() => {
        if (state?.success) {
            toast.success(state.message);
        } else if (state?.message) {
            toast.error(state.message);
        }
    }, [state]);

    const shouldShowConfirm = showConfirm && !state?.success;

    if (shouldShowConfirm) {
        return (
            <span className="inline-flex items-center gap-2">
                <span className="text-xs text-black/60 dark:text-white/60">Yakin?</span>
                <form action={formAction}>
                    <input type="hidden" name="id" value={id} />
                    <button
                        type="submit"
                        disabled={isPending}
                        className="text-red-600 underline disabled:opacity-50"
                    >
                        {isPending ? "..." : "Ya"}
                    </button>
                </form>
                <button
                    type="button"
                    onClick={() => setShowConfirm(false)}
                    className="underline"
                >
                    Batal
                </button>
            </span>
        );
    }

    return (
        <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="text-red-600 underline"
        >
            {label}
        </button>
    );
}
