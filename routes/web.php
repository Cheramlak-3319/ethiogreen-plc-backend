<?php

use App\Http\Controllers\Erp\CategoryController;
use App\Http\Controllers\Erp\CustomerController;
use App\Http\Controllers\Erp\DashboardController;
use App\Http\Controllers\Erp\IntegrationController;
use App\Http\Controllers\Erp\InventoryController;
use App\Http\Controllers\Erp\OrderController as ErpOrderController;
use App\Http\Controllers\Erp\ProductController as ErpProductController;
use App\Http\Controllers\Erp\PurchaseOrderController;
use App\Http\Controllers\Erp\SupplierController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Storefront\CartController;
use App\Http\Controllers\Storefront\CheckoutController;
use App\Http\Controllers\Storefront\HellopassAccountController;
use App\Http\Controllers\Storefront\OrderController;
use App\Http\Controllers\Storefront\StorefrontController;
use App\Http\Controllers\Webhooks\HellopassWebhookController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [StorefrontController::class, 'home'])->name('home');
Route::get('/shop', [StorefrontController::class, 'index'])->name('shop.index');
Route::get('/shop/{product:slug}', [StorefrontController::class, 'show'])->name('shop.show');

Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
Route::post('/cart/{product}', [CartController::class, 'store'])->name('cart.store');
Route::patch('/cart/{product}', [CartController::class, 'update'])->name('cart.update');
Route::delete('/cart/{product}', [CartController::class, 'destroy'])->name('cart.destroy');
Route::delete('/cart', [CartController::class, 'clear'])->name('cart.clear');

Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout.index');
Route::post('/checkout', [CheckoutController::class, 'store'])
    ->middleware('throttle:20,1')
    ->name('checkout.store');

Route::get('/track', fn () => Inertia::render('Storefront/Track'))->name('track.index');
Route::post('/track', [OrderController::class, 'track'])->name('track.lookup');
Route::get('/orders/{order:order_number}', [OrderController::class, 'show'])->name('orders.show');
Route::post('/orders/{order:order_number}/verify', [OrderController::class, 'verify'])
    ->middleware('throttle:10,1')
    ->name('orders.verify');

Route::post('/webhooks/helloopass', [HellopassWebhookController::class, 'store'])
    ->name('webhooks.helloopass');

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', function () {
        return auth()->user()->isStaff()
            ? redirect()->route('erp.dashboard')
            : redirect()->route('account.orders');
    })->name('dashboard');

    Route::get('/account/orders', [OrderController::class, 'index'])->name('account.orders');
    Route::get('/account/hellopass', [HellopassAccountController::class, 'index'])->name('account.hellopass');
    Route::post('/account/hellopass/bills/{bill}/confirm', [HellopassAccountController::class, 'confirmBill'])->name('account.hellopass.confirm');
    Route::post('/account/hellopass/bills/{bill}/cancel', [HellopassAccountController::class, 'cancelBill'])->name('account.hellopass.cancel');
    Route::post('/account/hellopass/send-bill', [HellopassAccountController::class, 'sendBill'])->name('account.hellopass.send');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'role:admin,manager,staff'])
    ->prefix('erp')
    ->name('erp.')
    ->group(function () {
        Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

        Route::resource('products', ErpProductController::class)->except('show');
        Route::resource('categories', CategoryController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::resource('suppliers', SupplierController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::resource('customers', CustomerController::class)->only(['index', 'show']);

        Route::get('orders', [ErpOrderController::class, 'index'])->name('orders.index');
        Route::get('orders/{order}', [ErpOrderController::class, 'show'])->name('orders.show');
        Route::patch('orders/{order}', [ErpOrderController::class, 'update'])->name('orders.update');
        Route::post('orders/{order}/verify', [ErpOrderController::class, 'verify'])->name('orders.verify');

        Route::get('purchase-orders', [PurchaseOrderController::class, 'index'])->name('purchase-orders.index');
        Route::get('purchase-orders/create', [PurchaseOrderController::class, 'create'])->name('purchase-orders.create');
        Route::post('purchase-orders', [PurchaseOrderController::class, 'store'])->name('purchase-orders.store');
        Route::get('purchase-orders/{purchaseOrder}', [PurchaseOrderController::class, 'show'])->name('purchase-orders.show');
        Route::post('purchase-orders/{purchaseOrder}/receive', [PurchaseOrderController::class, 'receive'])->name('purchase-orders.receive');

        Route::get('inventory', [InventoryController::class, 'index'])->name('inventory.index');
        Route::post('inventory/adjust', [InventoryController::class, 'adjust'])->name('inventory.adjust');

        Route::get('integration', [IntegrationController::class, 'index'])->name('integration.index');
        Route::post('integration/webhook', [IntegrationController::class, 'registerWebhook'])->name('integration.webhook');
        Route::post('integration/sync-invoices', [IntegrationController::class, 'syncInvoices'])->name('integration.sync');
        Route::post('integration/test', [IntegrationController::class, 'testConnection'])->name('integration.test');
    });

require __DIR__.'/auth.php';
