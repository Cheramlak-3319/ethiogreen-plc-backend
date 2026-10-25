<?php

namespace Database\Seeders;

use App\Enums\InventoryMovementType;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\PurchaseOrderStatus;
use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Customer;
use App\Models\InventoryMovement;
use App\Models\Order;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with a demo ERP catalogue and orders.
     */
    public function run(): void
    {
        $admin = User::query()->updateOrCreate(
            ['email' => 'admin@ethiogreen.test'],
            [
                'name' => 'EthioGreen Admin',
                'phone' => '+251911000001',
                'role' => UserRole::Admin,
                'password' => 'password',
                'email_verified_at' => now(),
            ],
        );

        User::query()->updateOrCreate(
            ['email' => 'manager@ethiogreen.test'],
            [
                'name' => 'Store Manager',
                'phone' => '+251911000002',
                'role' => UserRole::Manager,
                'password' => 'password',
                'email_verified_at' => now(),
            ],
        );

        User::query()->updateOrCreate(
            ['email' => 'staff@ethiogreen.test'],
            [
                'name' => 'Warehouse Staff',
                'phone' => '+251911000003',
                'role' => UserRole::Staff,
                'password' => 'password',
                'email_verified_at' => now(),
            ],
        );

        $customerUser = User::query()->updateOrCreate(
            ['email' => 'customer@ethiogreen.test'],
            [
                'name' => 'Abebe Kebede',
                'phone' => '+251911000004',
                'role' => UserRole::Customer,
                'password' => 'password',
                'email_verified_at' => now(),
            ],
        );

        $categories = collect([
            ['name' => 'Sun-Dried Fruits', 'description' => 'Sun-ripened fruit, sliced and dried in our solar facility for a naturally sweet, chewy snack.'],
            ['name' => 'Sun-Dried Vegetables', 'description' => 'Farm-fresh vegetables, slow-dried to lock in flavour and nutrition.'],
            ['name' => 'SunRipe Collection', 'description' => 'Curated gift boxes of our finest sun-dried produce, ready to share.'],
        ])->mapWithKeys(function (array $category): array {
            $model = Category::query()->updateOrCreate(
                ['slug' => Str::slug($category['name'])],
                [...$category, 'is_active' => true],
            );

            return [$model->name => $model];
        });

        $catalogue = [
            ['Sun-Dried Fruits', 'Sun-Dried Apricot Slices', 28.00, 18.00, 120, true, 'pack', 'apricot'],
            ['Sun-Dried Fruits', 'Sun-Dried Cherry Halves', 30.00, 19.00, 90, true, 'pack', 'cherry'],
            ['Sun-Dried Fruits', 'Sun-Dried Date Halves', 24.00, 15.00, 140, false, 'pack', 'date'],
            ['Sun-Dried Fruits', 'Sun-Dried Fig Halves', 30.00, 19.00, 70, true, 'pack', 'fig'],
            ['Sun-Dried Fruits', 'Sun-Dried Grape Raisins', 20.00, 13.00, 180, false, 'pack', 'grape'],
            ['Sun-Dried Fruits', 'Sun-Dried Peach Slices', 26.00, 16.00, 85, true, 'pack', 'peach'],
            ['Sun-Dried Fruits', 'Sun-Dried Pear Slices', 25.00, 16.00, 95, false, 'pack', 'pear'],
            ['Sun-Dried Fruits', 'Sun-Dried Plum Halves', 24.00, 15.00, 100, false, 'pack', 'plum'],
            ['Sun-Dried Fruits', 'Sun-Dried Papaya Strips', 22.00, 14.00, 110, false, 'pack', 'papaya'],
            ['Sun-Dried Fruits', 'Sun-Dried Lime Slices', 19.00, 12.00, 130, false, 'pack', 'lime'],
            ['Sun-Dried Vegetables', 'Sun-Dried Eggplant Slices', 18.00, 11.00, 150, false, 'pack', 'eggplant'],
            ['Sun-Dried Vegetables', 'Sun-Dried Okra Pods', 20.00, 12.00, 120, false, 'pack', 'okra'],
            ['Sun-Dried Vegetables', 'Sun-Dried Onion Flakes', 15.00, 9.00, 200, false, 'pack', 'onion'],
            ['Sun-Dried Vegetables', 'Sun-Dried Pepper Strips', 22.00, 14.00, 160, true, 'pack', 'pepper'],
            ['Sun-Dried Vegetables', 'Sun-Dried Tomato Halves', 23.00, 14.00, 170, true, 'pack', 'tomato'],
            ['SunRipe Collection', 'SunRipe Sunrise Gift Box', 30.00, 20.00, 25, true, 'box', 'sunripe-harvest'],
            ['SunRipe Collection', 'SunRipe Solar-Dried Pantry Box', 30.00, 21.00, 18, true, 'box', 'sunripe-solar-drying'],
            ['SunRipe Collection', 'SunRipe Harvest Selection', 30.00, 22.00, 12, false, 'box', 'sunripe-facility'],
        ];

        $categoryDescriptions = [
            'Sun-Dried Fruits' => 'Sun-ripened fruit, sliced and dried in our solar facility for a naturally sweet, chewy snack.',
            'Sun-Dried Vegetables' => 'Farm-fresh vegetables, slow-dried to lock in flavour and nutrition.',
            'SunRipe Collection' => 'Curated gift boxes of our finest sun-dried produce, ready to share.',
        ];

        foreach ($catalogue as [$categoryName, $name, $price, $cost, $stock, $featured, $unit, $image]) {
            /** @var Category $category */
            $category = $categories->get($categoryName);

            if (! $category) {
                $category = Category::query()->updateOrCreate(
                    ['slug' => Str::slug($categoryName)],
                    ['name' => $categoryName, 'description' => $categoryDescriptions[$categoryName] ?? null, 'is_active' => true],
                );
                $categories->put($categoryName, $category);
            }

            Product::query()->updateOrCreate(
                ['slug' => Str::slug($name)],
                [
                    'category_id' => $category->getKey(),
                    'name' => $name,
                    'sku' => 'SR-'.Str::upper(Str::substr($image, 0, 10)),
                    'image' => 'images/products/'.$image.'.jpg',
                    'description' => "SunRipe by EthioGreen — {$name}. {$categoryDescriptions[$categoryName]}",
                    'short_description' => "Naturally dried {$name} from SunRipe.",
                    'price' => $price,
                    'cost_price' => $cost,
                    'stock_quantity' => $stock,
                    'reorder_level' => 10,
                    'unit' => $unit,
                    'is_active' => true,
                    'is_featured' => $featured,
                ],
            );
        }

        $suppliers = collect([
            ['Oromia Growers Cooperative', 'Tolosa Gemechu', '+251912000001', 'sales@oromiagrowers.test'],
            ['Rift Valley Coffee Union', 'Marta Bekele', '+251912000002', 'orders@riftvalleycoffee.test'],
            ['Amhara Dairy Collective', 'Yohannes Tadesse', '+251912000003', 'hello@amharadairy.test'],
            ['Shewa Pantry Traders', 'Fatuma Ali', '+251912000004', 'trade@shewapantry.test'],
        ])->map(fn (array $supplier): Supplier => Supplier::query()->create([
            'name' => $supplier[0],
            'contact_name' => $supplier[1],
            'phone' => $supplier[2],
            'email' => $supplier[3],
            'address' => 'Addis Ababa, Ethiopia',
            'is_active' => true,
        ]));

        $customers = collect([
            ['Abebe Kebede', '+251911100001', 'abebe@example.test', 'Bole, Addis Ababa', $customerUser->getKey()],
            ['Hana Tesfaye', '+251911100002', 'hana@example.test', 'Kazanchis, Addis Ababa', null],
            ['Dawit Mekonnen', '+251911100003', 'dawit@example.test', 'Megenagna, Addis Ababa', null],
            ['Selam Girma', '+251911100004', 'selam@example.test', 'Piassa, Addis Ababa', null],
            ['Kalkidan Assefa', '+251911100005', 'kalkidan@example.test', 'Sarbet, Addis Ababa', null],
        ])->map(fn (array $customer): Customer => Customer::query()->create([
            'name' => $customer[0],
            'phone' => $customer[1],
            'email' => $customer[2],
            'address' => $customer[3],
            'user_id' => $customer[4],
        ]));

        $products = Product::query()->get();

        foreach (range(1, 26) as $index) {
            $daysAgo = $index % 10;
            $placedAt = now()->subDays($daysAgo)->setTime(9 + ($index % 8), 15, 0);
            $isPaid = $index % 4 !== 0;
            $isCancelled = $index % 9 === 0;

            /** @var Order $order */
            $order = Order::query()->create([
                'customer_id' => $customers->random()->getKey(),
                'user_id' => $index % 5 === 0 ? $customerUser->getKey() : null,
                'channel' => 'online',
                'status' => $isCancelled
                    ? OrderStatus::Cancelled
                    : ($isPaid ? OrderStatus::Processing : OrderStatus::Pending),
                'payment_status' => $isCancelled
                    ? PaymentStatus::Failed
                    : ($isPaid ? PaymentStatus::Paid : PaymentStatus::Unpaid),
                'subtotal' => 0,
                'tax' => 0,
                'shipping' => 0,
                'total' => 0,
                'currency' => 'ETB',
                'payment_method' => $isPaid ? 'hellopass' : null,
                'placed_at' => $placedAt,
                'paid_at' => $isPaid ? $placedAt->copy()->addMinutes(12) : null,
            ]);

            $subtotal = 0.0;

            foreach ($products->random(fake()->numberBetween(1, 3)) as $product) {
                $quantity = fake()->numberBetween(1, 4);
                $lineTotal = round((float) $product->price * $quantity, 2);
                $subtotal += $lineTotal;

                $order->items()->create([
                    'product_id' => $product->getKey(),
                    'product_name' => $product->name,
                    'sku' => $product->sku,
                    'unit_price' => $product->price,
                    'quantity' => $quantity,
                    'line_total' => $lineTotal,
                ]);
            }

            $order->update([
                'subtotal' => round($subtotal, 2),
                'total' => round($subtotal, 2),
            ]);
        }

        InventoryMovement::query()->create([
            'product_id' => $products->first()->getKey(),
            'user_id' => $admin->getKey(),
            'type' => InventoryMovementType::Adjustment,
            'quantity' => 25,
            'balance_after' => (int) $products->first()->stock_quantity,
            'note' => 'Opening stock adjustment for the demo warehouse.',
        ]);

        $purchaseOrder = PurchaseOrder::query()->create([
            'po_number' => 'PO-'.now()->format('ymd').'-DEMO1',
            'supplier_id' => $suppliers->first()->getKey(),
            'user_id' => $admin->getKey(),
            'status' => PurchaseOrderStatus::Ordered,
            'total' => 0,
            'notes' => 'Weekly restock of fresh produce.',
            'ordered_at' => now()->subDays(2),
        ]);

        $purchaseTotal = 0.0;

        foreach ($products->where('category_id', $categories->get('Sun-Dried Vegetables')->getKey())->take(3) as $product) {
            $quantity = 40;
            $lineTotal = round((float) $product->cost_price * $quantity, 2);
            $purchaseTotal += $lineTotal;

            $purchaseOrder->items()->create([
                'product_id' => $product->getKey(),
                'quantity' => $quantity,
                'received_quantity' => 0,
                'unit_cost' => $product->cost_price,
                'line_total' => $lineTotal,
            ]);
        }

        $purchaseOrder->update(['total' => round($purchaseTotal, 2)]);
    }
}
