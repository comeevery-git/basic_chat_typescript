import { IChatRoomRepository } from '../../domain/repository/IChatRoomRepository';
import { ChatRoom } from '../../domain/model/ChatRoom';
import { MongoClient, Db, ObjectId } from 'mongodb';
import { getLogger } from '../../common/Logger';

export class ChatRoomRepository implements IChatRoomRepository {
    private db: Db;
    private collectionName = 'chat_rooms';
    private logger = getLogger();

    constructor(mongoClient: MongoClient) {
        this.db = mongoClient.db('chat_database');
    }

    // Create a new chat room
    async create(chatRoom: { name: string; type: string }): Promise<void> {
        await this.db.collection(this.collectionName).insertOne({
            name: chatRoom.name,
            type: chatRoom.type,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    // Retrieve all chat rooms
    async findAllByMemberId(memberId: string): Promise<ChatRoom[]> {
        try {
            // MongoDB에서 memberId가 포함된 채팅방 조회
            const chatRooms = await this.db.collection(this.collectionName).find({
                $or: [
                    { type: 'one_to_one', name: { $regex: `^${memberId}_|_${memberId}$` } },
                    { type: 'group', participants: { $in: [memberId] } }
                ]
            }).toArray();
    
            // 결과를 ChatRoom 객체로 변환하여 반환
            return chatRooms.map((doc) =>
                ChatRoom.fromMongoDocument({
                    _id: doc._id,
                    name: doc.name,
                    type: doc.type,
                    status: doc.status,
                    createdAt: doc.createdAt,
                    updatedAt: doc.updatedAt,
                })
            );
        } catch (error) {
            console.error('Error in findAllByMemberId:', error);
            throw new Error('Failed to fetch chat rooms for member');
        }
    }
    

    // Delete a chat room by ID
    async deleteById(roomId: string): Promise<void> {
        await this.db.collection(this.collectionName).deleteOne({ _id: new ObjectId(roomId) });
    }

    // Find an active one-to-one room between two participants
    async findOneToOneRoom(participantA: string, participantB: string): Promise<ChatRoom | null> {
        const result = await this.db.collection(this.collectionName).findOne({
            type: 'one_to_one',
            status: 'active',
            name: `${participantA}_${participantB}`,
        });

        return result
            ? ChatRoom.fromMongoDocument({
                  _id: result._id,
                  name: result.name,
                  type: result.type,
                  status: result.status,
                  createdAt: result.createdAt,
                  updatedAt: result.updatedAt,
              })
            : null;
    }

    // Create a one-to-one chat room
    async createOneToOneRoom(participantA: string, participantB: string): Promise<ChatRoom> {
        const roomName = `${participantA}_${participantB}`;
        const document = {
            name: roomName,
            type: 'one_to_one',
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await this.db.collection(this.collectionName).insertOne(document);
        return new ChatRoom(
            result.insertedId.toHexString(),
            document.name,
            document.type as 'one_to_one' | 'group',
            document.status as 'active' | 'inactive',
            document.createdAt,
            document.updatedAt
        );
    }

    // 최근 채팅방 조회
    async findRecentChatRooms(memberId: string): Promise<ChatRoom[]> {
        const chatRooms = await this.db.collection(this.collectionName).find({
            type: 'one_to_one',
            status: 'active',
            $or: [
                { name: new RegExp(`^${memberId}_`) },  // memberId로 시작하는 경우
                { name: new RegExp(`_${memberId}$`) }   // memberId로 끝나는 경우
            ]
        }).toArray();
    
        return chatRooms.map((doc) =>
            ChatRoom.fromMongoDocument({
                _id: doc._id,
                name: doc.name,
                type: doc.type,
                status: doc.status,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt,
            })
        );
    }
}
