<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\HellopassWebhookEvent;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class HellopassWebhookTest extends TestCase
{
    use RefreshDatabase;

    private const SECRET = 'super-secret';

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'hellopass.webhook_secret' => self::SECRET,
            'hellopass.webhook_header' => 'X-HellOOpass-Signature',
            'hellopass.allow_unverified_webhooks' => false,
            'hellopass.amount_unit' => 'minor',
            'hellopass.currency' => 'ETB',
        ]);
    }

    public function test_signed_success_webhook_marks_the_order_as_paid(): void
    {
        $order = Order::factory()->create([
            'hellopass_bill_id' => 'BILL-123',
            'total' => 250,
            'payment_status' => PaymentStatus::Pending,
            'status' => OrderStatus::Pending,
        ]);

        $response = $this->postWebhook($this->payload('evt_1', 'success', $order, 25000));

        $response->assertOk()->assertJson(['received' => true]);

        $order->refresh();

        $this->assertSame(PaymentStatus::Paid, $order->payment_status);
        $this->assertSame(OrderStatus::Processing, $order->status);
        $this->assertNotNull($order->paid_at);
        $this->assertNull($order->payment_error);

        $event = HellopassWebhookEvent::query()->sole();

        $this->assertSame('evt_1', $event->event_id);
        $this->assertSame('BILL-123', $event->bill_id);
        $this->assertNotNull($event->processed_at);
    }

    public function test_replayed_webhooks_are_processed_only_once(): void
    {
        $order = Order::factory()->create([
            'hellopass_bill_id' => 'BILL-123',
            'total' => 250,
            'payment_status' => PaymentStatus::Pending,
        ]);

        $payload = $this->payload('evt_1', 'success', $order, 25000);

        $this->postWebhook($payload)->assertOk();
        $this->postWebhook($payload)->assertOk();

        $this->assertSame(PaymentStatus::Paid, $order->fresh()->payment_status);
        $this->assertDatabaseCount('hellopass_webhook_events', 1);
    }

    public function test_webhook_with_an_invalid_signature_is_rejected(): void
    {
        $order = Order::factory()->create([
            'hellopass_bill_id' => 'BILL-123',
            'total' => 250,
            'payment_status' => PaymentStatus::Pending,
        ]);

        $this->postWebhook($this->payload('evt_1', 'success', $order, 25000), 'not-the-signature')
            ->assertUnauthorized();

        $this->assertSame(PaymentStatus::Pending, $order->fresh()->payment_status);
        $this->assertDatabaseCount('hellopass_webhook_events', 0);
    }

    public function test_a_sha256_prefixed_signature_is_accepted(): void
    {
        $order = Order::factory()->create([
            'hellopass_bill_id' => 'BILL-123',
            'total' => 250,
            'payment_status' => PaymentStatus::Pending,
        ]);

        $payload = $this->payload('evt_1', 'success', $order, 25000);
        $body = json_encode($payload, JSON_THROW_ON_ERROR);

        $this->postWebhook($payload, 'sha256='.hash_hmac('sha256', $body, self::SECRET))
            ->assertOk();

        $this->assertSame(PaymentStatus::Paid, $order->fresh()->payment_status);
    }

    public function test_webhook_is_rejected_when_no_secret_is_configured(): void
    {
        config(['hellopass.webhook_secret' => null]);

        $order = Order::factory()->create([
            'hellopass_bill_id' => 'BILL-123',
            'total' => 250,
            'payment_status' => PaymentStatus::Pending,
        ]);

        $this->postWebhook($this->payload('evt_1', 'success', $order, 25000))
            ->assertUnauthorized();

        $this->assertSame(PaymentStatus::Pending, $order->fresh()->payment_status);
    }

    public function test_a_mismatched_amount_does_not_mark_the_order_as_paid(): void
    {
        $order = Order::factory()->create([
            'hellopass_bill_id' => 'BILL-123',
            'total' => 250,
            'payment_status' => PaymentStatus::Pending,
        ]);

        $this->postWebhook($this->payload('evt_1', 'success', $order, 10))->assertOk();

        $order->refresh();

        $this->assertSame(PaymentStatus::Pending, $order->payment_status);
        $this->assertNotNull($order->payment_error);
        $this->assertNotNull(HellopassWebhookEvent::query()->sole()->processed_at);
    }

    public function test_an_amount_in_whole_currency_units_does_not_match_a_minor_unit_bill(): void
    {
        $order = Order::factory()->create([
            'hellopass_bill_id' => 'BILL-123',
            'total' => 250,
            'payment_status' => PaymentStatus::Pending,
        ]);

        $this->postWebhook($this->payload('evt_1', 'success', $order, 250))->assertOk();

        $this->assertSame(PaymentStatus::Pending, $order->fresh()->payment_status);
    }

    public function test_a_currency_mismatch_does_not_mark_the_order_as_paid(): void
    {
        $order = Order::factory()->create([
            'hellopass_bill_id' => 'BILL-123',
            'total' => 250,
            'currency' => 'ETB',
            'payment_status' => PaymentStatus::Pending,
        ]);

        $payload = $this->payload('evt_1', 'success', $order, 25000);
        $payload['data']['order']['currency'] = 'USD';

        $this->postWebhook($payload)->assertOk();

        $order->refresh();

        $this->assertSame(PaymentStatus::Pending, $order->payment_status);
        $this->assertStringContainsString('currency', (string) $order->payment_error);
    }

    public function test_a_reference_mismatch_does_not_mark_the_order_as_paid(): void
    {
        $order = Order::factory()->create([
            'hellopass_bill_id' => 'BILL-123',
            'total' => 250,
            'payment_status' => PaymentStatus::Pending,
        ]);

        $payload = $this->payload('evt_1', 'success', $order, 25000);
        $payload['data']['order']['reference'] = 'SOMEONE-ELSE';

        $this->postWebhook($payload)->assertOk();

        $order->refresh();

        $this->assertSame(PaymentStatus::Pending, $order->payment_status);
        $this->assertStringContainsString('reference', (string) $order->payment_error);
    }

    public function test_a_rejected_webhook_cancels_the_order_and_restores_stock(): void
    {
        $product = Product::factory()->create(['stock_quantity' => 5]);

        $order = Order::factory()->create([
            'hellopass_bill_id' => 'BILL-123',
            'total' => 250,
            'payment_status' => PaymentStatus::Pending,
        ]);

        $order->items()->create([
            'product_id' => $product->getKey(),
            'product_name' => $product->name,
            'sku' => $product->sku,
            'unit_price' => 250,
            'quantity' => 2,
            'line_total' => 500,
        ]);

        $this->postWebhook($this->payload('evt_2', 'rejected', $order, 25000))->assertOk();

        $this->assertSame(OrderStatus::Cancelled, $order->fresh()->status);
        $this->assertSame(7, $product->fresh()->stock_quantity);
        $this->assertDatabaseHas('inventory_movements', [
            'product_id' => $product->getKey(),
            'type' => 'return',
            'quantity' => 2,
            'balance_after' => 7,
        ]);
    }

    public function test_a_rejection_after_success_does_not_cancel_a_paid_order(): void
    {
        $order = Order::factory()->create([
            'hellopass_bill_id' => 'BILL-123',
            'total' => 250,
            'payment_status' => PaymentStatus::Pending,
            'status' => OrderStatus::Pending,
        ]);

        $this->postWebhook($this->payload('evt_1', 'success', $order, 25000))->assertOk();
        $this->postWebhook($this->payload('evt_2', 'rejected', $order, 25000))->assertOk();

        $order->refresh();

        $this->assertSame(PaymentStatus::Paid, $order->payment_status);
        $this->assertSame(OrderStatus::Processing, $order->status);
        $this->assertStringContainsString('already paid', (string) $order->payment_error);
    }

    public function test_a_success_after_rejection_does_not_fulfil_a_cancelled_order(): void
    {
        $order = Order::factory()->create([
            'hellopass_bill_id' => 'BILL-123',
            'total' => 250,
            'payment_status' => PaymentStatus::Pending,
            'status' => OrderStatus::Pending,
        ]);

        $this->postWebhook($this->payload('evt_1', 'rejected', $order, 25000))->assertOk();
        $this->postWebhook($this->payload('evt_2', 'success', $order, 25000))->assertOk();

        $order->refresh();

        $this->assertSame(OrderStatus::Cancelled, $order->status);
        $this->assertNotSame(PaymentStatus::Paid, $order->payment_status);
        $this->assertStringContainsString('already cancelled', (string) $order->payment_error);
    }

    public function test_a_confirmed_event_marks_an_unpaid_order_as_pending(): void
    {
        $order = Order::factory()->create([
            'hellopass_bill_id' => 'BILL-123',
            'total' => 250,
            'payment_status' => PaymentStatus::Unpaid,
        ]);

        $this->postWebhook($this->payload('evt_1', 'confirmed', $order, 25000))->assertOk();

        $this->assertSame(PaymentStatus::Pending, $order->fresh()->payment_status);
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(string $eventId, string $type, Order $order, float $amount): array
    {
        return [
            'id' => $eventId,
            'type' => $type,
            'api_version' => 'v1',
            'data' => [
                'order' => [
                    'id' => $order->hellopass_bill_id,
                    'reference' => $order->order_number,
                    'amount' => $amount,
                    'currency' => $order->currency,
                    'status' => $type,
                ],
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function postWebhook(array $payload, ?string $signature = null): TestResponse
    {
        $body = json_encode($payload, JSON_THROW_ON_ERROR);
        $signature ??= hash_hmac('sha256', $body, self::SECRET);

        return $this->call('POST', '/webhooks/helloopass', [], [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_ACCEPT' => 'application/json',
            'HTTP_X_HELLOOPPASS_SIGNATURE' => $signature,
        ], $body);
    }
}
