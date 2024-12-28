import { IChatParticipantRepository } from '../../domain/repository/IChatParticipantRepository';
import { ChatParticipant } from '../../domain/model/ChatParticipant';
import { MongoClient, Db } from 'mongodb';

export class ChatParticipantRepository implements IChatParticipantRepository {
    private db: Db;
    private collectionName = 'chat_participants';

    constructor(mongoClient: MongoClient) {
        this.db = mongoClient.db('chat_database');
    }

    async findByRoomId(roomId: string): Promise<ChatParticipant[]> {
        const participants = await this.db.collection(this.collectionName).find({ chatRoomId: roomId }).toArray();
        return participants.map(participant => new ChatParticipant(
            participant._id.toString(),
            participant.chatRoomId,
            participant.memberId,
            participant.role,
            new Date(participant.joinedAt)
        ));
    }
}
