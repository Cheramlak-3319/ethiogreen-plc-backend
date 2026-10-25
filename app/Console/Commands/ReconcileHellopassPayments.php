<?php

namespace App\Console\Commands;

use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Services\HellopassClient;
use App\Services\OrderService;
use Illuminate\Console\Command;
use Throwable;

class ReconcileHellopassPayments extends Command
{
    /**
     * @var string
     */
    protected $signature = 'hellopass:reconcile {--limit=50 : Maximum number of open bills to reconcile}';

    /**
     * @var string
     */
    protected $description = 'Verify open HellOOpass bills against the invoice API and update order payments';

    public function handle(OrderService $orders, HellopassClient $hellopass): int
    {
        if (! $hellopass->isConfigured()) {
            $this->components->warn('HellOOpass is not configured; nothing to reconcile.');

            return self::SUCCESS;
        }

        $limit = max(1, (int) $this->option('limit'));

        $open = Order::query()
            ->whereNotNull('hellopass_bill_id')
            ->whereIn('payment_status', [PaymentStatus::Unpaid, PaymentStatus::Pending])
            ->latest()
            ->limit($limit)
            ->get();

        if ($open->isEmpty()) {
            $this->components->info('No open HellOOpass bills to reconcile.');

            return self::SUCCESS;
        }

        $counts = [
            'paid' => 0,
            'failed' => 0,
            'pending' => 0,
            'conflict' => 0,
            'not_found' => 0,
            'errors' => 0,
        ];

        foreach ($open as $order) {
            try {
                $result = $orders->verifyPayment($order);
            } catch (Throwable $exception) {
                $counts['errors']++;

                $this->components->warn("{$order->order_number}: {$exception->getMessage()}");

                continue;
            }

            $status = $result['status'];

            if (array_key_exists($status, $counts)) {
                $counts[$status]++;
            }

            $this->components->twoColumnDetail(
                $order->order_number,
                $status === 'pending' ? 'still open' : $status,
            );
        }

        $this->components->info(sprintf(
            'Reconciled %d bills: %d paid, %d failed, %d open, %d conflicts, %d not found, %d errors.',
            $open->count(),
            $counts['paid'],
            $counts['failed'],
            $counts['pending'],
            $counts['conflict'],
            $counts['not_found'],
            $counts['errors'],
        ));

        return $counts['errors'] > 0 ? self::FAILURE : self::SUCCESS;
    }
}
