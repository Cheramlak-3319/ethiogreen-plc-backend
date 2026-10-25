import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PageHeader from '@/Components/Ui/PageHeader';
import ErpLayout from '@/Layouts/ErpLayout';
import { formatMoney } from '@/lib/format';
import { Head, Link, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';

export default function PurchaseOrdersCreate({ suppliers, products }) {
    const [rows, setRows] = useState([{ product_id: '', quantity: 1, unit_cost: '' }]);

    const { data, setData, post, processing, errors } = useForm({
        supplier_id: '',
        notes: '',
        items: [],
    });

    const addRow = () => {
        setRows((current) => [...current, { product_id: '', quantity: 1, unit_cost: '' }]);
    };

    const removeRow = (index) => {
        setRows((current) => current.filter((_, i) => i !== index));
    };

    const updateRow = (index, field, value) => {
        setRows((current) => {
            const next = [...current];
            next[index] = { ...next[index], [field]: value };

            if (field === 'product_id' && value) {
                const product = products.find((item) => String(item.id) === String(value));
                if (product && !next[index].unit_cost) {
                    next[index].unit_cost = product.cost_price ?? '';
                }
            }

            return next;
        });
    };

    const total = useMemo(() => {
        return rows.reduce((sum, row) => {
            const quantity = Number(row.quantity) || 0;
            const cost = Number(row.unit_cost) || 0;
            return sum + quantity * cost;
        }, 0);
    }, [rows]);

    const submit = (event) => {
        event.preventDefault();

        const items = rows
            .filter((row) => row.product_id && row.quantity && row.unit_cost)
            .map((row) => ({
                product_id: Number(row.product_id),
                quantity: Number(row.quantity),
                unit_cost: Number(row.unit_cost),
            }));

        setData('items', items);
        post(route('erp.purchase-orders.store'));
    };

    return (
        <ErpLayout>
            <Head title="Create purchase order" />

            <PageHeader
                title="Create purchase order"
                description="Order stock from a supplier. Receiving the PO will add items to inventory."
                actions={
                    <Link
                        href={route('erp.purchase-orders.index')}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-emerald-300 hover:text-emerald-700"
                    >
                        Back to purchase orders
                    </Link>
                }
            />

            <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1fr_340px]">
                <div className="space-y-6">
                    <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                        <h2 className="text-sm font-semibold text-gray-900">Supplier</h2>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <InputLabel htmlFor="supplier_id" value="Supplier" />
                                <select
                                    id="supplier_id"
                                    value={data.supplier_id}
                                    onChange={(event) => setData('supplier_id', event.target.value)}
                                    className="mt-1 block w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                    required
                                >
                                    <option value="">Select supplier</option>
                                    {suppliers.map((supplier) => (
                                        <option key={supplier.id} value={supplier.id}>
                                            {supplier.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.supplier_id} className="mt-1" />
                            </div>

                            <div className="sm:col-span-2">
                                <InputLabel htmlFor="notes" value="Notes" />
                                <textarea
                                    id="notes"
                                    rows={3}
                                    value={data.notes}
                                    onChange={(event) => setData('notes', event.target.value)}
                                    className="mt-1 block w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                    placeholder="Delivery instructions or reference"
                                />
                                <InputError message={errors.notes} className="mt-1" />
                            </div>
                        </div>
                    </section>

                    <section className="rounded-xl border border-gray-100 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                            <div>
                                <h2 className="text-sm font-semibold text-gray-900">Line items</h2>
                                <p className="mt-0.5 text-xs text-gray-500">
                                    Add products to restock
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={addRow}
                                className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-emerald-300 hover:text-emerald-700"
                            >
                                Add line
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100 text-sm">
                                <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    <tr>
                                        <th className="px-5 py-3">Product</th>
                                        <th className="px-5 py-3 text-right">Quantity</th>
                                        <th className="px-5 py-3 text-right">Unit cost</th>
                                        <th className="px-5 py-3 text-right">Line total</th>
                                        <th className="px-5 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {rows.map((row, index) => {
                                        const quantity = Number(row.quantity) || 0;
                                        const cost = Number(row.unit_cost) || 0;
                                        const lineTotal = quantity * cost;

                                        return (
                                            <tr key={index}>
                                                <td className="px-5 py-3">
                                                    <select
                                                        value={row.product_id}
                                                        onChange={(event) =>
                                                            updateRow(index, 'product_id', event.target.value)
                                                        }
                                                        className="w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                                        required
                                                    >
                                                        <option value="">Select product</option>
                                                        {products.map((product) => (
                                                            <option key={product.id} value={product.id}>
                                                                {product.name} · {product.sku}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={row.quantity}
                                                        onChange={(event) =>
                                                            updateRow(index, 'quantity', event.target.value)
                                                        }
                                                        className="w-24 rounded-lg border-gray-300 text-right text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                                        required
                                                    />
                                                </td>
                                                <td className="px-5 py-3">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={row.unit_cost}
                                                        onChange={(event) =>
                                                            updateRow(index, 'unit_cost', event.target.value)
                                                        }
                                                        className="w-28 rounded-lg border-gray-300 text-right text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                                        required
                                                    />
                                                </td>
                                                <td className="px-5 py-3 text-right font-medium text-gray-900">
                                                    {formatMoney(lineTotal)}
                                                </td>
                                                <td className="px-5 py-3 text-right">
                                                    {rows.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeRow(index)}
                                                            className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {errors.items && (
                            <p className="px-5 py-3 text-xs text-rose-600">{errors.items}</p>
                        )}
                    </section>
                </div>

                <aside className="space-y-6">
                    <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                        <h2 className="text-sm font-semibold text-gray-900">Summary</h2>
                        <dl className="mt-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Line items</dt>
                                <dd className="font-medium text-gray-900">{rows.length}</dd>
                            </div>
                            <div className="flex justify-between border-t border-gray-100 pt-2 text-base">
                                <dt className="font-semibold text-gray-900">Total</dt>
                                <dd className="font-semibold text-gray-900">{formatMoney(total)}</dd>
                            </div>
                        </dl>

                        <button
                            type="submit"
                            disabled={processing}
                            className="mt-5 flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:bg-emerald-400"
                        >
                            {processing ? 'Creating…' : 'Create purchase order'}
                        </button>
                    </section>
                </aside>
            </form>
        </ErpLayout>
    );
}
