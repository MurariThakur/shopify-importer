<?php

namespace App\Exceptions;

class ShopifyRateLimitException extends ShopifyApiException
{
    public function __construct(
        string $message = '',
        private int $retryAfter = 10,
    ) {
        parent::__construct($message);
    }

    public function getRetryAfter(): int
    {
        return $this->retryAfter;
    }
}
