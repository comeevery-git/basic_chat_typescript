import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class ChatParticipant {
    id: string;
    chatRoomId: string;
    memberId: string;
    role: string;
    joinedAt: Date;

    constructor(id: string, chatRoomId: string, memberId: string, role: string, joinedAt: Date) {
        this.id = id;
        this.chatRoomId = chatRoomId;
        this.memberId = memberId;
        this.role = role;
        this.joinedAt = joinedAt;
    }
} 