<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        if (app()->environment('production') && config('database.default') === 'sqlite') {
            $target = (string) config('database.connections.sqlite.database');

            if ($target !== ':memory:' && str_starts_with($target, '/tmp') && ! file_exists($target)) {
                $source = base_path('database/database.sqlite');

                if (is_file($source)) {
                    @copy($source, $target);
                }
            }
        }
    }
}
