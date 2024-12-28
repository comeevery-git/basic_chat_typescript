import { FastifyReply, FastifyRequest } from 'fastify';
import { getLogger } from '../Logger';

export const authenticate = async (request: FastifyRequest, reply: FastifyReply, authService: any) => {
    const logger = getLogger();
    const token = request.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        logger.warn('Authorization token missing');
        reply.status(401).send({ error: 'Unauthorized' });
        return false;
    }

    const claims = await authService.decodeToken(token);

    if (!claims || !claims.memberId) {
        logger.warn('Invalid or expired token');
        reply.status(401).send({ error: 'Unauthorized' });
        return false;
    }

    request.memberId = claims.memberId; // 인증된 사용자 ID 추가
    logger.info(`Token Decoded. Get memberId: ${claims.memberId}`);
    return true;
};
