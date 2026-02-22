/**
 * This is a helper created on top of js default logger, 
 * This will accept any input params ( usually what you give in console.log() method)
 * and log the input only if the environment is 'development' by checking the NODE_ENV env value
 * @param  {...any} inputs - any input you usually give in console.log()
 */


/**
 * Enhanced logger utility for consistent logging across the application.
 * Supports log levels: log, warn, error.
 * Only logs in 'development' environment or if explicitly allowed.
 */
import { config } from '../config/env.config';

const getTimestamp = (): string => {
    return new Date().toISOString();
};

const shouldLog = (): boolean => {
    return config.nodeEnv === 'development';
};

export const consoleIt = {
    log: (...args: any[]): void => {
        if (shouldLog()) {
            console.log(`[LOG] [${getTimestamp()}]`, ...args);
        }
    },
    warn: (...args: any[]): void => {
        if (shouldLog()) {
            console.warn(`[WARN] [${getTimestamp()}]`, ...args);
        }
    },
    error: (...args: any[]): void => {

        console.error(`[ERROR] [${getTimestamp()}]`, ...args);
    }
};
