import { IChatMessageRepository } from '../../domain/repository/IChatMessageRepository';
import { ChatMessage } from '../../domain/model/ChatMessage';
import { MongoClient, Db, ObjectId } from 'mongodb';

export class ChatMessageRepository implements IChatMessageRepository {
    private db: Db;
    private collectionName = 'chat_messages';

    constructor(mongoClient: MongoClient) {
        this.db = mongoClient.db('chat_database');
    }

    async save(chatMessage: ChatMessage): Promise<void> {
        await this.db.collection(this.collectionName).insertOne({
            ...chatMessage,
            timestamp: new Date()
        });
    }

    async findByRoomId(roomId: string): Promise<ChatMessage[]> {
        const messages = await this.db.collection(this.collectionName).find({ chatRoomId: roomId }).toArray();
        return messages.map(msg => new ChatMessage(
            msg._id.toString(),
            msg.chatRoomId,
            msg.senderId,
            msg.message,
            msg.receiverId
        ));
    }

    async deleteById(messageId: string): Promise<void> {
        await this.db.collection(this.collectionName).deleteOne({ _id: new ObjectId(messageId) });
    }


    async updateMessageStatus(roomId: string, messageId: string, status: string): Promise<void> {
        await this.db.collection(this.collectionName).updateOne(
            { _id: new ObjectId(roomId) }, 
            { $set: { lastMessage: messageId, lastMessageStatus: status } }
        );
    }
}