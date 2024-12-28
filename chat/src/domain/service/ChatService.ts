import { IChatRoomRepository } from '../repository/IChatRoomRepository';
import { IChatMessageRepository } from '../repository/IChatMessageRepository';
import { IChatParticipantRepository } from '../repository/IChatParticipantRepository';
import { ChatMessage } from '../model/ChatMessage';
import { v4 as uuidv4 } from 'uuid';
import { ChatRoom } from '../model/ChatRoom';

export class ChatService {
    constructor(
        private chatRoomRepository: IChatRoomRepository,
        private chatMessageRepository: IChatMessageRepository,
        private chatParticipantRepository: IChatParticipantRepository
    ) {}

    async handleMessage(roomId: string, senderId: string, receiverId: string | undefined, message: string): Promise<void> {
        const chatMessage = new ChatMessage(
            uuidv4(),
            roomId,
            senderId,
            message,
            receiverId ?? null
        );

        await this.chatMessageRepository.save(chatMessage);
    }

    async createChatRoom(name: string, type: 'one_to_one' | 'group'): Promise<void> {
        const chatRoom = { id: uuidv4(), name, type };
        await this.chatRoomRepository.create(chatRoom);
    }

    async deleteChatRoom(roomId: string): Promise<void> {
        await this.chatRoomRepository.deleteById(roomId);
    }

    async getAllChatRooms(memberId: string): Promise<ChatRoom[]> {
        return await this.chatRoomRepository.findAllByMemberId(memberId);
    }

    async getMessagesByRoomId(roomId: string): Promise<any[]> {
        return await this.chatMessageRepository.findByRoomId(roomId);
    }

    async deleteMessageById(messageId: string): Promise<void> {
        await this.chatMessageRepository.deleteById(messageId);
    }

    async getParticipantsByRoomId(roomId: string): Promise<any[]> {
        return await this.chatParticipantRepository.findByRoomId(roomId);
    }

    async getOneToOneRoom(participantA: string, participantB: string): Promise<ChatRoom | null> {
        return await this.chatRoomRepository.findOneToOneRoom(participantA, participantB);
    }

    async createOneToOneRoom(participantA: string, participantB: string): Promise<ChatRoom> {
        return await this.chatRoomRepository.createOneToOneRoom(participantA, participantB);
    }

    async getRecentChatRooms(memberId: string): Promise<ChatRoom[]> {
        return await this.chatRoomRepository.findRecentChatRooms(memberId);
    }

    async updateMessageStatus(roomId: string, messageId: string, status: string): Promise<void> {
        await this.chatMessageRepository.updateMessageStatus(roomId, messageId, status);
    }
}
