import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { MongoClient } from 'mongodb';
import { ChatApplicationService } from './application/service/ChatApplicationService';
import { ChatService } from './domain/service/ChatService';
import { ChatRoomRepository } from './infrastructure/persistence/ChatRoomRepository';
import { ChatMessageRepository } from './infrastructure/persistence/ChatMessageRepository';
import { ChatParticipantRepository } from './infrastructure/persistence/ChatParticipantRepository';
import config from './common/Config';
import { MemberApplicationService } from './application/service/MemberApplicationService';
import { AuthApplicationService } from './application/service/AuthApplicationService';
import { AuthAPIClient } from './infrastructure/gateway/AuthAPIClient';
import { AppAPIClient } from './infrastructure/gateway/AppAPIClient';
import { getLogger } from './common/Logger';
import { JwtTokenProvider } from './common/JwtTokenProvider';

let mongoClient: MongoClient;

async function chatPlugin(fastify: FastifyInstance, options: FastifyPluginOptions) {
    const logger = getLogger();

    try {    
        if (!mongoClient) {
            const mongoUri = config.MONGODB_URI;
            if (!mongoUri) {
                throw new Error('MONGODB_URI environment variable is not set');
            }

            mongoClient = new MongoClient(mongoUri);
            await mongoClient.connect();
            logger.info('Connected to MongoDB');
        }

        await mongoClient.db().command({ ping: 1 });

        fastify.addHook('onClose', async () => {
            if (mongoClient) {
                await mongoClient.close();
            }
        });

        const chatRoomRepository = new ChatRoomRepository(mongoClient);
        const chatMessageRepository = new ChatMessageRepository(mongoClient);
        const chatParticipantRepository = new ChatParticipantRepository(mongoClient);

        const chatService = new ChatService(
            chatRoomRepository,
            chatMessageRepository,
            chatParticipantRepository
        );

        const jwtTokenProvider = new JwtTokenProvider();
        const authClient = new AuthAPIClient(config.AUTH_API_URL!);
        const appClient = new AppAPIClient(config.APP_API_URL!);
        const chatApplicationService = new ChatApplicationService(chatService);
        const memberApplicationService = new MemberApplicationService(appClient);
        const authApplicationService = new AuthApplicationService(authClient, jwtTokenProvider);

        fastify.decorate('chatApplicationService', chatApplicationService);
        fastify.decorate('memberApplicationService', memberApplicationService);
        fastify.decorate('authApplicationService', authApplicationService);
        
    } catch (error) {
        logger.errLog(error as Error, { message: 'Chat Plugin Initialization' });
        throw error;
    }
}

declare module 'fastify' {
    interface FastifyRequest {
        memberId?: string;
    }
    interface FastifyInstance {
        chatApplicationService: ChatApplicationService;
        memberApplicationService: MemberApplicationService;
        authApplicationService: AuthApplicationService;
    }
}

export default fp(chatPlugin, {
    name: 'chat-plugin',
    fastify: '5.x',
    dependencies: []
});
