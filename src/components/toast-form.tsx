"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

type Props = {
    action: (
        prevState: { success: boolean; message: string } | null,
        formData: FormData,
    ) => Promise<{ success: boolean; message: string }>;
    children: React.ReactNode;
    className?: string;
};

export function ToastForm({ action, children, className }: Props) {
    const [state, formAction] = useActionState(action, null);

    useEffect(() => {
        if (state?.success) {
            toast.success(state.message);
        } else if (state?.message) {
            toast.error(state.message);
        }
    }, [state]);

    return (
        <form action={formAction} className={className}>
            {children}
        </form>
    );
}
