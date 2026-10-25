<?php

return [

    /*
    |--------------------------------------------------------------------------
    | HellOOpass Payments
    |--------------------------------------------------------------------------
    |
    | The published HellOOpass endpoints authenticate with the project
    | identifier rather than an API key. Keep every value in the environment
    | and never expose the webhook secret to the browser.
    |
    */

    'enabled' => env('HELLOPASS_ENABLED', false),

    'base_url' => env('HELLOPASS_BASE_URL', 'https://helloomarket.com'),

    'project' => env('HELLOPASS_PROJECT'),

    'project_name' => env('HELLOPASS_PROJECT_NAME', 'EthioGreen'),

    'currency' => env('HELLOPASS_CURRENCY', 'ETB'),

    'dial_code' => env('HELLOPASS_DIAL_CODE', '+251'),

    'country_code' => env('HELLOPASS_COUNTRY_CODE', 'ET'),

    'channel' => env('HELLOPASS_CHANNEL', 'web'),

    'notification_type' => env('HELLOPASS_NOTIFICATION_TYPE', 'paymentrequest'),
    'merchant_wallet' => env('HELLOPASS_MERCHANT_WALLET', '1710253319'),

    'api_key' => env('HELLOPASS_API_KEY'),

    /*
    |--------------------------------------------------------------------------
    | Amount unit
    |--------------------------------------------------------------------------
    |
    | The published webhook contract sends amounts in the smallest currency
    | unit (e.g. 25000 for 250.00 ETB). Only switch this to "major" if the
    | integration team confirms the API sends whole currency units.
    |
    */

    'amount_unit' => env('HELLOPASS_AMOUNT_UNIT', 'major'),

    'log_responses' => env('HELLOPASS_LOG_RESPONSES', false),

    'callback_url' => env('HELLOPASS_CALLBACK_URL'),

    'app_link' => env('HELLOPASS_APP_LINK'),

    'webhook_secret' => env('HELLOPASS_WEBHOOK_SECRET'),

    'webhook_header' => env('HELLOPASS_WEBHOOK_HEADER', 'X-HellOOpass-Signature'),

    'allow_unverified_webhooks' => env('HELLOPASS_ALLOW_UNVERIFIED_WEBHOOKS', false),

    'connect_timeout' => (int) env('HELLOPASS_CONNECT_TIMEOUT', 5),

    'timeout' => (int) env('HELLOPASS_TIMEOUT', 15),

];
