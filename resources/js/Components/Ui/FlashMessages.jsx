import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function FlashMessages() {
    const { flash } = usePage().props;
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        setDismissed(false);
    }, [flash?.success, flash?.error]);

    if (dismissed || (!flash?.success && !flash?.error)) {
        return null;
    }

    const isSuccess = Boolean(flash.success);

    return (
        <div
            className={`flex items-start justify-between gap-4 rounded-lg border px-4 py-3 text-sm ${
                isSuccess
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-rose-200 bg-rose-50 text-rose-800'
            }`}
            role="status"
        >
            <span>{flash.success ?? flash.error}</span>
            <button
                type="button"
                onClick={() => setDismissed(true)}
                className="shrink-0 text-lg leading-none opacity-60 transition hover:opacity-100"
                aria-label="Dismiss notification"
            >
                &times;
            </button>
        </div>
    );
}
