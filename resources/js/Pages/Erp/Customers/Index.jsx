import EmptyState from '@/Components/Ui/EmptyState';
import PageHeader from '@/Components/Ui/PageHeader';
import Pagination from '@/Components/Ui/Pagination';
import ErpLayout from '@/Layouts/ErpLayout';
import { formatMoney } from '@/lib/format';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function CustomersIndex({ customers, filters }) {
    const [search, setSearch] = useState(filters.q ?? '');

    const applySearch = (event) => {
        event.preventDefault();
        router.get(
            route('erp.customers.index'),
            { q: search || undefined },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <ErpLayout>
            <Head title="Customers" />

            <PageHeader
                title="Customers"
                description="Every buyer who has ordered online, with lifetime value and HellOOpass linkage."
            />

            <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-gray-500">{customers.total} customers</p>

                    <form onSubmit={applySearch} className="flex gap-2">
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search name, phone or email"
                            className="w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500 sm:w-72"
                        />
                        <button
                            type="submit"
                            className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-gray-700"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {customers.data.length === 0 ? (
                    <EmptyState
                        title="No customers found"
                        description="Customers are created automatically when an order is placed."
                    />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100 text-sm">
                                <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    <tr>
                                        <th className="px-5 py-3">Customer</th>
                                        <th className="px-5 py-3">Contact</th>
                                        <th className="px-5 py-3 text-right">Orders</th>
                                        <th className="px-5 py-3 text-right">Lifetime value</th>
                                        <th className="px-5 py-3">HellOOpass</th>
                                        <th className="px-5 py-3 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {customers.data.map((customer) => (
                                        <tr key={customer.id} className="hover:bg-gray-50">
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                                                        {customer.name.charAt(0).toUpperCase()}
                                                    </span>
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {customer.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            Joined {new Date(customer.created_at).toLocaleDateString('en-GB')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-gray-600">
                                                <p>{customer.phone}</p>
                                                <p className="text-xs text-gray-500">
                                                    {customer.email ?? 'No email'}
                                                </p>
                                            </td>
                                            <td className="px-5 py-3 text-right font-medium text-gray-900">
                                                {customer.orders_count}
                                            </td>
                                            <td className="px-5 py-3 text-right font-semibold text-gray-900">
                                                {formatMoney(customer.lifetime_value)}
                                            </td>
                                            <td className="px-5 py-3">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                        customer.hellopass_user_id
                                                            ? 'bg-emerald-50 text-emerald-700'
                                                            : 'bg-gray-100 text-gray-500'
                                                    }`}
                                                >
                                                    {customer.hellopass_user_id ? 'Linked' : 'Not linked'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <Link
                                                    href={route('erp.customers.show', customer.id)}
                                                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                                                >
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <Pagination paginator={customers} />
                    </>
                )}
            </div>
        </ErpLayout>
    );
}
