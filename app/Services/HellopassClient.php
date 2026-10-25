<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use RuntimeException;

class HellopassClient
{
    public function isConfigured(): bool
    {
        return (bool) config('hellopass.enabled')
            && filled(config('hellopass.project'));
    }

    /**
     * @return array<string, mixed>
     */
    public function projects(): array
    {
        return $this->get('api/dube/international/getprojectlist.php', [
            'project' => $this->project(),
        ]);
    }

    /**
     * @param  array<string, mixed>  $attributes
     * @return array<string, mixed>
     */
    public function registerCustomer(array $attributes): array
    {
        return $this->post('api/dube/international/customerselfregistration.php', $this->withoutBlanks([
            'fullname' => $attributes['fullname'],
            'mobile' => $attributes['mobile'],
            'project' => $this->project(),
            'dialCode' => $attributes['dialCode'] ?? config('hellopass.dial_code'),
            'channel' => $attributes['channel'] ?? config('hellopass.channel'),
            'countryCode' => $attributes['countryCode'] ?? config('hellopass.country_code'),
            'email' => $attributes['email'] ?? null,
            'registeredBy' => $attributes['registeredBy'] ?? null,
        ]));
    }

    /**
     * @param  array<string, mixed>  $attributes
     * @return array<string, mixed>
     */
    public function registerMerchant(array $attributes): array
    {
        return $this->post('api/dube/international/registermerchant.php', $this->withoutBlanks([
            ...$attributes,
            'project' => $attributes['project'] ?? $this->project(),
            'dialCode' => $attributes['dialCode'] ?? config('hellopass.dial_code'),
            'countryCode' => $attributes['countryCode'] ?? config('hellopass.country_code'),
        ]));
    }

    /**
     * @param  array<string, mixed>  $attributes
     * @return array<string, mixed>
     */
    public function registerSupplier(array $attributes): array
    {
        return $this->post('api/dube/international/registersupplier.php', $this->withoutBlanks([
            ...$attributes,
            'merchantType' => $attributes['merchantType'] ?? 'Supplier',
            'project' => $attributes['project'] ?? $this->project(),
            'dialCode' => $attributes['dialCode'] ?? config('hellopass.dial_code'),
            'countryCode' => $attributes['countryCode'] ?? config('hellopass.country_code'),
        ]));
    }

    /**
     * @param  array<string, mixed>  $attributes
     * @return array<string, mixed>
     */
    public function registerSupplierProduct(array $attributes): array
    {
        return $this->post('api/dube/international/registersupplierproduct.php', $this->withoutBlanks([
            ...$attributes,
            'project' => $attributes['project'] ?? $this->project(),
        ]));
    }

    /**
     * Send a bill to a HellOOpass user.
     *
     * The published contract does not expose the bill amount; HellOOpass
     * derives it from the bill/deep link when the user confirms.
     *
     * @return array<string, mixed>
     */
    public function placeOrder(
        string $userId,
        string $title,
        string $body,
        ?string $appLink = null,
        ?string $transactionId = null,
    ): array {
        return $this->post('api/dube/international/invoice/placeorder.php', $this->withoutBlanks([
            'user_id' => $userId,
            'title' => $title,
            'body' => $body,
            'notificationType' => config('hellopass.notification_type'),
            'appLink' => $appLink,
            'notifyPush' => true,
            'transactionId' => $transactionId,
        ]));
    }

    /**
     * @param  array<int, string>  $bills
     * @return array<string, mixed>
     */
    public function confirmBills(array $bills): array
    {
        return $this->post('api/dube/international/invoice/confirmbill.php', [
            'bills' => array_values($bills),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function cancelBill(string $billId, string $userId, string $remark = ''): array
    {
        return $this->post('api/dube/international/invoice/cancelbill.php', [
            'billId' => $billId,
            'userId' => $userId,
            'remark' => $remark,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function invoices(?string $project = null, ?string $mobile = null): array
    {
        return $this->get('api/dube/international/getallinvoices.php', $this->withoutBlanks([
            'project' => $project ?? $this->project(),
            'mobile' => $mobile,
        ]));
    }

    /**
     * @return array<string, mixed>
     */
    public function openInvoices(?string $project = null): array
    {
        return $this->get('api/dube/getopeninvoices.php', [
            'project' => $project ?? $this->project(),
        ]);
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function paymentHistory(array $filters = []): array
    {
        return $this->post('api/dube/getpaymenthistory.php', [
            ...$filters,
            'project' => $filters['project'] ?? $this->project(),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function topUpHistory(?string $project = null): array
    {
        return $this->get('api/dube/gettopuphistory.php', [
            'project' => $project ?? $this->project(),
        ]);
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function cashOutHistory(array $filters = []): array
    {
        return $this->post('api/dube/getcashouthistory.php', [
            ...$filters,
            'project' => $filters['project'] ?? $this->project(),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function merchants(?string $mobile = null): array
    {
        return $this->get('api/dube/international/getmerchantlist.php', $this->withoutBlanks([
            'project' => $this->project(),
            'mobile' => $mobile,
        ]));
    }

    /**
     * @return array<string, mixed>
     */
    public function customers(?string $mobile = null): array
    {
        return $this->get('api/dube/getallcustomers.php', $this->withoutBlanks([
            'project' => $this->project(),
            'mobile' => $mobile,
        ]));
    }

    /**
     * @return array<string, mixed>
     */
    public function suppliers(?string $mobile = null): array
    {
        return $this->get('api/dube/international/getsupplierlist.php', $this->withoutBlanks([
            'project' => $this->project(),
            'mobile' => $mobile,
        ]));
    }

    /**
     * @return array<string, mixed>
     */
    public function registerWebhook(string $url, string $secret, string $operatorName): array
    {
        return $this->post('api/dube/international/registerwebhookconfig.php', [
            'project' => $this->project(),
            'url' => $url,
            'secret' => $secret,
            'events' => 'placed,confirmed,rejected,success',
            'operatorName' => $operatorName,
        ]);
    }

    /**
     * Read a nested value without depending on the (currently unpublished)
     * response shape of the HellOOpass endpoints.
     *
     * @param  array<string, mixed>  $payload
     * @param  array<int, string>  $keys
     */
    public function firstValue(array $payload, array $keys): ?string
    {
        foreach ($keys as $key) {
            $value = Arr::get($payload, $key);

            if (is_scalar($value) && filled((string) $value)) {
                return (string) $value;
            }
        }

        foreach ($payload as $value) {
            if (is_array($value)) {
                $found = $this->firstValue($value, $keys);

                if ($found !== null) {
                    return $found;
                }
            }
        }

        return null;
    }

    /**
     * Locate an invoice/bill inside the (currently unpublished) response
     * shape. Bill identifiers are matched first; a reference is only used
     * when no bill was supplied, so an invoice can never win on a loose
     * `id` match alone.
     *
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>|null
     */
    public function findInvoice(array $payload, ?string $billId, ?string $reference = null): ?array
    {
        $billKeys = ['bill_id', 'billId', 'invoice_id', 'invoiceId', 'transactionId', 'transaction_id', 'order.id', 'order_id', 'orderId', 'id'];
        $referenceKeys = [
            'reference',
            'transactionId',
            'transaction_id',
            'order.reference',
            'order.number',
            'order_number',
            'orderNumber',
        ];

        if (filled($billId)) {
            $found = $this->searchInvoice($payload, $billKeys, (string) $billId);

            if ($found !== null) {
                return $found;
            }
        }

        if (filled($reference)) {
            return $this->searchInvoice($payload, $referenceKeys, (string) $reference);
        }

        return null;
    }

    /**
     * @param  array<string, mixed>  $attributes
     * @return array<string, mixed>
     */
    public function changeName(array $attributes): array
    {
        return $this->post('api/dube/changename.php', $this->withoutBlanks([
            'userId' => $attributes['userId'] ?? $attributes['user_id'] ?? null,
            'newName' => $attributes['newName'] ?? $attributes['new_name'] ?? null,
            'project' => $attributes['project'] ?? $this->project(),
        ]));
    }

    /**
     * @param  array<string, mixed>  $attributes
     * @return array<string, mixed>
     */
    public function changePhoneNumber(array $attributes): array
    {
        return $this->post('api/dube/international/changephonenumber.php', $this->withoutBlanks([
            'userId' => $attributes['userId'] ?? $attributes['user_id'] ?? null,
            'newMobile' => $attributes['newMobile'] ?? $attributes['new_mobile'] ?? null,
            'dialCode' => $attributes['dialCode'] ?? config('hellopass.dial_code'),
            'countryCode' => $attributes['countryCode'] ?? config('hellopass.country_code'),
            'project' => $attributes['project'] ?? $this->project(),
        ]));
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function customerCreditHistory(array $filters = []): array
    {
        return $this->post('api/dube/getcustomercredithistory.php', [
            ...$filters,
            'project' => $filters['project'] ?? $this->project(),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function customerList(?string $mobile = null): array
    {
        return $this->get('api/dube/international/getcustomerlist.php', $this->withoutBlanks([
            'project' => $this->project(),
            'mobile' => $mobile,
        ]));
    }

    /**
     * @param  array<string, mixed>  $attributes
     * @return array<string, mixed>
     */
    public function customerListOfMerchant(array $attributes): array
    {
        return $this->post('api/dube/getcustomerlistofmerchant.php', [
            ...$attributes,
            'project' => $attributes['project'] ?? $this->project(),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function internationalTotals(): array
    {
        return $this->get('api/dube/international/gettotals.php', [
            'project' => $this->project(),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function basicTotals(): array
    {
        return $this->get('api/dube/gettotals.php', [
            'project' => $this->project(),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function leapfrogTotals(): array
    {
        return $this->get('api/dube/international/gettotalsleapfrog.php', [
            'project' => $this->project(),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function cashInAndOutTotals(): array
    {
        return $this->get('api/dube/getcashinandouttotals.php', [
            'project' => $this->project(),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function repaymentHistory(): array
    {
        return $this->get('api/dube/getrepaymenthistorylist.php', [
            'project' => $this->project(),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function internationalRepaymentHistory(): array
    {
        return $this->get('api/dube/international/getrepaymenthistorylist.php', [
            'project' => $this->project(),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function receiptList(): array
    {
        return $this->get('api/dube/international/getreceiptlist.php', [
            'project' => $this->project(),
        ]);
    }

    /**
     * @param  array<string, mixed>  $attributes
     * @return array<string, mixed>
     */
    public function updateReceiptStatus(array $attributes): array
    {
        return $this->post('api/dube/international/updatereceiptstatus.php', [
            ...$attributes,
            'project' => $attributes['project'] ?? $this->project(),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function invoiceAndRepaymentTotals(): array
    {
        return $this->get('api/dube/getinvoicesandrepayments.php', [
            'project' => $this->project(),
        ]);
    }

    public function project(): string
    {
        $project = config('hellopass.project');

        if (blank($project)) {
            throw new RuntimeException('HELLOPASS_PROJECT is not configured.');
        }

        return (string) $project;
    }

    /**
     * @param  array<string, mixed>  $query
     * @return array<string, mixed>
     */
    private function get(string $path, array $query = []): array
    {
        return $this->decode(
            $this->request()->retry(2, 250, throw: false)->get($path, $query),
            'GET',
            $path,
        );
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function post(string $path, array $payload): array
    {
        return $this->decode($this->request()->post($path, $payload), 'POST', $path);
    }

    /**
     * @return array<string, mixed>
     */
    private function decode(Response $response, string $method, string $path): array
    {
        $body = (string) $response->body();

        if ((bool) config('hellopass.log_responses')) {
            Log::debug('HellOOpass response.', [
                'method' => $method,
                'path' => $path,
                'status' => $response->status(),
                'body' => Str::limit($body, 4000),
            ]);
        }

        if ($response->failed()) {
            Log::warning('HellOOpass request failed.', [
                'method' => $method,
                'path' => $path,
                'status' => $response->status(),
            ]);

            throw new RuntimeException(sprintf(
                'HellOOpass %s %s failed (%d): %s',
                $method,
                $path,
                $response->status(),
                $this->errorMessage($body) ?? 'unexpected response.',
            ));
        }

        $decoded = json_decode($body, true);

        if (! is_array($decoded)) {
            throw new RuntimeException("HellOOpass {$method} {$path} returned a non-JSON response.");
        }

        if ($decoded['error'] ?? false) {
            $message = $this->errorMessage($body) ?? 'the request was rejected.';

            Log::warning('HellOOpass returned an error envelope.', [
                'method' => $method,
                'path' => $path,
                'error' => $decoded['error'],
            ]);

            throw new RuntimeException("HellOOpass {$method} {$path} failed: {$message}");
        }

        return $decoded;
    }

    private function errorMessage(string $body): ?string
    {
        $decoded = json_decode($body, true);

        if (! is_array($decoded)) {
            return filled(Str::limit($body, 300)) ? Str::limit($body, 300) : null;
        }

        $message = data_get($decoded, 'error.message')
            ?? data_get($decoded, 'message.message')
            ?? data_get($decoded, 'message.statusDescription')
            ?? data_get($decoded, 'message.remark')
            ?? data_get($decoded, 'message')
            ?? data_get($decoded, 'statusDescription')
            ?? data_get($decoded, 'error');

        if (is_array($message)) {
            $message = data_get($message, 'statusDescription')
                ?? data_get($message, 'message')
                ?? data_get($message, 'remark')
                ?? null;
        }

        return is_scalar($message) && filled((string) $message)
            ? (string) $message
            : null;
    }

    /**
     * @param  array<string, mixed>  $payload
     * @param  array<int, string>  $keys
     * @return array<string, mixed>|null
     */
    private function searchInvoice(array $payload, array $keys, string $wanted): ?array
    {
        foreach ($keys as $key) {
            $value = Arr::get($payload, $key);

            if (is_scalar($value) && (string) $value === $wanted) {
                return $payload;
            }
        }

        foreach ($payload as $value) {
            if (is_array($value)) {
                $found = $this->searchInvoice($value, $keys, $wanted);

                if ($found !== null) {
                    return $found;
                }
            }
        }

        return null;
    }

    /**
     * Drop null/blank optional fields so the API receives only what we have.
     *
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function withoutBlanks(array $payload): array
    {
        return array_filter(
            $payload,
            fn (mixed $value): bool => $value !== null && $value !== '',
        );
    }

    private function request(): PendingRequest
    {
        if (! $this->isConfigured()) {
            throw new RuntimeException('HellOOpass payments are not configured.');
        }

        $request = Http::baseUrl(rtrim((string) config('hellopass.base_url'), '/'))
            ->acceptJson()
            ->asJson()
            ->connectTimeout((int) config('hellopass.connect_timeout'))
            ->timeout((int) config('hellopass.timeout'))
            ->withHeaders([
                'X-Project' => $this->project(),
            ]);

        if (filled(config('hellopass.api_key'))) {
            $request = $request->withHeaders([
                'X-Api-Key' => (string) config('hellopass.api_key'),
            ]);
        }

        return $request;
    }
}
