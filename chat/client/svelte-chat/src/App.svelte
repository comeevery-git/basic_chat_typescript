<script>
    import { onMount } from 'svelte';
    import dotenv from 'dotenv';

    dotenv.config();

    let jwtToken = '';
    let memberInfo = {};
    let memberId = '';
    let targetMemberId = ''; // 대화 상대방 ID 저장
    let selectedRoomId = '';
    let messages = [];
    let messageInput = '';

    const apiUrl = "http://localhost:8091/v1";

    // 랜덤 ID 생성 함수 (6자리 숫자)
    function generateRandomMemberId() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    onMount(async () => {
        jwtToken = localStorage.getItem('jwtToken') || '';
        if (jwtToken) {
            await fetchMemberInfo();
        }
        // 랜덤 ID 생성 및 저장
        if (!memberId) {
            memberId = generateRandomMemberId();
            console.log('Generated Member ID:', memberId);
        }
        // 대화 상대방 ID도 랜덤 생성
        targetMemberId = generateRandomMemberId();
    });

    function setAuthorizationHeader(headers) {
        headers['Authorization'] = `Bearer ${jwtToken}`;
        return headers;
    }

    function saveToken() {
        if (!jwtToken.trim()) {
            alert('Token cannot be empty');
            return;
        }
        localStorage.setItem('jwtToken', jwtToken);
        alert('Token saved successfully!');
        fetchMemberInfo();
    }

    async function fetchMemberInfo() {
        try {
            const response = await fetch(`${apiUrl}/members/me`, {
                method: 'GET',
                headers: setAuthorizationHeader({})
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch member information. Status: ${response.status}`);
            }

            const data = await response.json();
            memberInfo = data;
            memberId = memberInfo.id;

            console.log('Member Info:', memberInfo); // 디버깅용 로그
            console.log('Member ID:', memberInfo.id); // 디버깅용 로그
        } catch (error) {
            console.error('Error fetching member information:', error);
            alert('Failed to fetch member information. Please check your token.');
        }
    }

    async function fetchMessages() {
        if (!selectedRoomId) return;

        try {
            const response = await fetch(`${apiUrl}/chats/rooms/${selectedRoomId}/messages`, {
                method: 'GET',
                headers: setAuthorizationHeader({})
            });
            const data = await response.json();
            if (Array.isArray(data)) {
                messages = data.map(message => ({
                    senderId: message.senderId,
                    text: message.message,
                    timestamp: message.timestamp
                }));
            } else {
                console.error('Expected an array of messages');
                messages = [];
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            messages = [];
        }
    }

    async function sendMessage() {
        if (!messageInput.trim() || !selectedRoomId) return;

        try {
            const response = await fetch(`${apiUrl}/chats/rooms/${selectedRoomId}/messages`, {
                method: 'POST',
                headers: setAuthorizationHeader({
                    'Content-Type': 'application/json'
                }),
                body: JSON.stringify({
                    message: messageInput,
                    senderId: memberId,
                    receiverId: targetMemberId
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            messageInput = '';
            await fetchMessages();
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message');
        }
    }

    let recentRooms = []; // 최근 대화방 목록

    // 최근 대화방 목록 조회
    async function fetchRecentRooms() {
        try {
            const response = await fetch(`${apiUrl}/chats/rooms/recent`, {
                method: 'GET',
                headers: setAuthorizationHeader({})
            });

            if (!response.ok) {
                throw new Error('Failed to fetch recent rooms');
            }

            const data = await response.json();
            recentRooms = data;
            console.log('Recent Rooms:', recentRooms);
        } catch (error) {
            console.error('Error fetching recent rooms:', error);
            recentRooms = [];
        }
    }

    // 채팅방 선택 처리
    async function selectRoom(roomId) {
        selectedRoomId = roomId;
        await fetchMessages();
    }

    // onMount 수정
    onMount(async () => {
        jwtToken = localStorage.getItem('jwtToken') || '';
        if (jwtToken) {
            await fetchMemberInfo();
            await fetchRecentRooms(); // 최근 대화방 목록 조회 추가
        }
        if (!memberId) {
            memberId = generateRandomMemberId();
        }
        targetMemberId = generateRandomMemberId();
    });

    // 채팅방 생성 후 목록 새로고침
    async function createOneToOneRoom() {
        if (!memberId || !targetMemberId) {
            alert('Both member IDs must be valid.');
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/chats/rooms/one-to-one`, {
                method: 'POST',
                headers: setAuthorizationHeader({
                    'Content-Type': 'application/json'
                }),
                body: JSON.stringify({
                    participantA: memberId,
                    participantB: targetMemberId
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create one-to-one chat room');
            }

            const room = await response.json();
            selectedRoomId = room.roomId;
            fetchMessages();
        } catch (error) {
            console.error('Error creating one-to-one chat room:', error);
            alert('Failed to create chat room');
        }
    }
</script>

<main>
<h1>Chat Application</h1>
<div>
    <input type="text" bind:value={jwtToken} placeholder="Enter JWT Token">
    <button on:click={saveToken}>Save Token</button>
</div>

{#if memberId}
    <div class="chat-container">
        <!-- 왼쪽: 채팅방 목록 -->
        <div class="chat-rooms">
            <h2>Your Member ID: {memberId}</h2>
            
            <!-- 새 채팅 시작 섹션 -->
            <div class="new-chat">
                <button on:click={createOneToOneRoom}>
                    Start Chat with Member {targetMemberId}
                </button>
            </div>

            <!-- 최근 대화방 목록 -->
            <div class="recent-rooms">
                <h3>Recent Chats</h3>
                {#each recentRooms as room}
                    <div 
                        class="room-item" 
                        class:active={selectedRoomId === room.roomId}
                        on:click={() => selectRoom(room.roomId)}
                    >
                        <div>Room: {room.roomId}</div>
                        <div class="room-info">
                            <span>Type: {room.type}</span>
                            <span>Created: {new Date(room.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                {/each}
            </div>
        </div>

        <!-- 오른쪽: 채팅 내용 -->
        {#if selectedRoomId}
            <div class="chat-messages">
                <h2>Messages in Chat Room {selectedRoomId}</h2>
                <div id="messages" class="messages-container">
                    {#each messages as message}
                        <div class="message" class:own-message={message.senderId === memberId}>
                            <strong>{message.senderId}</strong>: {message.text}
                            <span class="timestamp">
                                ({new Date(message.timestamp).toLocaleTimeString()})
                            </span>
                        </div>
                    {/each}
                </div>
                <form on:submit|preventDefault={sendMessage} class="message-form">
                    <input 
                        type="text" 
                        bind:value={messageInput} 
                        placeholder="Type a message..." 
                        required
                    >
                    <button type="submit">Send</button>
                </form>
            </div>
        {/if}
    </div>
{/if}
</main>

<style>
.chat-container {
    display: flex;
    gap: 20px;
    padding: 20px;
}

.chat-rooms {
    flex: 1;
    max-width: 300px;
}

.chat-messages {
    flex: 2;
}

.room-item {
    padding: 10px;
    border: 1px solid #ddd;
    margin: 5px 0;
    cursor: pointer;
}

.room-item.active {
    background-color: #e6e6e6;
}

.messages-container {
    height: 400px;
    overflow-y: auto;
    border: 1px solid #ddd;
    padding: 10px;
    margin-bottom: 10px;
}

.message {
    margin: 5px 0;
    padding: 5px;
}

.own-message {
    background-color: #e3f2fd;
    text-align: right;
}

.timestamp {
    font-size: 0.8em;
    color: gray;
}

.message-form {
    display: flex;
    gap: 10px;
}

.message-form input {
    flex: 1;
}
</style>
