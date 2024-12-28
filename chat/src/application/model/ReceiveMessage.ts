export class ReceiveMessage {
    roomId: string;
    senderId: string;
    message: string;
    receiverId?: string;
    timestamp: Date;

    constructor(data: { roomId: string; senderId: string; message: string; receiverId?: string; timestamp?: Date }) {
        if (!data.roomId) {
            throw new Error('roomId is required');
        }
        if (!data.senderId) {
            throw new Error('senderId is required');
        }
        if (!data.message) {
            throw new Error('message is required');
        }

        this.roomId = data.roomId;
        this.senderId = data.senderId;
        this.message = data.message;
        this.receiverId = data.receiverId;
        this.timestamp = data.timestamp || new Date();
    }

    toJSON() {
        return {
            roomId: this.roomId,
            senderId: this.senderId,
            message: this.message,
            receiverId: this.receiverId,
            timestamp: this.timestamp.toISOString(),
        };
    }
}
