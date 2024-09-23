<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array
     */
    protected $except = [
        'api/products/count',
        'api/products',
        'api/graphql',
        'api/webhooks',
        '/api/get/shop',
        '/api/get-qn-data',
        '/api/generate/qnid',
        '/api/update-metafields',
        '/api/update-mydetails',
        '/api/send-password-reset',
        '/api/update-reorder-metafields',
        '/api/set-email-preference',
    ];
}

