import { ObjectId } from 'mongodb';

export class ChatRoom {
    roomId: string;
    name: string;
    type: "one_to_one" | "group";
    status: "active" | "inactive";
    createdAt: Date;
    updatedAt: Date;

    constructor(roomId: string, name: string, type: 'one_to_one' | 'group', status: 'active' | 'inactive', createdAt: Date, updatedAt: Date) {
        this.roomId = roomId;
        this.name = name;
        this.type = type;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    static fromMongoDocument(doc: { _id: ObjectId; name: string; type: 'one_to_one' | 'group'; status: 'active' | 'inactive'; createdAt: Date; updatedAt: Date }): ChatRoom {
        return new ChatRoom(
            doc._id.toHexString(),
            doc.name,
            doc.type,
            doc.status,
            doc.createdAt,
            doc.updatedAt
        );
    }

    toMongoDocument(): { _id?: ObjectId; name: string; type: 'one_to_one' | 'group'; status: 'active' | 'inactive'; createdAt: Date; updatedAt: Date } {
        return {
            _id: this.roomId ? new ObjectId(this.roomId) : undefined,
            name: this.name,
            type: this.type,
            status: this.status,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }

    toJSON(): { roomId: string; name: string; type: 'one_to_one' | 'group'; status: 'active' | 'inactive'; createdAt: Date; updatedAt: Date } {
        return {
            roomId: this.roomId,
            name: this.name,
            type: this.type,
            status: this.status,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
    
}
