import winston from 'winston';
import kleur from 'kleur';

interface LogMetadata {
    message: string;
    memberId?: string;
    routeName?: string;
    duration?: number;
    additionalInfo?: Record<string, any>;
}

export class Logger {
    private logger: winston.Logger;

    constructor() {
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                winston.format.printf(({ level, message, timestamp }) => {
                    return `[${timestamp}] ${this.colorizeLevel(level)}: ${message}`;
                })
            ),
            transports: [new winston.transports.Console()],
        });
    }

    private colorizeLevel(level: string): string {
        switch (level.toLowerCase()) {
            case 'info':
                return kleur.blue(level.toUpperCase());
            case 'warn':
                return kleur.yellow(level.toUpperCase());
            case 'error':
                return kleur.red(level.toUpperCase());
            case 'debug':
                return kleur.magenta(level.toUpperCase());
            default:
                return level.toUpperCase();
        }
    }

    private colorizeMessage(message: string): string {
        return message
            .replace(/\[PERFORMANCE\]/g, kleur.green('[PERFORMANCE]'))
            .replace(/\[HTTP REQUEST\]/g, kleur.blue('[HTTP REQUEST]'))
            .replace(/\[HTTP RESPONSE\]/g, kleur.cyan('[HTTP RESPONSE]'))
            .replace(/\[ERROR\]/g, kleur.red('[ERROR]'));
    }

    private colorizeDuration(duration: number): string {
        return kleur.yellow(`${duration}ms`);
    }

    info(message: string, metadata?: Record<string, any>) {
        this.logger.info(this.colorizeMessage(message), metadata);
    }

    error(error: Error, metadata?: Record<string, any>) {
        this.logger.error(this.colorizeMessage(error.message), metadata);
    }

    warn(message: string, metadata?: Record<string, any>) {
        this.logger.warn(this.colorizeMessage(message), metadata);
    }

    debug(message: string, metadata?: Record<string, any>) {
        this.logger.debug(this.colorizeMessage(message), metadata);
    }

    perfLog(duration: number, metadata: LogMetadata) {
        const durationText = this.colorizeDuration(duration);
        this.info(`[PERFORMANCE] ${metadata.message} completed in ${durationText}`, {
            ...metadata,
            duration,
        });
    }

    reqLog(request: any, metadata: LogMetadata) {
        this.info(`[HTTP REQUEST]\n` +
                `- Method: ${request.method}\n` +
                `- URL: ${request.url}\n` +
                `- Headers: ${JSON.stringify(request.headers)}\n` +
                `- Data: ${JSON.stringify(request.data)}`);
    }

    resLog(response: any, metadata: LogMetadata) {
        this.info(`[HTTP RESPONSE]\n` +
                `- Status: ${response.status}\n` +
                `- URL: ${response.config.url}\n` +
                `- Headers: ${JSON.stringify(response.headers)}\n` +
                `- Data: ${JSON.stringify(response.data)}`);
    }

    errLog(error: Error, metadata: LogMetadata) {
        this.error(error, {
            ...metadata,
            additionalInfo: {
                name: error.name,
                stack: error.stack,
            },
        });
    }
}

// 전역 싱글턴 관리
let loggerInstance: Logger | null = null;

export function initializeLogger(): Logger {
    if (!loggerInstance) {
        loggerInstance = new Logger();
    }
    return loggerInstance;
}

export function getLogger(): Logger {
    return loggerInstance || initializeLogger();
}
