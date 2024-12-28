import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import chatPlugin from './Plugin';
import routes from './interface/Router';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { initializeLogger, getLogger } from './common/Logger';
import config from './common/Config';

const PORT = config.PORT || 8091;

async function startServer() {
    const app = Fastify();

    initializeLogger();

    const logger = getLogger();
    logger.info('Starting server setup...');

    // Swagger 설정
    await app.register(swagger, {
        openapi: {
            info: {
                title: 'Chat API',
                description: 'API documentation for the chat application',
                version: '1.0.0',
            },
            servers: [
                {
                    url: `http://127.0.0.1:${PORT}`,
                },
            ],
            components: {
                securitySchemes: {
                    Authorization: {
                        type: 'apiKey',
                        name: 'Authorization',
                        in: 'header',
                        description: 'Member JWT token for authentication',
                    },
                },
            },
            security: [
                {
                    Authorization: [],
                },
            ],
            tags: [
                { name: 'health', description: 'Health check endpoints' },
                { name: 'messages', description: 'Message related endpoints' },
                { name: 'rooms', description: 'Chat room related endpoints' },
                { name: 'events', description: 'Event related endpoints' },
                { name: 'participants', description: 'Participant related endpoints' },
            ],
        },
        hideUntagged: false,
    });

    await app.register(swaggerUi, {
        routePrefix: '/docs',
        uiConfig: {
            docExpansion: 'list',
            deepLinking: false,
            tryItOutEnabled: true,
        },
        staticCSP: false,
    });

    // CORS 설정
    await app.register(fastifyCors, {
        origin: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization'],
    });

    // 플러그인 등록
    await app.register(chatPlugin);
    await app.register(routes);

    try {
        logger.info('Attempting to start the server...');
        await app.listen({ port: Number(PORT), host: '0.0.0.0' });

        console.log(app.printRoutes());
    } catch (err) {
        logger.errLog(err as Error, { message: 'Failed to start server' });
        process.exit(1);
    }
}

// 서버 실행
startServer().catch((err) => {
    const logger = getLogger();
    logger.errLog(err as Error, { message: 'Fatal error during startup' });
    process.exit(1);
});
