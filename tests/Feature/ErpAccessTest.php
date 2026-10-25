<?php

namespace Tests\Feature;

use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ErpAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_login(): void
    {
        $this->get('/erp')->assertRedirect('/login');
    }

    public function test_customers_cannot_access_the_erp(): void
    {
        $customer = User::factory()->create();

        $this->actingAs($customer)->get('/erp')->assertForbidden();
        $this->actingAs($customer)->get('/erp/products')->assertForbidden();
    }

    public function test_staff_can_access_the_erp_dashboard(): void
    {
        $staff = User::factory()->staff()->create();

        $this->actingAs($staff)->get('/erp')->assertOk();
    }

    public function test_customer_dashboard_redirects_to_their_orders(): void
    {
        $customer = User::factory()->create();

        $this->actingAs($customer)
            ->get('/dashboard')
            ->assertRedirect(route('account.orders'));
    }

    public function test_admin_can_create_a_product_with_initial_stock(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->post('/erp/products', [
            'name' => 'Organic Honey',
            'price' => 350,
            'stock_quantity' => 12,
            'reorder_level' => 3,
        ]);

        $response->assertRedirect(route('erp.products.index'));

        $product = Product::query()->where('name', 'Organic Honey')->sole();

        $this->assertSame(12, $product->stock_quantity);
        $this->assertTrue($product->is_active);
        $this->assertDatabaseHas('inventory_movements', [
            'product_id' => $product->getKey(),
            'user_id' => $admin->getKey(),
            'type' => 'adjustment',
            'quantity' => 12,
            'balance_after' => 12,
        ]);
    }

    public function test_staff_can_mark_an_order_as_paid(): void
    {
        $staff = User::factory()->staff()->create();
        $order = Order::factory()->create();

        $this->actingAs($staff)
            ->patch(route('erp.orders.update', $order), ['action' => 'paid'])
            ->assertRedirect();

        $order->refresh();

        $this->assertSame(PaymentStatus::Paid, $order->payment_status);
        $this->assertNotNull($order->paid_at);
    }
}
