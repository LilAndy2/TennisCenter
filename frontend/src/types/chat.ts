export type ChatConversation = {
    id: number;
    otherUserId: number;
    otherUserName: string;
    otherUserUsername: string;
    otherUserProfileImageUrl: string | null;
    lastMessage: string | null;
    lastMessageAt: string | null;
    unreadCount: number;
};

export type ChatMessage = {
    id: number;
    conversationId: number;
    senderId: number;
    senderName: string;
    senderProfileImageUrl: string | null;
    content: string;
    sentAt: string;
    status: "SENT" | "DELIVERED" | "READ";
};

export type ChatUserSearch = {
    id: number;
    fullName: string;
    username: string;
    profileImageUrl: string | null;
    playerLevel: string | null;
};

export type SendMessagePayload = {
    recipientId: number;
    content: string;
};