import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest } from 'fastify';
import { getLogger } from '../common/Logger';
import { SendMessage } from '../application/model/SendMessage';
import { ReceiveMessage } from '../application/model/ReceiveMessage';
import { authenticate } from '../common/middleware/Authentication';
import { MemberInformation } from '../application/model/MemberInformation';

async function routes(fastify: FastifyInstance, options: FastifyPluginOptions) {
    const logger = getLogger();
    let clients = new Map<string, FastifyReply[]>();
    const authService = fastify.authApplicationService;
    const memberService = fastify.memberApplicationService;
    const chatService = fastify.chatApplicationService;
    const prefix = '/v1'; // 전역 변수로 prefix 설정

    // 인증 미들웨어
    fastify.addHook('onRequest', async (request: FastifyRequest, reply) => {
        if (
            request.url === '/' ||
            request.url.startsWith('/docs') ||
            request.url.startsWith('/swagger') ||
            request.url.startsWith('/api-docs')
        ) {
            return;
        }

        const isAuthenticated = await authenticate(request, reply, authService);
        if (!isAuthenticated) {
            return;
        }
        logger.info(`### Authenticated memberId: ${request.memberId}`);
    });
    
    // 헬스 체크
    fastify.route({
        schema: {
            description: 'Health check',
            tags: ['health'],
        },
        method: 'GET',
        url: '/',
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const start = Date.now();
            try {
                logger.perfLog(Date.now() - start, { message: 'Health check completed', routeName: '/' });
                return { status: 'OK' };
            } catch (error) {
                logger.errLog(error as Error, { message: 'Health check failed', routeName: '/' });
                throw error;
            }
        },
    });

    // 회원 정보 조회
    fastify.route({
        schema: {
            description: 'Get Member Info',
            tags: ['member'],
        },
        method: 'GET',
        url: `${prefix}/members/me`,
        handler: async (request: FastifyRequest<{ Params: { memberId: string } }>, reply: FastifyReply) => {
            const start = Date.now();
            try {
                const memberId = request.memberId;
                logger.info(`회원 정보 조회 요청: ${memberId}`);
                // TODO 임시 데이터 세팅
                if (memberId == '1234567890') {
                    const member: MemberInformation = {
                        id: 1,
                        loginId: 'user123',
                        email: 'user@example.com',
                        nickname: 'User',
                        photo: 'photo_url',
                        contents: 'Some contents',
                        roleTitle: 'Admin'
                    };
                    return member;
                }
                const result: MemberInformation = await memberService.handleGetMemberInfo(memberId!);

                logger.perfLog(Date.now() - start, { message: 'Get Member Info completed', routeName: '/members/:memberId' });
                return result;
            } catch (error) {
                logger.errLog(error as Error, { message: 'Get Member Info failed', routeName: '/members/:memberId' });
                throw error;
            }
        },
    });

    // 채팅방 이벤트 구독
    fastify.get(`${prefix}/chats/rooms/:roomId/events`, {
        schema: {
            description: 'Subscribe to chat room events',
            tags: ['events'],
            params: {
                type: 'object',
                properties: {
                    roomId: { type: 'string' },
                },
            },
        },
        handler: (request: FastifyRequest, reply: FastifyReply) => {
            const { roomId } = request.params as { roomId: string };
            reply.raw.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            });
    
            if (!clients.has(roomId)) {
                clients.set(roomId, []);
            }
            clients.get(roomId)?.push(reply);
    
            // 메시지 전송 이벤트를 처리
            request.raw.on('message', (rawMessage: string) => {
                try {
                    const parsedMessage = JSON.parse(rawMessage);
                    const receiveMessage = new ReceiveMessage(parsedMessage);

                    // 메시지 데이터를 모든 클라이언트에 브로드캐스트
                    const roomClients = clients.get(roomId);
                    if (roomClients) {
                        const messageData = JSON.stringify(receiveMessage.toJSON());
                        roomClients.forEach((client) => client.raw.write(`data: ${messageData}\n\n`));
                    }
                } catch (error) {
                    logger.errLog(error as Error, { message: 'Failed to process received message' });
                }
            });
    
            // 클라이언트 연결 해제 처리
            request.raw.on('close', () => {
                const roomClients = clients.get(roomId);
                if (roomClients) {
                    const index = roomClients.indexOf(reply);
                    if (index !== -1) {
                        roomClients.splice(index, 1);
                    }
                }
            });
        },
    });
    

    // 채팅방 메시지 전송
    fastify.post(`${prefix}/chats/rooms/:roomId/messages`, {
        schema: {
            description: 'Send a message to a chat room',
            tags: ['messages'],
            params: {
                type: 'object',
                properties: {
                    roomId: { type: 'string' }
                }
            },
            body: {
                type: 'object',
                required: ['message', 'senderId'],
                properties: {
                    message: { type: 'string' },
                    senderId: { type: 'string' },
                    receiverId: { type: 'string' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        status: { type: 'string' }
                    }
                }
            }
        },
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const { roomId } = request.params as { roomId: string };
            logger.info(`### Sending message to room: ${roomId}`);
            const { message, senderId, receiverId } = request.body as {
                message: string;
                senderId: string;
                receiverId?: string;
            };
            logger.info(`### Sending message to room: ${roomId}`);
            try {
                const sendMessage = new SendMessage({
                    roomId,
                    senderId,
                    message,
                    receiverId,
                });
        
                // 메시지 처리
                await chatService.handleMessage(
                    sendMessage.roomId,
                    sendMessage.senderId,
                    sendMessage.receiverId,
                    sendMessage.message
                );
        
                const roomClients = clients.get(sendMessage.roomId);
                if (roomClients) {
                    const messageData = JSON.stringify(sendMessage.toJSON());
                    roomClients.forEach((client) => client.raw.write(`data: ${messageData}\n\n`));
                }
        
                reply.send({ status: 'Message sent' });
            } catch (error) {
                logger.errLog(error as Error, {
                    message: 'Failed to send message',
                    routeName: '/chats/rooms/:roomId/messages',
                });
        
                reply.status(500).send({ error: 'Internal Server Error' });
            }
        },        
    });

    // 특정 채팅방의 메시지 조회
    fastify.get(`${prefix}/chats/rooms/:roomId/messages`, {
        schema: {
            description: 'Get messages from a chat room',
            tags: ['messages'],
            params: {
                type: 'object',
                properties: {
                    roomId: { type: 'string' }
                }
            },
            response: {
                200: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            message: { type: 'string' },
                            senderId: { type: 'string' },
                            receiverId: { type: 'string' },
                            timestamp: { type: 'string' }
                        }
                    }
                }
            }
        }
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { roomId } = request.params as { roomId: string };
        try {
            const messages = await chatService.getMessagesByRoomId(roomId);
            reply.send(messages);
        } catch (error) {
            logger.errLog(error as Error, {
                message: 'Failed to get messages by room ID',
                routeName: 'root'
            });
            reply.status(500).send({ error: 'Internal Server Error' });
        }
    });

    // 1:1 채팅방 생성 보장
    fastify.post(`${prefix}/chats/rooms/one-to-one`, {
        schema: {
            description: 'Ensure a one-to-one chat room exists (create if not exists)',
            tags: ['rooms'],
            body: {
                type: 'object',
                properties: {
                    participantA: { type: 'string' },
                    participantB: { type: 'string' }
                },
                required: ['participantA', 'participantB']
            }
        },
        handler: async (request: FastifyRequest<{ Body: { participantA: string; participantB: string } }>, reply: FastifyReply) => {
            const { participantA, participantB } = request.body;
    
            try {
                // Check if room already exists
                let room = await chatService.getOneToOneRoom(participantA, participantB);
    
                // If room doesn't exist, create one
                if (!room) {
                    room = await chatService.createOneToOneRoom(participantA, participantB);
                }
    
                reply.status(200).send(room);
            } catch (error) {
                logger.errLog(error as Error, { message: 'Failed to ensure one-to-one chat room' });
                reply.status(500).send({ error: 'Internal Server Error' });
            }
        }
    });
    
    // 최근 채팅방 조회
    fastify.get(`${prefix}/chats/rooms/recent`, {
        schema: {
            description: 'Retrieve recent chat rooms for the authenticated user',
            tags: ['rooms'],
            response: {
                200: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            roomId: { type: 'string' },
                            name: { type: 'string' },
                            type: { type: 'string' },
                            updatedAt: { type: 'string', format: 'date-time' }
                        }
                    }
                }
            }
        },
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const memberId = request.memberId;
                if (!memberId) {
                    reply.status(400).send({ error: 'Invalid request data' });
                    return;
                }

                const recentRooms = await chatService.getRecentChatRooms(memberId);
                reply.send(recentRooms);
            } catch (error) {
                logger.errLog(error as Error, { message: 'Failed to retrieve recent chat rooms' });
                reply.status(500).send({ error: 'Internal Server Error' });
            }
        }
    });
    
    // 메시지 상태 업데이트 (읽음)
    fastify.patch(`${prefix}/chats/rooms/:roomId/messages/:messageId/status`, {
        schema: {
            description: 'Update the status of a message',
            tags: ['messages'],
            params: {
                type: 'object',
                properties: {
                    roomId: { type: 'string' },
                    messageId: { type: 'string' }
                },
                required: ['roomId', 'messageId']
            },
            body: {
                type: 'object',
                properties: {
                    status: { type: 'string', enum: ['sent', 'delivered', 'read'] }
                },
                required: ['status']
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        messageId: { type: 'string' },
                        status: { type: 'string' }
                    }
                }
            }
        },
        handler: async (request: FastifyRequest<{ Params: { roomId: string; messageId: string }; Body: { status: string } }>, reply: FastifyReply) => {
            const { roomId, messageId } = request.params;
            const { status } = request.body;
    
            try {
                const updatedMessage = await chatService.updateMessageStatus(roomId, messageId, status);
                reply.status(200).send(updatedMessage);
            } catch (error) {
                logger.errLog(error as Error, { message: 'Failed to update message status' });
                reply.status(500).send({ error: 'Internal Server Error' });
            }
        }
    });
    

}

export default fp(routes, {
    name: 'chat-routes'
});
