import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PageHeader from '@/Components/Ui/PageHeader';
import Pagination from '@/Components/Ui/Pagination';
import ErpLayout from '@/Layouts/ErpLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function SuppliersIndex({ suppliers, filters }) {
    const [editing, setEditing] = useState(null);
    const [search, setSearch] = useState(filters.q ?? '');

    const { data, setData, post, patch, processing, errors, reset, clearErrors } = useForm({
        name: '',
        contact_name: '',
        phone: '',
        email: '',
        address: '',
        notes: '',
        is_active: true,
    });

    const startEditing = (supplier) => {
        setEditing(supplier);
        clearErrors();
        setData({
            name: supplier.name,
            contact_name: supplier.contact_name ?? '',
            phone: supplier.phone ?? '',
            email: supplier.email ?? '',
            address: supplier.address ?? '',
            notes: supplier.notes ?? '',
            is_active: supplier.is_active,
        });
    };

    const cancelEditing = () => {
        setEditing(null);
        clearErrors();
        reset();
    };

    const submit = (event) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => cancelEditing(),
        };

        if (editing) {
            patch(route('erp.suppliers.update', editing.id), options);
        } else {
            post(route('erp.suppliers.store'), options);
        }
    };

    const destroy = (supplier) => {
        if (window.confirm(`Delete ${supplier.name}? Purchase order history is kept.`)) {
            router.delete(route('erp.suppliers.destroy', supplier.id), { preserveScroll: true });
        }
    };

    const applySearch = (event) => {
        event.preventDefault();
        router.get(
            route('erp.suppliers.index'),
            { q: search || undefined },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <ErpLayout>
            <Head title="Suppliers" />

            <PageHeader
                title="Suppliers"
                description="Keep supplier contacts and purchasing history in one place."
            />

            <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
                <section className="h-fit rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-gray-900">
                        {editing ? `Edit ${editing.name}` : 'New supplier'}
                    </h2>

                    <form onSubmit={submit} className="mt-4 space-y-4">
                        <div>
                            <InputLabel htmlFor="name" value="Company name" />
                            <input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(event) => setData('name', event.target.value)}
                                className="mt-1 block w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                required
                            />
                            <InputError message={errors.name} className="mt-1" />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="contact_name" value="Contact person" />
                                <input
                                    id="contact_name"
                                    type="text"
                                    value={data.contact_name}
                                    onChange={(event) => setData('contact_name', event.target.value)}
                                    className="mt-1 block w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                />
                                <InputError message={errors.contact_name} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="phone" value="Phone" />
                                <input
                                    id="phone"
                                    type="text"
                                    value={data.phone}
                                    onChange={(event) => setData('phone', event.target.value)}
                                    className="mt-1 block w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                />
                                <InputError message={errors.phone} className="mt-1" />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="email" value="Email" />
                            <input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(event) => setData('email', event.target.value)}
                                className="mt-1 block w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                            />
                            <InputError message={errors.email} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="address" value="Address" />
                            <input
                                id="address"
                                type="text"
                                value={data.address}
                                onChange={(event) => setData('address', event.target.value)}
                                className="mt-1 block w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                            />
                            <InputError message={errors.address} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="notes" value="Notes" />
                            <textarea
                                id="notes"
                                rows={2}
                                value={data.notes}
                                onChange={(event) => setData('notes', event.target.value)}
                                className="mt-1 block w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                            />
                            <InputError message={errors.notes} className="mt-1" />
                        </div>

                        <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input
                                type="checkbox"
                                checked={data.is_active}
                                onChange={(event) => setData('is_active', event.target.checked)}
                                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            Active supplier
                        </label>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:bg-emerald-400"
                            >
                                {processing ? 'Saving…' : editing ? 'Save changes' : 'Add supplier'}
                            </button>
                            {editing && (
                                <button
                                    type="button"
                                    onClick={cancelEditing}
                                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-300"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </section>

                <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-sm font-semibold text-gray-900">Supplier directory</h2>
                            <p className="mt-0.5 text-xs text-gray-500">{suppliers.total} suppliers</p>
                        </div>

                        <form onSubmit={applySearch} className="flex gap-2">
                            <input
                                type="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search suppliers"
                                className="w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500 sm:w-56"
                            />
                            <button
                                type="submit"
                                className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-gray-700"
                            >
                                Search
                            </button>
                        </form>
                    </div>

                    {suppliers.data.length === 0 ? (
                        <p className="px-5 py-8 text-center text-sm text-gray-500">
                            No suppliers found.
                        </p>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-100 text-sm">
                                    <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        <tr>
                                            <th className="px-5 py-3">Supplier</th>
                                            <th className="px-5 py-3">Contact</th>
                                            <th className="px-5 py-3 text-right">Purchase orders</th>
                                            <th className="px-5 py-3">Status</th>
                                            <th className="px-5 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {suppliers.data.map((supplier) => (
                                            <tr key={supplier.id} className="hover:bg-gray-50">
                                                <td className="px-5 py-3">
                                                    <p className="font-medium text-gray-900">{supplier.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {supplier.email ?? 'No email'}
                                                    </p>
                                                </td>
                                                <td className="px-5 py-3 text-gray-600">
                                                    <p>{supplier.contact_name ?? '—'}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {supplier.phone ?? 'No phone'}
                                                    </p>
                                                </td>
                                                <td className="px-5 py-3 text-right text-gray-600">
                                                    {supplier.purchase_orders_count}
                                                </td>
                                                <td className="px-5 py-3">
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                            supplier.is_active
                                                                ? 'bg-emerald-50 text-emerald-700'
                                                                : 'bg-gray-100 text-gray-600'
                                                        }`}
                                                    >
                                                        {supplier.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => startEditing(supplier)}
                                                            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => destroy(supplier)}
                                                            className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <Pagination paginator={suppliers} />
                        </>
                    )}
                </section>
            </div>
        </ErpLayout>
    );
}
