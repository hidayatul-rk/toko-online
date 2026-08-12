"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";

type Props = {
    action: (
        prevState: { success: boolean; message: string } | null,
        formData: FormData,
    ) => Promise<{ success: boolean; message: string }>;
    placeholder?: string;
    buttonLabel?: string;
};

export function InlineForm({ action, placeholder = "...", buttonLabel = "Tambah" }: Props) {
    const [state, formAction, isPending] = useActionState(action, null);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (state?.success) {
            toast.success(state.message);
            formRef.current?.reset();
        } else if (state?.message) {
            toast.error(state.message);
        }
    }, [state]);

    return (
        <form ref={formRef} action={formAction} className="flex max-w-sm gap-2">
            <input
                type="text"
                name="name"
                placeholder={placeholder}
                required
                className="flex-1 rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/10"
            />
            <button
                type="submit"
                disabled={isPending}
                className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
            >
                {isPending ? "..." : buttonLabel}
            </button>
        </form>
    );
}
