import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PageHeader from '@/Components/Ui/PageHeader';
import ErpLayout from '@/Layouts/ErpLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function ProductForm({ product, categories }) {
    const isEdit = Boolean(product);
    const fileInput = useRef(null);
    const [preview, setPreview] = useState(product?.image_url ?? null);

    const { data, setData, post, patch, processing, errors } = useForm({
        category_id: product?.category_id ?? '',
        name: product?.name ?? '',
        slug: product?.slug ?? '',
        sku: product?.sku ?? '',
        description: product?.description ?? '',
        short_description: product?.short_description ?? '',
        price: product?.price ?? '',
        cost_price: product?.cost_price ?? '',
        stock_quantity: product?.stock_quantity ?? 0,
        reorder_level: product?.reorder_level ?? 5,
        unit: product?.unit ?? 'pcs',
        is_active: product?.is_active ?? true,
        is_featured: product?.is_featured ?? false,
        image: null,
    });

    const submit = (event) => {
        event.preventDefault();

        const options = {
            forceFormData: true,
            preserveScroll: true,
        };

        if (isEdit) {
            patch(route('erp.products.update', product.id), options);
        } else {
            post(route('erp.products.store'), options);
        }
    };

    const handleImage = (event) => {
        const file = event.target.files?.[0] ?? null;
        setData('image', file);

        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    return (
        <ErpLayout>
            <Head title={isEdit ? `Edit ${product.name}` : 'Add product'} />

            <PageHeader
                title={isEdit ? `Edit ${product.name}` : 'Add product'}
                description={
                    isEdit
                        ? 'Update pricing, stock and storefront visibility.'
                        : 'Create a new product and set its opening stock.'
                }
                actions={
                    <Link
                        href={route('erp.products.index')}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-emerald-300 hover:text-emerald-700"
                    >
                        Back to products
                    </Link>
                }
            />

            <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1fr_340px]">
                <div className="space-y-6">
                    <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                        <h2 className="text-sm font-semibold text-gray-900">Product information</h2>

                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <InputLabel htmlFor="name" value="Product name" />
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
                                <InputLabel htmlFor="category_id" value="Category" />
                                <select
                                    id="category_id"
                                    value={data.category_id}
                                    onChange={(event) => setData('category_id', event.target.value)}
                                    className="mt-1 block w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                >
                                    <option value="">Uncategorised</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.category_id} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="sku" value="SKU (leave blank to generate)" />
                                <input
                                    id="sku"
                                    type="text"
                                    value={data.sku}
                                    onChange={(event) => setData('sku', event.target.value)}
                                    className="mt-1 block w-full rounded-lg border-gray-300 text-sm uppercase focus:border-emerald-500 focus:ring-emerald-500"
                                />
                                <InputError message={errors.sku} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="slug" value="Slug (leave blank to generate)" />
                                <input
                                    id="slug"
                                    type="text"
                                    value={data.slug}
                                    onChange={(event) => setData('slug', event.target.value)}
                                    className="mt-1 block w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                />
                                <InputError message={errors.slug} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="unit" value="Unit" />
                                <input
                                    id="unit"
                                    type="text"
                                    value={data.unit}
                                    onChange={(event) => setData('unit', event.target.value)}
                                    className="mt-1 block w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                    placeholder="kg, pcs, litre"
                                />
                                <InputError message={errors.unit} className="mt-1" />
                            </div>

                            <div className="sm:col-span-2">
                                <InputLabel htmlFor="short_description" value="Short description" />
                                <input
                                    id="short_description"
                                    type="text"
                                    value={data.short_description}
                                    onChange={(event) => setData('short_description', event.target.value)}
                                    className="mt-1 block w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                />
                                <InputError message={errors.short_description} className="mt-1" />
                            </div>

                            <div className="sm:col-span-2">
                                <InputLabel htmlFor="description" value="Full description" />
                                <textarea
                                    id="description"
                                    rows={5}
                                    value={data.description}
                                    onChange={(event) => setData('description', event.target.value)}
                                    className="mt-1 block w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                />
                                <InputError message={errors.description} className="mt-1" />
                            </div>
                        </div>
                    </section>

                    <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                        <h2 className="text-sm font-semibold text-gray-900">Pricing &amp; stock</h2>

                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="price" value="Selling price (ETB)" />
                                <input
                                    id="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={data.price}
                                    onChange={(event) => setData('price', event.target.value)}
                                    className="mt-1 block w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                    required
                                />
                                <InputError message={errors.price} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="cost_price" value="Cost price (ETB)" />
                                <input
                                    id="cost_price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={data.cost_price}
                                    onChange={(event) => setData('cost_price', event.target.value)}
                                    className="mt-1 block w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                />
                                <InputError message={errors.cost_price} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="stock_quantity" value="Stock quantity" />
                                <input
                                    id="stock_quantity"
                                    type="number"
                                    min="0"
                                    value={data.stock_quantity}
                                    onChange={(event) => setData('stock_quantity', event.target.value)}
                                    className="mt-1 block w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Changes are recorded as an inventory adjustment.
                                </p>
                                <InputError message={errors.stock_quantity} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="reorder_level" value="Reorder level" />
                                <input
                                    id="reorder_level"
                                    type="number"
                                    min="0"
                                    value={data.reorder_level}
                                    onChange={(event) => setData('reorder_level', event.target.value)}
                                    className="mt-1 block w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                />
                                <InputError message={errors.reorder_level} className="mt-1" />
                            </div>
                        </div>
                    </section>
                </div>

                <aside className="space-y-6">
                    <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                        <h2 className="text-sm font-semibold text-gray-900">Image</h2>

                        <div className="mt-3 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-emerald-50 to-lime-50">
                            {preview ? (
                                <img src={preview} alt="Product preview" className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-4xl font-semibold text-emerald-600/30">
                                    {data.name?.charAt(0) || '?'}
                                </span>
                            )}
                        </div>

                        <input
                            ref={fileInput}
                            type="file"
                            accept="image/*"
                            onChange={handleImage}
                            className="mt-3 block w-full text-xs text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100"
                        />
                        <InputError message={errors.image} className="mt-1" />
                        <p className="mt-2 text-xs text-gray-500">JPG, PNG or WebP up to 5 MB.</p>
                    </section>

                    <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                        <h2 className="text-sm font-semibold text-gray-900">Visibility</h2>

                        <label className="mt-3 flex items-start gap-3">
                            <input
                                type="checkbox"
                                checked={data.is_active}
                                onChange={(event) => setData('is_active', event.target.checked)}
                                className="mt-0.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span>
                                <span className="block text-sm font-medium text-gray-900">
                                    Active in storefront
                                </span>
                                <span className="block text-xs text-gray-500">
                                    Customers can browse and buy this product.
                                </span>
                            </span>
                        </label>

                        <label className="mt-4 flex items-start gap-3">
                            <input
                                type="checkbox"
                                checked={data.is_featured}
                                onChange={(event) => setData('is_featured', event.target.checked)}
                                className="mt-0.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span>
                                <span className="block text-sm font-medium text-gray-900">Featured</span>
                                <span className="block text-xs text-gray-500">
                                    Show on the storefront home page.
                                </span>
                            </span>
                        </label>
                    </section>

                    <div className="flex flex-col gap-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:bg-emerald-400"
                        >
                            {processing ? 'Saving…' : isEdit ? 'Save changes' : 'Create product'}
                        </button>
                        <Link
                            href={route('erp.products.index')}
                            className="rounded-lg border border-gray-200 px-4 py-2.5 text-center text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:text-gray-900"
                        >
                            Cancel
                        </Link>
                    </div>
                </aside>
            </form>
        </ErpLayout>
    );
}
