<?php

namespace Tests\Feature;

use App\Enums\PaymentStatus;
use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class HellopassReconcileTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'hellopass.enabled' => true,
            'hellopass.base_url' => 'https://helloomarket.com',
            'hellopass.project' => 'Standard_ET',
            'hellopass.api_key' => null,
            'hellopass.currency' => 'ETB',
            'hellopass.amount_unit' => 'minor',
            'hellopass.log_responses' => false,
        ]);
    }

    public function test_it_marks_an_order_paid_when_the_invoice_reports_success(): void
    {
        $order = $this->pendingOrder();

        Http::fake([
            '*/getallinvoices.php*' => Http::response([
                'data' => [[
                    'bill_id' => 'BILL-123',
                    'status' => 'success',
                    'amount' => 25000,
                    'currency' => 'ETB',
                    'reference' => $order->order_number,
                ]],
            ], 200),
        ]);

        $this->artisan('hellopass:reconcile')->assertSuccessful();

        $order->refresh();

        $this->assertSame(PaymentStatus::Paid, $order->payment_status);
        $this->assertNotNull($order->paid_at);
        $this->assertNull($order->payment_error);
    }

    public function test_it_does_not_mark_an_order_paid_when_the_invoice_amount_differs(): void
    {
        $order = $this->pendingOrder();

        Http::fake([
            '*/getallinvoices.php*' => Http::response([
                'data' => [[
                    'bill_id' => 'BILL-123',
                    'status' => 'success',
                    'amount' => 100,
                    'currency' => 'ETB',
                    'reference' => $order->order_number,
                ]],
            ], 200),
        ]);

        $this->artisan('hellopass:reconcile')->assertSuccessful();

        $order->refresh();

        $this->assertSame(PaymentStatus::Pending, $order->payment_status);
        $this->assertStringContainsString('amount', (string) $order->payment_error);
    }

    public function test_it_skips_everything_when_the_integration_is_not_configured(): void
    {
        config(['hellopass.enabled' => false]);

        $order = $this->pendingOrder();

        Http::fake();

        $this->artisan('hellopass:reconcile')->assertSuccessful();

        Http::assertNothingSent();
        $this->assertSame(PaymentStatus::Pending, $order->fresh()->payment_status);
    }

    private function pendingOrder(): Order
    {
        return Order::factory()->create([
            'hellopass_bill_id' => 'BILL-123',
            'hellopass_reference' => null,
            'total' => 250,
            'currency' => 'ETB',
            'payment_status' => PaymentStatus::Pending,
        ]);
    }
}
