<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class CheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_checkout_and_stock_is_reserved(): void
    {
        config(['hellopass.enabled' => false]);

        $product = Product::factory()->create([
            'price' => 100,
            'stock_quantity' => 10,
        ]);

        $response = $this->withSession(['cart' => [$product->getKey() => 2]])
            ->post('/checkout', [
                'name' => 'Abebe Kebede',
                'phone' => '+251 911 000 111',
                'email' => 'abebe@example.test',
                'address' => 'Bole, Addis Ababa',
            ]);

        $order = Order::query()->sole();

        $response->assertRedirect(route('orders.show', $order));

        $this->assertSame('+251911000111', $order->customer->phone);
        $this->assertSame(200.0, (float) $order->total);
        $this->assertSame(OrderStatus::Pending, $order->status);
        $this->assertSame(PaymentStatus::Unpaid, $order->payment_status);
        $this->assertSame('manual', $order->payment_method);
        $this->assertSame(8, $product->fresh()->stock_quantity);
        $this->assertNull(session('cart'));

        $this->assertDatabaseHas('inventory_movements', [
            'product_id' => $product->getKey(),
            'type' => 'sale',
            'quantity' => -2,
            'balance_after' => 8,
        ]);
    }

    public function test_checkout_creates_a_hellopass_bill_when_the_integration_is_enabled(): void
    {
        config([
            'hellopass.enabled' => true,
            'hellopass.project' => 'ETHIOGREEN',
            'hellopass.base_url' => 'https://hellopass.test',
        ]);

        Http::fake([
            'hellopass.test/*customerselfregistration.php' => Http::response(['user_id' => 'hp-user-1']),
            'hellopass.test/*invoice/placeorder.php' => Http::response(['bill_id' => 'BILL-123']),
        ]);

        $product = Product::factory()->create([
            'price' => 75.50,
            'stock_quantity' => 5,
        ]);

        $response = $this->withSession(['cart' => [$product->getKey() => 2]])
            ->post('/checkout', [
                'name' => 'Abebe Kebede',
                'phone' => '+251 911 000 111',
            ]);

        $order = Order::query()->sole();

        $response->assertRedirect(route('orders.show', $order));

        $this->assertSame('BILL-123', $order->hellopass_bill_id);
        $this->assertSame('hellopass', $order->payment_method);
        $this->assertSame(PaymentStatus::Pending, $order->payment_status);
        $this->assertSame('hp-user-1', $order->customer->hellopass_user_id);
        $this->assertNull($order->payment_error);

        Http::assertSent(fn (Request $request): bool => str_ends_with($request->url(), 'customerselfregistration.php')
            && $request['mobile'] === '911000111'
            && $request['dialCode'] === '+251');

        Http::assertSent(fn (Request $request): bool => str_ends_with($request->url(), 'invoice/placeorder.php')
            && $request['user_id'] === 'hp-user-1'
            && $request['title'] === "Order {$order->order_number}");
    }

    public function test_checkout_rejects_quantities_above_available_stock(): void
    {
        $product = Product::factory()->create(['stock_quantity' => 1]);

        $response = $this->withSession(['cart' => [$product->getKey() => 2]])
            ->from('/checkout')
            ->post('/checkout', [
                'name' => 'Abebe Kebede',
                'phone' => '0911000111',
            ]);

        $response->assertRedirect('/checkout');
        $response->assertSessionHasErrors('cart');

        $this->assertDatabaseCount('orders', 0);
        $this->assertSame(1, $product->fresh()->stock_quantity);
    }

    public function test_inactive_products_cannot_be_checked_out(): void
    {
        $product = Product::factory()->create([
            'stock_quantity' => 5,
            'is_active' => false,
        ]);

        $response = $this->withSession(['cart' => [$product->getKey() => 1]])
            ->from('/checkout')
            ->post('/checkout', [
                'name' => 'Abebe Kebede',
                'phone' => '0911000111',
            ]);

        $response->assertRedirect('/checkout');
        $response->assertSessionHasErrors('cart');

        $this->assertDatabaseCount('orders', 0);
        $this->assertSame(5, $product->fresh()->stock_quantity);
    }
}
