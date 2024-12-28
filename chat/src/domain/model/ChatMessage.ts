export class ChatMessage {
    id: string;
    chatRoomId: string;
    senderId: string;
    receiverId: string | null;
    message: string;
    messageType: 'text' | 'image' | 'video';
    status: 'sent' | 'delivered' | 'read';
    timestamp: Date;

    constructor(id: string, chatRoomId: string, senderId: string, message: string, receiverId: string | null = null) {
        this.id = id;
        this.chatRoomId = chatRoomId;
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.message = message;
        this.messageType = 'text';
        this.status = 'sent';
        this.timestamp = new Date();
    }
}