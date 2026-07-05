<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Trusted Proxies
    |--------------------------------------------------------------------------
    |
    | Set trusted proxy IP addresses for your application when running behind
    | a reverse proxy (like Railway, Heroku, AWS ELB, etc.)
    |
    */

    'proxies' => env('TRUSTED_PROXIES', '*'),

    /*
    |--------------------------------------------------------------------------
    | Trusted Headers
    |--------------------------------------------------------------------------
    |
    | Configure which headers to use for detecting proxy information.
    |
    */

    'headers' => Illuminate\Http\Request::HEADER_X_FORWARDED_FOR
        | Illuminate\Http\Request::HEADER_X_FORWARDED_HOST
        | Illuminate\Http\Request::HEADER_X_FORWARDED_PORT
        | Illuminate\Http\Request::HEADER_X_FORWARDED_PROTO
        | Illuminate\Http\Request::HEADER_X_FORWARDED_AWS_ELB,
];
