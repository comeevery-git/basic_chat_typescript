import { ChatRoom } from '../model/ChatRoom';

export interface IChatRoomRepository {
    create(chatRoom: { name: string; type: string }): Promise<void>
    deleteById(roomId: string): Promise<void>;
    findAllByMemberId(memberId: string): Promise<ChatRoom[]>
    findOneToOneRoom(participantA: string, participantB: string): Promise<ChatRoom | null>
    createOneToOneRoom(participantA: string, participantB: string): Promise<ChatRoom>
    findRecentChatRooms(memberId: string): Promise<ChatRoom[]>
}