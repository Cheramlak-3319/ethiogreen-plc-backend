<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckoutRequest;
use App\Services\CartService;
use App\Services\HellopassClient;
use App\Services\OrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function __construct(
        private readonly CartService $cart,
        private readonly OrderService $orders,
    ) {}

    public function index(): Response|RedirectResponse
    {
        $items = $this->cart->items();

        if ($items === []) {
            return redirect()->route('shop.index')->with('error', 'Your cart is empty.');
        }

        $user = Auth::user();

        $wallets = null;

        if ($user !== null && $user->phone !== null && (bool) config('hellopass.enabled')) {
            try {
                $mobile = preg_replace('/\D+/', '', (string) $user->phone);
                $dialCode = preg_replace('/\D+/', '', (string) config('hellopass.dial_code'));
                if ($dialCode !== '' && str_starts_with($mobile, $dialCode)) {
                    $mobile = substr($mobile, strlen($dialCode));
                }
                $mobile = ltrim($mobile, '0');

                if ($mobile !== '') {
                    $response = app(HellopassClient::class)->customers($mobile);
                    $message = $response['message'] ?? $response['data'] ?? $response;
                    $wallets = is_array($message) && isset($message[0]) ? $message[0] : (is_array($message) ? $message : null);
                }
            } catch (\Throwable $exception) {
                $wallets = null;
            }
        }

        return Inertia::render('Storefront/Checkout', [
            'items' => $items,
            'subtotal' => $this->cart->subtotal(),
            'customer' => $user === null ? null : [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
            ],
            'hellopassEnabled' => (bool) config('hellopass.enabled'),
            'wallets' => $wallets,
            'merchantWallet' => config('hellopass.merchant_wallet'),
        ]);
    }

    public function store(CheckoutRequest $request): RedirectResponse
    {
        $order = $this->orders->checkout(
            $request->validated(),
            $this->cart->raw(),
            $request->user(),
        );

        $this->cart->clear();
        $request->session()->put('recent_order_id', $order->getKey());

        $message = $order->hellopass_bill_id !== null
            ? 'Order placed. Check your HellOOpass app to approve the payment.'
            : 'Order placed successfully.';

        return redirect()
            ->route('orders.show', $order)
            ->with('success', $message);
    }
}
