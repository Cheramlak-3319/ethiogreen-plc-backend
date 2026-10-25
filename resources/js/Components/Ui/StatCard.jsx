export default function StatCard({ label, value, hint, icon, tone = 'emerald' }) {
    const tones = {
        emerald: 'bg-emerald-50 text-emerald-700',
        blue: 'bg-blue-50 text-blue-700',
        amber: 'bg-amber-50 text-amber-700',
        rose: 'bg-rose-50 text-rose-700',
        slate: 'bg-slate-100 text-slate-700',
    };

    return (
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">
                        {value}
                    </p>
                    {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
                </div>
                {icon && (
                    <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tones[tone] ?? tones.emerald}`}
                    >
                        {icon}
                    </span>
                )}
            </div>
        </div>
    );
}
