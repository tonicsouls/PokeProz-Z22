type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
    level: LogLevel;
    message: string;
    data?: unknown;
    timestamp: string;
}

const LOG_LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};

const currentLevel: LogLevel = (import.meta.env.MODE === 'production') ? 'warn' : 'debug';

function formatMessage(level: LogLevel, message: string, data?: unknown): LogEntry {
    return {
        level,
        message,
        data,
        timestamp: new Date().toISOString(),
    };
}

function log(level: LogLevel, message: string, data?: unknown) {
    if (LOG_LEVELS[level] < LOG_LEVELS[currentLevel]) {
        return;
    }

    const entry = formatMessage(level, message, data);

    // Console output
    const consoleMethod = level === 'debug' ? 'log' : level;
    if (data !== undefined) {
        console[consoleMethod](`[${entry.timestamp}] [${level.toUpperCase()}] ${message}`, data);
    } else {
        console[consoleMethod](`[${entry.timestamp}] [${level.toUpperCase()}] ${message}`);
    }

    // Future: Send to external logging service (Sentry, LogRocket, etc.)
    // if (level === 'error' || level === 'warn') {
    //   sendToExternalService(entry);
    // }
}

export const logger = {
    debug: (message: string, data?: unknown) => log('debug', message, data),
    info: (message: string, data?: unknown) => log('info', message, data),
    warn: (message: string, data?: unknown) => log('warn', message, data),
    error: (message: string, data?: unknown) => log('error', message, data),
};
