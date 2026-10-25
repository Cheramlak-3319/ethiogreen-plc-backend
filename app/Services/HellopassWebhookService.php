<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\HellopassWebhookEvent;
use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

class HellopassWebhookService
{
    public function __construct(
        private readonly OrderService $orders,
    ) {}

    /**
     * Persist a delivery, then apply it exactly once.
     *
     * @param  array<string, mixed>  $payload
     */
    public function handle(array $payload): ?HellopassWebhookEvent
    {
        $eventId = (string) ($payload['id'] ?? hash('sha256', (string) json_encode($payload)));
        $type = Str::lower((string) ($payload['type'] ?? 'unknown'));

        $event = HellopassWebhookEvent::query()->firstOrCreate(
            ['event_id' => $eventId],
            [
                'type' => $type,
                'bill_id' => data_get($payload, 'data.order.id'),
                'reference' => data_get($payload, 'data.order.reference'),
                'status' => data_get($payload, 'data.order.status'),
                'payload' => $payload,
            ],
        );

        if ($event->processed_at !== null) {
            return $event;
        }

        try {
            return DB::transaction(function () use ($eventId, $payload, $type): HellopassWebhookEvent {
                $event = HellopassWebhookEvent::query()
                    ->where('event_id', $eventId)
                    ->lockForUpdate()
                    ->firstOrFail();

                if ($event->processed_at !== null) {
                    return $event;
                }

                $this->process($event, $payload, $type);

                $event->update(['processed_at' => now()]);

                return $event;
            });
        } catch (Throwable $exception) {
            Log::error('HellOOpass webhook processing failed; delivery will be retried.', [
                'event_id' => $eventId,
                'message' => $exception->getMessage(),
            ]);

            throw $exception;
        }
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function process(HellopassWebhookEvent $event, array $payload, string $type): void
    {
        $order = $this->findOrder($payload);

        if ($order === null) {
            Log::warning('HellOOpass webhook did not match an order.', [
                'event_id' => $event->event_id,
                'bill_id' => $event->bill_id,
                'reference' => $event->reference,
            ]);

            return;
        }

        if (blank($order->hellopass_bill_id) && filled($event->bill_id)) {
            $order->update(['hellopass_bill_id' => $event->bill_id]);
            $order->refresh();
        }

        $problem = $this->validationProblem($payload, $order);

        if ($problem !== null) {
            $order->update(['payment_error' => $problem]);

            Log::warning('HellOOpass webhook did not match the order and was not applied.', [
                'event_id' => $event->event_id,
                'order' => $order->order_number,
                'problem' => $problem,
            ]);

            return;
        }

        $conflict = $this->apply($order->fresh(), $type);

        if ($conflict !== null) {
            $order->update(['payment_error' => $conflict]);

            Log::warning('HellOOpass webhook conflicted with the order state.', [
                'event_id' => $event->event_id,
                'order' => $order->order_number,
                'conflict' => $conflict,
            ]);
        }
    }

    /**
     * Match the bill first. The reference is only a fallback so a stale or
     * replayed reference can never move a different order forward.
     *
     * @param  array<string, mixed>  $payload
     */
    private function findOrder(array $payload): ?Order
    {
        $billId = data_get($payload, 'data.order.id');
        $reference = data_get($payload, 'data.order.reference');
        $metadataOrderId = data_get($payload, 'data.order.metadata.order_id');

        if (filled($billId)) {
            $order = Order::query()->where('hellopass_bill_id', $billId)->first();

            if ($order !== null) {
                return $order;
            }
        }

        if (filled($metadataOrderId)) {
            $order = Order::query()->find($metadataOrderId);

            if ($order !== null) {
                return $order;
            }
        }

        if (filled($reference)) {
            return Order::query()
                ->where(function ($query) use ($reference): void {
                    $query->where('order_number', $reference)
                        ->orWhere('hellopass_reference', $reference);
                })
                ->first();
        }

        return null;
    }

    /**
     * Verify the signed payload against our own order before fulfilment.
     *
     * @param  array<string, mixed>  $payload
     */
    private function validationProblem(array $payload, Order $order): ?string
    {
        $currency = data_get($payload, 'data.order.currency');

        if (filled($currency)) {
            $expected = Str::upper((string) ($order->currency ?: config('hellopass.currency')));

            if (Str::upper((string) $currency) !== $expected) {
                return "HellOOpass webhook currency {$currency} did not match the order currency {$expected}.";
            }
        }

        $reference = data_get($payload, 'data.order.reference');

        if (filled($reference)) {
            $expected = array_values(array_filter([
                $order->order_number,
                $order->hellopass_reference,
            ]));

            if (! in_array((string) $reference, $expected, true)) {
                return "HellOOpass webhook reference {$reference} did not match {$order->order_number}.";
            }
        }

        $amount = data_get($payload, 'data.order.amount');

        if ($amount === null || $amount === '' || ! is_numeric($amount)) {
            return $amount === null || $amount === '' ? null : 'HellOOpass webhook amount was not numeric.';
        }

        if (! $this->amountMatches((float) $amount, $order)) {
            return "HellOOpass webhook amount {$amount} did not match the order total {$order->total} {$order->currency}.";
        }

        return null;
    }

    /**
     * The published contract sends amounts in the smallest currency unit.
     */
    private function amountMatches(float $amount, Order $order): bool
    {
        $unit = (string) config('hellopass.amount_unit', 'minor');

        if ($unit === 'major') {
            return abs($amount - (float) $order->total) < 0.01;
        }

        return (int) round($amount) === (int) round((float) $order->total * 100);
    }

    private function apply(Order $order, string $type): ?string
    {
        return match ($type) {
            'success' => $this->applySuccess($order),
            'rejected' => $this->applyRejected($order),
            'confirmed', 'placed' => $this->applyPending($order),
            default => null,
        };
    }

    private function applySuccess(Order $order): ?string
    {
        if ($order->status === OrderStatus::Cancelled || $order->payment_status === PaymentStatus::Refunded) {
            return 'HellOOpass reported success for an order that was already cancelled.';
        }

        $this->orders->markPaid($order, $order->hellopass_bill_id);

        return null;
    }

    private function applyRejected(Order $order): ?string
    {
        if ($order->payment_status === PaymentStatus::Paid) {
            return 'HellOOpass reported a rejection for an order that was already paid.';
        }

        $this->orders->cancel($order);

        return null;
    }

    private function applyPending(Order $order): void
    {
        if ($order->payment_status === PaymentStatus::Unpaid) {
            $order->update(['payment_status' => PaymentStatus::Pending]);
        }
    }
}
