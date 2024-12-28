import { ChatMessage } from '../model/ChatMessage';

export interface IChatMessageRepository {
    save(chatMessage: ChatMessage): Promise<void>;
    findByRoomId(roomId: string): Promise<ChatMessage[]>;
    deleteById(messageId: string): Promise<void>;
    updateMessageStatus(roomId: string, messageId: string, status: string): Promise<void>;
}