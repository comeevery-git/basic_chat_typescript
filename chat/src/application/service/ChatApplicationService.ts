import { ChatService } from '../../domain/service/ChatService';
import { getLogger } from '../../common/Logger';
import { ChatRoom } from '../../domain/model/ChatRoom';

export class ChatApplicationService {
    private readonly logger = getLogger();
    private chatService: ChatService;

    constructor(
        chatService: ChatService
    ) {
        this.chatService = chatService;
    }

    async handleMessage(roomId: string, senderId: string, receiverId: string | undefined, message: string): Promise<void> {
        this.logger.info(`### Message received: ${message} \n
            from ${senderId} to ${receiverId}`);
        await this.chatService.handleMessage(roomId, senderId, receiverId, message);
    }

    async createChatRoom(name: string, type: 'one_to_one' | 'group'): Promise<void> {
        this.logger.info(`### Chat room created: ${name} \n
            type: ${type}`);
        await this.chatService.createChatRoom(name, type);
    }

    async deleteChatRoom(roomId: string): Promise<void> {
        this.logger.info(`### Chat room deleted: ${roomId}`);
        await this.chatService.deleteChatRoom(roomId);
    }

    async getAllChatRooms(memberId: string): Promise<ChatRoom[]> {
        this.logger.info(`### Getting all chat rooms`);
        return await this.chatService.getAllChatRooms(memberId);
    }

    // 채팅방 메시지 전체 조회
    async getMessagesByRoomId(roomId: string): Promise<any[]> {
        this.logger.info(`### Getting messages by room id: ${roomId}`);
        return await this.chatService.getMessagesByRoomId(roomId);
    }

    async deleteMessageById(messageId: string): Promise<void> {
        this.logger.info(`### Deleting message by id: ${messageId}`);
        await this.chatService.deleteMessageById(messageId);
    }

    async getParticipantsByRoomId(roomId: string): Promise<any[]> {
        this.logger.info(`### Getting participants by room id: ${roomId}`);
        return await this.chatService.getParticipantsByRoomId(roomId);
    }

    // 1:1 채팅방 조회
    async getOneToOneRoom(participantA: string, participantB: string): Promise<ChatRoom | null> {
        this.logger.info(`### Getting one-to-one chat room: ${participantA} - ${participantB}`);
        return await this.chatService.getOneToOneRoom(participantA, participantB);
    }

    // 1:1 채팅방 생성
    async createOneToOneRoom(participantA: string, participantB: string): Promise<ChatRoom> {
        this.logger.info(`### Creating one-to-one chat room: ${participantA} - ${participantB}`);
        return await this.chatService.createOneToOneRoom(participantA, participantB);
    }

    // 최근 채팅방 조회
    async getRecentChatRooms(memberId: string): Promise<ChatRoom[]> {
        this.logger.info(`### Getting recent chat rooms for member: ${memberId}`);
        return await this.chatService.getRecentChatRooms(memberId);
    }

    // 메시지 상태 업데이트 (읽음)
    async updateMessageStatus(roomId: string, messageId: string, status: string): Promise<void> {
        this.logger.info(`### Updating message status: ${messageId}, roomId: ${roomId}, status: ${status}`);
        await this.chatService.updateMessageStatus(roomId, messageId, status);
    }
}
