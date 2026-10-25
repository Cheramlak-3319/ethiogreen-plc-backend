<?php

namespace App\Http\Controllers\Erp;

use App\Http\Controllers\Controller;
use App\Models\HellopassWebhookEvent;
use App\Models\Order;
use App\Services\HellopassClient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class IntegrationController extends Controller
{
    public function __construct(
        private readonly HellopassClient $hellopass,
    ) {}

    public function index(Request $request): Response
    {
        $safe = function (callable $callback) {
            try {
                return $callback();
            } catch (Throwable $exception) {
                return ['error' => $exception->getMessage()];
            }
        };

        return Inertia::render('Erp/Settings/Integration', [
            'integration' => [
                'enabled' => (bool) config('hellopass.enabled'),
                'configured' => $this->hellopass->isConfigured(),
                'base_url' => config('hellopass.base_url'),
                'project' => config('hellopass.project'),
                'project_name' => config('hellopass.project_name'),
                'currency' => config('hellopass.currency'),
                'webhook_url' => route('webhooks.helloopass'),
                'webhook_secret_set' => filled(config('hellopass.webhook_secret')),
                'allow_unverified' => (bool) config('hellopass.allow_unverified_webhooks'),
            ],
            'invoices' => $request->session()->get('hellopass_invoices', []),
            'events' => HellopassWebhookEvent::query()->latest()->take(10)->get(),
            'paymentIssues' => Order::query()
                ->with('customer:id,name,phone')
                ->whereNotNull('payment_error')
                ->latest()
                ->take(10)
                ->get(['id', 'order_number', 'customer_id', 'total', 'payment_status', 'payment_error', 'created_at']),
            'merchants' => $safe(fn () => $this->hellopass->merchants()),
            'customers' => $safe(fn () => $this->hellopass->customers()),
            'suppliers' => $safe(fn () => $this->hellopass->suppliers()),
            'openInvoices' => $safe(fn () => $this->hellopass->openInvoices()),
            'invoiceTotals' => $safe(fn () => $this->hellopass->invoiceAndRepaymentTotals()),
            'internationalTotals' => $safe(fn () => $this->hellopass->internationalTotals()),
            'basicTotals' => $safe(fn () => $this->hellopass->basicTotals()),
            'cashInAndOutTotals' => $safe(fn () => $this->hellopass->cashInAndOutTotals()),
            'receipts' => $safe(fn () => $this->hellopass->receiptList()),
            'repaymentHistory' => $safe(fn () => $this->hellopass->repaymentHistory()),
        ]);
    }

    public function registerWebhook(Request $request): RedirectResponse
    {
        $secret = config('hellopass.webhook_secret');

        if (blank($secret)) {
            return back()->with('error', 'Set HELLOPASS_WEBHOOK_SECRET before registering the endpoint.');
        }

        try {
            $this->hellopass->registerWebhook(
                route('webhooks.helloopass'),
                (string) $secret,
                $request->user()->name,
            );
        } catch (Throwable $exception) {
            return back()->with('error', Str::limit($exception->getMessage(), 300));
        }

        return back()->with('success', 'HellOOpass webhook registered.');
    }

    public function syncInvoices(Request $request): RedirectResponse
    {
        try {
            $response = $this->hellopass->invoices();
        } catch (Throwable $exception) {
            return back()->with('error', Str::limit($exception->getMessage(), 300));
        }

        $request->session()->flash('hellopass_invoices', array_slice($response, 0, 25));

        return back()->with('success', 'Invoices pulled from HellOOpass.');
    }

    public function testConnection(): RedirectResponse
    {
        try {
            $response = $this->hellopass->projects();
        } catch (Throwable $exception) {
            return back()->with('error', Str::limit($exception->getMessage(), 300));
        }

        $count = is_array($response) ? count($response) : 0;

        return back()->with('success', "HellOOpass connection OK ({$count} project records returned).");
    }
}
