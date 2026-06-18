<?php

namespace App\Logging;

use Monolog\Handler\AbstractProcessingHandler;
use Monolog\Level;
use Monolog\Logger;

class DatabaseLogger
{
    public function __invoke(array $config): Logger
    {
        $level = Level::fromName($config['level'] ?? 'debug');
        $logger = new Logger('database');

        $handler = new DatabaseLoggingHandler($level);
        $logger->pushHandler($handler);

        return $logger;
    }
}
