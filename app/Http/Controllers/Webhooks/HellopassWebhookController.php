<?php

namespace App\Http\Controllers\Webhooks;

use App\Http\Controllers\Controller;
use App\Services\HellopassWebhookService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class HellopassWebhookController extends Controller
{
    public function __construct(
        private readonly HellopassWebhookService $webhooks,
    ) {}

    public function store(Request $request): JsonResponse
    {
        $rawBody = $request->getContent();

        if (! $this->hasValidSignature($request, $rawBody)) {
            abort(401, 'Invalid HellOOpass webhook signature.');
        }

        $payload = json_decode($rawBody, true);

        if (! is_array($payload)) {
            abort(400, 'Invalid JSON payload.');
        }

        $this->webhooks->handle($payload);

        return response()->json(['received' => true]);
    }

    private function hasValidSignature(Request $request, string $rawBody): bool
    {
        $secret = config('hellopass.webhook_secret');

        if (blank($secret)) {
            return (bool) config('hellopass.allow_unverified_webhooks') && app()->environment('local');
        }

        $header = $request->header((string) config('hellopass.webhook_header'));

        if (blank($header)) {
            foreach ([
                'X-HellOOpass-Signature',
                'X-HellOOppass-Signature',
                'X-Hellopass-Signature',
                'X-Hellooppass-Signature',
                'X-Signature',
                'X-Webhook-Signature',
            ] as $candidate) {
                $header = $request->header($candidate);

                if (filled($header)) {
                    break;
                }
            }
        }

        if (blank($header)) {
            return false;
        }

        $expected = hash_hmac('sha256', $rawBody, (string) $secret);

        return hash_equals($expected, $this->normalizeSignature((string) $header));
    }

    /**
     * Accept bare hex signatures as well as `sha256=<hex>` and
     * `t=…,v1=<hex>` style headers.
     */
    private function normalizeSignature(string $header): string
    {
        $candidates = array_values(array_filter(
            array_map('trim', preg_split('/[,\s]+/', trim($header)) ?: []),
            fn (string $candidate): bool => $candidate !== '',
        ));

        foreach ($candidates as $candidate) {
            if (Str::startsWith($candidate, ['v1=', 'sha256='])) {
                return (string) Str::after($candidate, '=');
            }
        }

        $candidate = $candidates[0] ?? trim($header);

        return Str::contains($candidate, '=')
            ? (string) Str::afterLast($candidate, '=')
            : $candidate;
    }
}
