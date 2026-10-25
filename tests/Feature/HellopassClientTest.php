<?php

namespace Tests\Feature;

use App\Services\HellopassClient;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use RuntimeException;
use Tests\TestCase;

class HellopassClientTest extends TestCase
{
    private HellopassClient $client;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'hellopass.enabled' => true,
            'hellopass.base_url' => 'https://helloomarket.com',
            'hellopass.project' => 'Standard_ET',
            'hellopass.api_key' => null,
            'hellopass.dial_code' => '+251',
            'hellopass.country_code' => 'ET',
            'hellopass.channel' => 'web',
            'hellopass.notification_type' => 'push',
            'hellopass.log_responses' => false,
        ]);

        $this->client = app(HellopassClient::class);
    }

    public function test_place_order_sends_the_documented_and_bruno_collection_fields(): void
    {
        Http::fake([
            '*/invoice/placeorder.php' => Http::response(['id' => 'BILL-1'], 200),
        ]);

        $this->client->placeOrder('251-00001-00022', 'Order ORD-1', 'Ready to pay.', 'https://app.test/orders/1', 'ORD-1');

        Http::assertSent(function (Request $request): bool {
            return $request->url() === 'https://helloomarket.com/api/dube/international/invoice/placeorder.php'
                && $request['user_id'] === '251-00001-00022'
                && $request['title'] === 'Order ORD-1'
                && $request['notificationType'] === 'push'
                && $request['appLink'] === 'https://app.test/orders/1'
                && $request['notifyPush'] === true
                && $request['transactionId'] === 'ORD-1';
        });
    }

    public function test_register_customer_forwards_optional_fields_and_the_project(): void
    {
        Http::fake([
            '*/customerselfregistration.php' => Http::response(['user_id' => 'usr_1'], 200),
        ]);

        $this->client->registerCustomer([
            'fullname' => 'Abebe Kebede',
            'mobile' => '911234567',
            'email' => 'abebe@example.com',
        ]);

        Http::assertSent(function (Request $request): bool {
            return $request['project'] === 'Standard_ET'
                && $request['dialCode'] === '+251'
                && $request['countryCode'] === 'ET'
                && $request['email'] === 'abebe@example.com'
                && ! array_key_exists('registeredBy', $request->data());
        });
    }

    public function test_the_api_key_header_is_sent_when_configured(): void
    {
        config(['hellopass.api_key' => 'secret-key']);

        Http::fake([
            '*/confirmbill.php' => Http::response(['ok' => true], 200),
        ]);

        $this->client->confirmBills(['BILL-1']);

        Http::assertSent(fn (Request $request): bool => $request->hasHeader('X-Api-Key', 'secret-key'));
    }

    public function test_an_error_envelope_returned_with_http_200_throws(): void
    {
        Http::fake([
            '*/confirmbill.php' => Http::response([
                'error' => ['code' => 'not_found', 'message' => 'The bill was not found.'],
            ], 200),
        ]);

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('The bill was not found.');

        $this->client->confirmBills(['BILL-1']);
    }

    public function test_a_failed_response_throws_with_the_error_message(): void
    {
        Http::fake([
            '*/confirmbill.php' => Http::response([
                'error' => ['code' => 'invalid_request', 'message' => 'bills is required'],
            ], 400),
        ]);

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('bills is required');

        $this->client->confirmBills(['BILL-1']);
    }

    public function test_find_invoice_prefers_the_bill_id_over_a_reference(): void
    {
        $payload = [
            'data' => [
                ['bill_id' => 'OTHER-1', 'reference' => 'BILL-1', 'status' => 'failed'],
                ['bill_id' => 'BILL-1', 'reference' => 'ORDER-1', 'status' => 'success'],
            ],
        ];

        $invoice = $this->client->findInvoice($payload, 'BILL-1', 'BILL-1');

        $this->assertNotNull($invoice);
        $this->assertSame('success', $invoice['status']);
    }

    public function test_find_invoice_falls_back_to_the_reference(): void
    {
        $payload = [
            'data' => [
                ['reference' => 'ORDER-1', 'status' => 'confirmed'],
            ],
        ];

        $invoice = $this->client->findInvoice($payload, null, 'ORDER-1');

        $this->assertNotNull($invoice);
        $this->assertSame('confirmed', $invoice['status']);
    }
}
