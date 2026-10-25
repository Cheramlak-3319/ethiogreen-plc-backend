<?php

namespace App\Services;

use App\Enums\InventoryMovementType;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Throwable;

class OrderService
{
    public function __construct(
        private readonly InventoryService $inventory,
        private readonly HellopassClient $hellopass,
    ) {}

    /**
     * @param  array{name: string, phone: string, email?: string|null, address?: string|null, notes?: string|null}  $checkout
     * @param  array<int, int>  $cart
     */
    public function checkout(array $checkout, array $cart, ?User $user = null): Order
    {
        if ($cart === []) {
            throw ValidationException::withMessages([
                'cart' => 'Your cart is empty.',
            ]);
        }

        $order = DB::transaction(function () use ($checkout, $cart, $user): Order {
            $products = Product::query()
                ->active()
                ->whereIn('id', array_keys($cart))
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            if ($products->count() !== count($cart)) {
                throw ValidationException::withMessages([
                    'cart' => 'One or more products in your cart are no longer available.',
                ]);
            }

            $customer = $this->resolveCustomer($checkout, $user);

            $lines = [];
            $subtotal = 0.0;

            foreach ($cart as $productId => $quantity) {
                /** @var Product $product */
                $product = $products->get($productId);

                if ($quantity < 1 || $quantity > $product->stock_quantity) {
                    throw ValidationException::withMessages([
                        'cart' => "Only {$product->stock_quantity} of {$product->name} are available.",
                    ]);
                }

                $lineTotal = round((float) $product->price * $quantity, 2);
                $subtotal += $lineTotal;

                $lines[] = [
                    'product' => $product,
                    'quantity' => $quantity,
                    'line_total' => $lineTotal,
                ];
            }

            $order = Order::create([
                'customer_id' => $customer->getKey(),
                'user_id' => $user?->getKey(),
                'channel' => 'online',
                'status' => OrderStatus::Pending,
                'payment_status' => PaymentStatus::Unpaid,
                'subtotal' => round($subtotal, 2),
                'tax' => 0,
                'shipping' => 0,
                'total' => round($subtotal, 2),
                'currency' => (string) config('hellopass.currency'),
                'notes' => $checkout['notes'] ?? null,
                'hellopass_payer_wallet' => $checkout['payment_wallet'] ?? null,
                'placed_at' => now(),
            ]);

            foreach ($lines as $line) {
                /** @var Product $product */
                $product = $line['product'];

                $order->items()->create([
                    'product_id' => $product->getKey(),
                    'product_name' => $product->name,
                    'sku' => $product->sku,
                    'unit_price' => $product->price,
                    'quantity' => $line['quantity'],
                    'line_total' => $line['line_total'],
                ]);

                $this->inventory->adjust(
                    $product,
                    -$line['quantity'],
                    InventoryMovementType::Sale,
                    $order,
                    $user,
                    "Sold on {$order->order_number}.",
                );
            }

            return $order;
        });

        $this->initiatePayment($order);

        return $order->fresh(['items', 'customer']);
    }

    public function initiatePayment(Order $order): void
    {
        $order->loadMissing('customer.user');

        if ($order->customer === null) {
            return;
        }

        if (! $this->hellopass->isConfigured()) {
            $order->update([
                'payment_method' => 'manual',
                'payment_error' => null,
            ]);

            return;
        }

        try {
            $customer = $order->customer;
            $mobile = $this->normalizeMobile($customer->phone);

            if (blank($customer->hellopass_user_id) || blank($customer->hellopass_wallet)) {
                $resolved = null;

                try {
                    $resolved = $this->firstHellopassCustomer($this->hellopass->customers($mobile));
                } catch (Throwable $lookupException) {
                    Log::warning('HellOOpass customer lookup failed.', [
                        'mobile' => $mobile,
                        'message' => $lookupException->getMessage(),
                    ]);
                }

                $hellopassUserId = $resolved['userid'] ?? $resolved['user_id'] ?? $resolved['userId'] ?? $resolved['id'] ?? null;
                $hellopassWallet = $resolved['purchasewallet'] ?? $resolved['purchaseWallet'] ?? $resolved['purchase_wallet'] ?? $resolved['wallet'] ?? null;

                if (blank($hellopassUserId)) {
                    $response = $this->hellopass->registerCustomer([
                        'fullname' => $customer->name,
                        'mobile' => $mobile,
                        'email' => $customer->email,
                    ]);

                    $hellopassUserId = $this->hellopass->firstValue($response, [
                        'user_id',
                        'userId',
                        'customer_id',
                        'customerId',
                        'id',
                    ]);

                    if (blank($hellopassUserId)) {
                        throw new \RuntimeException('HellOOpass did not return a user identifier.');
                    }

                    try {
                        $resolved = $this->firstHellopassCustomer($this->hellopass->customers($mobile));
                        $hellopassWallet = $resolved['purchasewallet'] ?? $resolved['purchaseWallet'] ?? $resolved['purchase_wallet'] ?? $hellopassWallet;
                    } catch (Throwable $lookupException) {
                        Log::warning('HellOOpass customer re-lookup failed.', [
                            'mobile' => $mobile,
                            'message' => $lookupException->getMessage(),
                        ]);
                    }
                }

                if (blank($hellopassUserId)) {
                    throw new \RuntimeException('HellOOpass did not return a user identifier.');
                }

                $customer->update(array_filter([
                    'hellopass_user_id' => (string) $hellopassUserId,
                    'hellopass_wallet' => $hellopassWallet ? (string) $hellopassWallet : null,
                ]));
            }

            $response = $this->hellopass->placeOrder(
                (string) $customer->hellopass_user_id,
                "Order {$order->order_number}",
                "Your order of {$order->currency} ".number_format((float) $order->total, 2).' is ready to pay.',
                $this->appLink($order, $customer),
                $order->order_number,
            );

            $billId = $this->hellopass->firstValue($response, [
                'bill_id',
                'billId',
                'invoice_id',
                'invoiceId',
                'order.id',
                'order_id',
                'orderId',
                'id',
            ]);

            $order->update([
                'payment_method' => 'hellopass',
                'payment_status' => PaymentStatus::Pending,
                'hellopass_bill_id' => $billId,
                'hellopass_reference' => $order->order_number,
                'payment_error' => $billId === null
                    ? 'HellOOpass accepted the order but did not return a bill identifier.'
                    : null,
            ]);
        } catch (Throwable $exception) {
            Log::error('HellOOpass payment initiation failed.', [
                'order' => $order->order_number,
                'message' => $exception->getMessage(),
            ]);

            $order->update([
                'payment_method' => 'hellopass',
                'payment_status' => PaymentStatus::Unpaid,
                'payment_error' => Str::limit($exception->getMessage(), 500),
            ]);
        }
    }

    public function markPaid(Order $order, ?string $billId = null): bool
    {
        if ($order->payment_status === PaymentStatus::Paid) {
            return false;
        }

        if ($order->status === OrderStatus::Cancelled) {
            Log::warning('Refused to mark a cancelled order as paid.', [
                'order' => $order->order_number,
            ]);

            return false;
        }

        $attributes = [
            'payment_status' => PaymentStatus::Paid,
            'paid_at' => now(),
            'payment_error' => null,
        ];

        if ($billId !== null) {
            $attributes['hellopass_bill_id'] = $billId;
        }

        if ($order->status === OrderStatus::Pending) {
            $attributes['status'] = OrderStatus::Processing;
        }

        $order->update($attributes);

        if ($this->hellopass->isConfigured() && filled($order->hellopass_bill_id)) {
            try {
                $this->hellopass->confirmBills([(string) $order->hellopass_bill_id]);
            } catch (Throwable $exception) {
                Log::warning('HellOOpass bill confirmation failed.', [
                    'order' => $order->order_number,
                    'message' => $exception->getMessage(),
                ]);
            }
        }

        return true;
    }

    public function markFailed(Order $order, ?string $reason = null): void
    {
        if ($order->payment_status === PaymentStatus::Paid) {
            return;
        }

        $order->update([
            'payment_status' => PaymentStatus::Failed,
            'payment_error' => $reason,
        ]);
    }

    public function cancel(Order $order, ?User $user = null): void
    {
        if (! $order->canBeCancelled()) {
            return;
        }

        DB::transaction(function () use ($order, $user): void {
            $this->inventory->restoreOrder($order, $user);

            $order->update([
                'status' => OrderStatus::Cancelled,
                'payment_status' => match ($order->payment_status) {
                    PaymentStatus::Paid => PaymentStatus::Refunded,
                    PaymentStatus::Pending => PaymentStatus::Failed,
                    default => $order->payment_status,
                },
            ]);
        });

        if ($this->hellopass->isConfigured() && filled($order->hellopass_bill_id)) {
            $userId = $order->customer?->hellopass_user_id;

            if (filled($userId)) {
                try {
                    $this->hellopass->cancelBill((string) $order->hellopass_bill_id, (string) $userId, 'Cancelled in EthioGreen ERP.');
                } catch (Throwable $exception) {
                    Log::warning('HellOOpass bill cancellation failed.', [
                        'order' => $order->order_number,
                        'message' => $exception->getMessage(),
                    ]);
                }
            }
        }
    }

    public function markCompleted(Order $order): void
    {
        if ($order->isCancelled()) {
            return;
        }

        $order->update(['status' => OrderStatus::Completed]);
    }

    /**
     * Ask HellOOpass for the authoritative state of the bill.
     *
     * @return array{status: string, order: Order}
     */
    public function verifyPayment(Order $order): array
    {
        if (! $this->hellopass->isConfigured()) {
            return ['status' => 'not_configured', 'order' => $order];
        }

        $response = $this->hellopass->invoices();
        $invoice = $this->hellopass->findInvoice(
            $response,
            $order->hellopass_bill_id,
            $order->hellopass_reference ?? $order->order_number,
        );

        if ($invoice === null) {
            return ['status' => 'not_found', 'order' => $order];
        }

        $problem = $this->invoiceProblem($invoice, $order);

        if ($problem !== null) {
            $order->update(['payment_error' => $problem]);

            Log::warning('HellOOpass invoice did not match the order.', [
                'order' => $order->order_number,
                'problem' => $problem,
            ]);

            return ['status' => 'conflict', 'order' => $order->fresh()];
        }

        $status = Str::lower((string) $this->hellopass->firstValue($invoice, [
            'status',
            'payment_status',
            'paymentStatus',
            'state',
            'transactionStatus',
            'transaction_status',
        ]));

        if (in_array($status, ['success', 'successful', 'paid', 'completed', 'settled'], true)) {
            $this->markPaid($order, $order->hellopass_bill_id);
            $status = 'paid';
        } elseif (in_array($status, ['rejected', 'failed', 'cancelled', 'canceled'], true)) {
            $this->markFailed($order, "HellOOpass reported the bill as {$status}.");
            $status = 'failed';
        } elseif (in_array($status, ['placed', 'confirmed', 'pending', 'processing'], true)) {
            $order->update(['payment_error' => null]);

            if ($order->payment_status === PaymentStatus::Unpaid) {
                $order->update(['payment_status' => PaymentStatus::Pending]);
            }
        }

        return ['status' => $status, 'order' => $order->fresh()];
    }

    /**
     * Verify an invoice read back from the API against our own order.
     *
     * @param  array<string, mixed>  $invoice
     */
    private function invoiceProblem(array $invoice, Order $order): ?string
    {
        $currency = $this->hellopass->firstValue($invoice, ['currency']);

        if ($currency !== null) {
            $expected = Str::upper((string) ($order->currency ?: config('hellopass.currency')));

            if (Str::upper($currency) !== $expected) {
                return "HellOOpass invoice currency {$currency} did not match the order currency {$expected}.";
            }
        }

        $reference = $this->hellopass->firstValue($invoice, [
            'reference',
            'transactionId',
            'transaction_id',
            'order.reference',
        ]);

        if ($reference !== null && $reference !== $order->hellopass_bill_id) {
            $expected = array_values(array_filter([
                $order->order_number,
                $order->hellopass_reference,
            ]));

            if (! in_array($reference, $expected, true)) {
                return "HellOOpass invoice reference {$reference} did not match {$order->order_number}.";
            }
        }

        $amount = $this->hellopass->firstValue($invoice, ['amount']);

        if ($amount === null || ! is_numeric($amount)) {
            return null;
        }

        $unit = (string) config('hellopass.amount_unit', 'minor');
        $matches = $unit === 'major'
            ? abs((float) $amount - (float) $order->total) < 0.01
            : (int) round((float) $amount) === (int) round((float) $order->total * 100);

        return $matches
            ? null
            : "HellOOpass invoice amount {$amount} did not match the order total {$order->total} {$order->currency}.";
    }

    /**
     * @param  array{name: string, phone: string, email?: string|null, address?: string|null}  $checkout
     */
    private function resolveCustomer(array $checkout, ?User $user): Customer
    {
        $customer = Customer::query()
            ->where('phone', $checkout['phone'])
            ->first();

        if ($customer === null && $user !== null) {
            $customer = $user->customer;
        }

        $customer ??= new Customer(['phone' => $checkout['phone']]);

        $customer->fill([
            'name' => $checkout['name'],
            'email' => $checkout['email'] ?? $customer->email,
            'address' => $checkout['address'] ?? $customer->address,
            'user_id' => $customer->user_id ?? $user?->getKey(),
        ]);

        if (! $customer->exists || $customer->isDirty(['name', 'email', 'address', 'user_id'])) {
            $customer->save();
        }

        return $customer;
    }

    private function appLink(Order $order, ?Customer $customer = null): string
    {
        $merchantWallet = config('hellopass.merchant_wallet');
        $customerWallet = $order->hellopass_payer_wallet ?: $customer?->hellopass_wallet;

        if (blank($customerWallet) && $customer !== null && filled($customer->hellopass_user_id)) {
            try {
                $response = $this->hellopass->customers($this->normalizeMobile($customer->phone));
                $found = $this->firstHellopassCustomer($response);
                $customerWallet = $found['purchasewallet'] ?? $found['purchaseWallet'] ?? $found['purchase_wallet'] ?? null;
            } catch (Throwable $exception) {
                Log::warning('Could not resolve customer wallet for app link.', [
                    'order' => $order->order_number,
                    'message' => $exception->getMessage(),
                ]);
            }
        }

        if (filled($merchantWallet) && filled($customerWallet)) {
            return sprintf(
                'hp://personal.helloopay.com/paymentConfirmation?amount=%s&merchantWallet=%s&customerWallet=%s',
                rtrim(rtrim(number_format((float) $order->total, 2, '.', ''), '0'), '.'),
                $merchantWallet,
                $customerWallet,
            );
        }

        $configured = config('hellopass.app_link');

        if (filled($configured)) {
            return rtrim((string) $configured, '/').'/orders/'.$order->getKey();
        }

        return route('orders.show', $order);
    }

    /**
     * @param  array<string, mixed>  $response
     * @return array<string, mixed>|null
     */
    private function firstHellopassCustomer(array $response): ?array
    {
        $message = $response['message'] ?? $response['data'] ?? $response;

        if (is_array($message) && isset($message[0]) && is_array($message[0])) {
            return $message[0];
        }

        if (is_array($message)) {
            return $message;
        }

        return null;
    }

    /**
     * HellOOpass expects the local mobile number (e.g. 911234567) plus a
     * separate dial code, while customers type full international numbers.
     */
    private function normalizeMobile(?string $phone): string
    {
        $digits = preg_replace('/\D+/', '', (string) $phone) ?? '';
        $dialCode = preg_replace('/\D+/', '', (string) config('hellopass.dial_code')) ?? '';

        if ($dialCode !== '' && str_starts_with($digits, $dialCode)) {
            $digits = substr($digits, strlen($dialCode));
        }

        return ltrim($digits, '0');
    }
}
