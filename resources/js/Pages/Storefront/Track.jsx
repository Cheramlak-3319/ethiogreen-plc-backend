import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Track() {
    const { data, setData, post, processing, errors } = useForm({
        order_number: '',
        phone: '',
    });

    const submit = (event) => {
        event.preventDefault();
        post(route('track.lookup'));
    };

    return (
        <StorefrontLayout>
            <Head title="Track your order" />

            <div className="mx-auto max-w-xl">
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                        Order tracking
                    </p>
                    <h1 className="mt-1 text-xl font-semibold tracking-tight text-gray-900">
                        Find your order
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Enter the order number from your confirmation and the phone number used at
                        checkout.
                    </p>

                    <form onSubmit={submit} className="mt-6 space-y-4">
                        <div>
                            <InputLabel htmlFor="order_number" value="Order number" />
                            <input
                                id="order_number"
                                type="text"
                                value={data.order_number}
                                onChange={(event) => setData('order_number', event.target.value)}
                                placeholder="ORD-261023-ABC123"
                                className="mt-1 block w-full rounded-lg border-gray-300 text-sm uppercase focus:border-emerald-500 focus:ring-emerald-500"
                                required
                            />
                            <InputError message={errors.order_number} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="phone" value="Phone number" />
                            <input
                                id="phone"
                                type="tel"
                                value={data.phone}
                                onChange={(event) => setData('phone', event.target.value)}
                                placeholder="+251911000000"
                                className="mt-1 block w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                required
                            />
                            <InputError message={errors.phone} className="mt-1" />
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:bg-emerald-400"
                        >
                            {processing ? 'Looking up…' : 'Track order'}
                        </button>
                    </form>
                </div>

                <div className="mt-4 rounded-xl border border-gray-100 bg-white p-4 text-center text-sm text-gray-500 shadow-sm">
                    Logged in?{' '}
                    <Link href={route('account.orders')} className="font-semibold text-emerald-700 hover:text-emerald-800">
                        See all your orders
                    </Link>
                </div>
            </div>
        </StorefrontLayout>
    );
}
