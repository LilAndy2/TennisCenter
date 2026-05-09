import { useState, useEffect, useCallback, useRef } from "react";
import axiosInstance from "../api/axiosInstance";
import type { ChatConversation, ChatMessage, ChatUserSearch } from "../types/chat";

function useChatMessages(currentUserId: number | null) {
    const [conversations, setConversations] = useState<ChatConversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());

    // Keep a ref of activeConversationId so the WebSocket callback always sees the latest value
    const activeConvRef = useRef(activeConversationId);
    useEffect(() => {
        activeConvRef.current = activeConversationId;
    }, [activeConversationId]);

    const currentUserRef = useRef(currentUserId);
    useEffect(() => {
        currentUserRef.current = currentUserId;
    }, [currentUserId]);

    // Load conversations
    const loadConversations = useCallback(async () => {
        if (!currentUserRef.current) return;
        try {
            setLoadingConversations(true);
            const response = await axiosInstance.get<ChatConversation[]>("/player/chat/conversations");
            setConversations(response.data);
        } catch (error) {
            console.error("Failed to load conversations", error);
        } finally {
            setLoadingConversations(false);
        }
    }, []);

    // Load messages for a conversation
    const loadMessages = useCallback(async (conversationId: number) => {
        try {
            setLoadingMessages(true);
            const response = await axiosInstance.get<{ content: ChatMessage[] }>(
                `/player/chat/conversations/${conversationId}/messages`,
                { params: { page: 0, size: 100 } }
            );
            // Messages come sorted DESC, reverse for chronological display
            setMessages(response.data.content.reverse());
        } catch (error) {
            console.error("Failed to load messages", error);
        } finally {
            setLoadingMessages(false);
        }
    }, []);

    // Load online users
    const loadOnlineUsers = useCallback(async () => {
        try {
            const response = await axiosInstance.get<number[]>("/player/chat/online-users");
            setOnlineUsers(new Set(response.data));
        } catch {
            // silent fail
        }
    }, []);

    // Mark conversation as read
    const markAsRead = useCallback(async (conversationId: number) => {
        try {
            await axiosInstance.post(`/player/chat/conversations/${conversationId}/read`);
            setConversations((prev) =>
                prev.map((conv) =>
                    conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
                )
            );
        } catch {
            // silent fail
        }
    }, []);

    // Handle incoming message from WebSocket
    const handleIncomingMessage = useCallback(
        (message: ChatMessage) => {
            const currentActiveId = activeConvRef.current;
            const currentUser = currentUserRef.current;

            // If this message belongs to the active conversation, add it
            if (message.conversationId === currentActiveId) {
                setMessages((prev) => {
                    // Avoid duplicates
                    if (prev.some((m) => m.id === message.id)) return prev;
                    return [...prev, message];
                });
            }

            // Update conversation list
            setConversations((prev) => {
                const existingIndex = prev.findIndex(
                    (c) => c.id === message.conversationId
                );

                if (existingIndex >= 0) {
                    const updated = [...prev];
                    const conv = { ...updated[existingIndex] };
                    conv.lastMessage = message.content;
                    conv.lastMessageAt = message.sentAt;

                    // If not the active conversation and sender is not the current user
                    if (
                        message.conversationId !== currentActiveId &&
                        message.senderId !== currentUser
                    ) {
                        conv.unreadCount = (conv.unreadCount || 0) + 1;
                    }

                    updated.splice(existingIndex, 1);
                    return [conv, ...updated];
                }

                // New conversation — reload to get full data
                loadConversations();
                return prev;
            });
        },
        [loadConversations]
    );

    // Handle online status change
    const handleOnlineStatus = useCallback(
        (data: { userId: number; online: boolean }) => {
            setOnlineUsers((prev) => {
                const next = new Set(prev);
                if (data.online) {
                    next.add(data.userId);
                } else {
                    next.delete(data.userId);
                }
                return next;
            });
        },
        []
    );

    // Start conversation with a user
    const startConversation = useCallback(
        async (otherUserId: number) => {
            try {
                const response = await axiosInstance.post<number>(
                    `/player/chat/conversations/with/${otherUserId}`
                );
                const conversationId = response.data;
                setActiveConversationId(conversationId);
                await loadMessages(conversationId);
                await loadConversations();
                return conversationId;
            } catch (error) {
                console.error("Failed to start conversation", error);
                return null;
            }
        },
        [loadMessages, loadConversations]
    );

    // Search users
    const searchUsers = useCallback(async (query: string): Promise<ChatUserSearch[]> => {
        if (!query.trim()) return [];
        try {
            const response = await axiosInstance.get<ChatUserSearch[]>(
                "/player/chat/users/search",
                { params: { query } }
            );
            return response.data;
        } catch {
            return [];
        }
    }, []);

    // Initial load
    useEffect(() => {
        loadConversations();
        loadOnlineUsers();
    }, [loadConversations, loadOnlineUsers]);

    // Load messages when active conversation changes
    useEffect(() => {
        if (activeConversationId) {
            loadMessages(activeConversationId);
            markAsRead(activeConversationId);
        } else {
            setMessages([]);
        }
    }, [activeConversationId, loadMessages, markAsRead]);

    // Total unread count for badge
    const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

    return {
        conversations,
        activeConversationId,
        setActiveConversationId,
        messages,
        loadingConversations,
        loadingMessages,
        onlineUsers,
        totalUnread,
        handleIncomingMessage,
        handleOnlineStatus,
        startConversation,
        searchUsers,
        markAsRead,
    };
}

export default useChatMessages;