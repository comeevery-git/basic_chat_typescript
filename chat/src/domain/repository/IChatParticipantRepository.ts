import { ChatParticipant } from '../model/ChatParticipant';

export interface IChatParticipantRepository {
    findByRoomId(roomId: string): Promise<ChatParticipant[]>;
}