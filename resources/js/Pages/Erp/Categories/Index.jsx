import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PageHeader from '@/Components/Ui/PageHeader';
import ErpLayout from '@/Layouts/ErpLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function CategoriesIndex({ categories }) {
    const [editing, setEditing] = useState(null);
    const { data, setData, post, patch, processing, errors, reset, clearErrors } = useForm({
        name: '',
        description: '',
        is_active: true,
    });

    const startEditing = (category) => {
        setEditing(category);
        clearErrors();
        setData({
            name: category.name,
            description: category.description ?? '',
            is_active: category.is_active,
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
            onSuccess: () => {
                cancelEditing();
            },
        };

        if (editing) {
            patch(route('erp.categories.update', editing.id), options);
        } else {
            post(route('erp.categories.store'), options);
        }
    };

    const destroy = (category) => {
        if (
            window.confirm(
                `Delete ${category.name}? Products stay in the catalogue but become uncategorised.`,
            )
        ) {
            router.delete(route('erp.categories.destroy', category.id), { preserveScroll: true });
        }
    };

    return (
        <ErpLayout>
            <Head title="Categories" />

            <PageHeader
                title="Categories"
                description="Group products so customers can browse the storefront by department."
            />

            <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
                <section className="h-fit rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-gray-900">
                        {editing ? `Edit ${editing.name}` : 'New category'}
                    </h2>

                    <form onSubmit={submit} className="mt-4 space-y-4">
                        <div>
                            <InputLabel htmlFor="name" value="Name" />
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

                        <div>
                            <InputLabel htmlFor="description" value="Description" />
                            <textarea
                                id="description"
                                rows={3}
                                value={data.description}
                                onChange={(event) => setData('description', event.target.value)}
                                className="mt-1 block w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                            />
                            <InputError message={errors.description} className="mt-1" />
                        </div>

                        <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input
                                type="checkbox"
                                checked={data.is_active}
                                onChange={(event) => setData('is_active', event.target.checked)}
                                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            Visible in storefront
                        </label>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:bg-emerald-400"
                            >
                                {processing ? 'Saving…' : editing ? 'Save changes' : 'Add category'}
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
                    <div className="border-b border-gray-100 px-5 py-4">
                        <h2 className="text-sm font-semibold text-gray-900">All categories</h2>
                        <p className="mt-0.5 text-xs text-gray-500">{categories.length} categories</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100 text-sm">
                            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                <tr>
                                    <th className="px-5 py-3">Name</th>
                                    <th className="px-5 py-3">Products</th>
                                    <th className="px-5 py-3">Status</th>
                                    <th className="px-5 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {categories.map((category) => (
                                    <tr key={category.id} className="hover:bg-gray-50">
                                        <td className="px-5 py-3">
                                            <p className="font-medium text-gray-900">{category.name}</p>
                                            <p className="text-xs text-gray-500">/{category.slug}</p>
                                        </td>
                                        <td className="px-5 py-3 text-gray-600">
                                            {category.products_count}
                                        </td>
                                        <td className="px-5 py-3">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                    category.is_active
                                                        ? 'bg-emerald-50 text-emerald-700'
                                                        : 'bg-gray-100 text-gray-600'
                                                }`}
                                            >
                                                {category.is_active ? 'Active' : 'Hidden'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => startEditing(category)}
                                                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => destroy(category)}
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

                    {categories.length === 0 && (
                        <p className="px-5 py-8 text-center text-sm text-gray-500">
                            No categories yet. Create your first one.
                        </p>
                    )}
                </section>
            </div>
        </ErpLayout>
    );
}
