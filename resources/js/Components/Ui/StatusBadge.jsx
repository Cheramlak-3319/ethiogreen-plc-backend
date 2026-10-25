import { titleCase } from '@/lib/format';

const tones = {
    pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    processing: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    cancelled: 'bg-gray-100 text-gray-600 ring-gray-500/20',
    unpaid: 'bg-rose-50 text-rose-700 ring-rose-600/20',
    paid: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    failed: 'bg-rose-50 text-rose-700 ring-rose-600/20',
    refunded: 'bg-slate-100 text-slate-600 ring-slate-500/20',
    draft: 'bg-gray-100 text-gray-600 ring-gray-500/20',
    ordered: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
    received: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    purchase: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
    sale: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    adjustment: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    return: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    rejected: 'bg-rose-50 text-rose-700 ring-rose-600/20',
    confirmed: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    placed: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
};

export default function StatusBadge({ status, label, className = '' }) {
    const tone = tones[status] ?? 'bg-gray-100 text-gray-600 ring-gray-500/20';

    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${tone} ${className}`}
        >
            {label ?? titleCase(status)}
        </span>
    );
}
