<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\HellopassWebhookEvent;
use App\Services\HellopassClient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class HellopassAccountController extends Controller
{
    public function __construct(
        private readonly HellopassClient $hellopass,
    ) {}

    public function index(Request $request): Response
    {
        $user = Auth::user();
        $phone = $request->query('phone', $user?->phone);
        $mobile = $this->normalizeMobile($phone);

        $customer = null;
        $wallets = null;
        $invoices = null;
        $paymentHistory = null;
        $topUpHistory = null;
        $cashOutHistory = null;
        $webhookEvents = [];
        $error = null;

        if (blank($mobile)) {
            $error = 'Add a phone number to your profile to view your HellOOpass account.';

            return Inertia::render('Account/Hellopass', [
                'phone' => null,
                'customer' => null,
                'wallets' => null,
                'invoices' => null,
                'paymentHistory' => null,
                'topUpHistory' => null,
                'cashOutHistory' => null,
                'webhookEvents' => [],
                'error' => $error,
                'hellopassEnabled' => (bool) config('hellopass.enabled'),
            ]);
        }

        try {
            $response = $this->hellopass->customers($mobile);
            $found = $this->firstCustomer($response, $mobile);
            $customer = $found;
            $wallets = $found;
        } catch (Throwable $exception) {
            $error = $exception->getMessage();
        }

        try {
            $invoices = $this->hellopass->invoices(null, $mobile);
        } catch (Throwable $exception) {
            $invoices = ['error' => $exception->getMessage()];
        }

        try {
            $paymentHistory = $this->hellopass->paymentHistory(['mobile' => $mobile]);
        } catch (Throwable $exception) {
            $paymentHistory = ['error' => $exception->getMessage()];
        }

        try {
            $topUpHistory = $this->hellopass->topUpHistory();
        } catch (Throwable $exception) {
            $topUpHistory = ['error' => $exception->getMessage()];
        }

        try {
            $cashOutHistory = $this->hellopass->cashOutHistory(['mobile' => $mobile]);
        } catch (Throwable $exception) {
            $cashOutHistory = ['error' => $exception->getMessage()];
        }

        try {
            $webhookEvents = HellopassWebhookEvent::query()
                ->latest()
                ->take(20)
                ->get();
        } catch (Throwable $exception) {
            $webhookEvents = [];
        }

        return Inertia::render('Account/Hellopass', [
            'phone' => $mobile,
            'customer' => $customer,
            'wallets' => $wallets,
            'invoices' => $invoices,
            'paymentHistory' => $paymentHistory,
            'topUpHistory' => $topUpHistory,
            'cashOutHistory' => $cashOutHistory,
            'webhookEvents' => $webhookEvents,
            'error' => $error,
            'hellopassEnabled' => (bool) config('hellopass.enabled'),
            'merchantWallet' => config('hellopass.merchant_wallet'),
        ]);
    }

    public function sendBill(Request $request): RedirectResponse
    {
        if (! $this->hellopass->isConfigured()) {
            return back()->with('error', 'HellOOpass is not configured.');
        }

        $validated = $request->validate([
            'user_id' => ['required', 'string', 'max:64'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'title' => ['required', 'string', 'max:120'],
            'body' => ['nullable', 'string', 'max:500'],
            'customer_wallet' => ['nullable', 'string', 'max:32'],
        ]);

        $merchantWallet = (string) config('hellopass.merchant_wallet');
        $customerWallet = $validated['customer_wallet'] ?: null;

        if (blank($customerWallet)) {
            try {
                $lookup = $this->hellopass->customers($this->normalizeMobile($request->query('phone', Auth::user()?->phone)) ?? '');
                $found = $this->firstCustomer($lookup, '');
                $customerWallet = $found['purchasewallet'] ?? $found['purchaseWallet'] ?? $found['purchase_wallet'] ?? null;
            } catch (Throwable $exception) {
                // Fall through; placeOrder may still succeed without a deep link.
            }
        }

        $appLink = null;

        if (filled($merchantWallet) && filled($customerWallet)) {
            $appLink = sprintf(
                'hp://personal.helloopay.com/paymentConfirmation?amount=%s&merchantWallet=%s&customerWallet=%s',
                rtrim(rtrim(number_format((float) $validated['amount'], 2, '.', ''), '0'), '.'),
                $merchantWallet,
                $customerWallet,
            );
        }

        $transactionId = 'EG-'.now()->format('YmdHis').'-'.Str::upper(Str::random(6));

        try {
            $response = $this->hellopass->placeOrder(
                (string) $validated['user_id'],
                (string) $validated['title'],
                (string) ($validated['body'] ?? 'Please confirm this payment in HellOOpass.'),
                $appLink,
                $transactionId,
            );

            $billId = $this->hellopass->firstValue($response, [
                'bill_id',
                'billId',
                'invoice_id',
                'invoiceId',
                'id',
            ]);

            return back()->with('success', $billId !== null
                ? "Bill {$billId} sent to {$validated['user_id']}."
                : 'Bill sent successfully.');
        } catch (Throwable $exception) {
            return back()->with('error', $exception->getMessage());
        }
    }

    public function confirmBill(Request $request, string $bill): RedirectResponse
    {
        if (! $this->hellopass->isConfigured()) {
            return back()->with('error', 'HellOOpass is not configured.');
        }

        try {
            $this->hellopass->confirmBills([$bill]);

            return back()->with('success', "Bill {$bill} confirmed.");
        } catch (Throwable $exception) {
            return back()->with('error', $exception->getMessage());
        }
    }

    public function cancelBill(Request $request, string $bill): RedirectResponse
    {
        if (! $this->hellopass->isConfigured()) {
            return back()->with('error', 'HellOOpass is not configured.');
        }

        $userId = $request->input('user_id');

        if (blank($userId)) {
            return back()->with('error', 'A HellOOpass user ID is required to cancel a bill.');
        }

        try {
            $this->hellopass->cancelBill($bill, (string) $userId, 'Cancelled by customer on EthioGreen.');

            return back()->with('success', "Bill {$bill} cancelled.");
        } catch (Throwable $exception) {
            return back()->with('error', $exception->getMessage());
        }
    }

    private function normalizeMobile(?string $phone): ?string
    {
        if (blank($phone)) {
            return null;
        }

        $digits = preg_replace('/\D+/', '', (string) $phone) ?? '';
        $dialCode = preg_replace('/\D+/', '', (string) config('hellopass.dial_code')) ?? '';

        if ($dialCode !== '' && str_starts_with($digits, $dialCode)) {
            $digits = substr($digits, strlen($dialCode));
        }

        $digits = ltrim($digits, '0');

        return filled($digits) ? $digits : null;
    }

    /**
     * @param  array<string, mixed>  $response
     * @return array<string, mixed>|null
     */
    private function firstCustomer(array $response, string $mobile): ?array
    {
        $message = $response['message'] ?? $response['data'] ?? $response;

        if (is_array($message) && isset($message[0]) && is_array($message[0])) {
            foreach ($message as $item) {
                if (is_array($item)) {
                    return $item;
                }
            }
        }

        if (is_array($message)) {
            return $message;
        }

        return null;
    }
}
