import { Box } from "@mui/material";
import { useCallback, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import AuthenticatedLayout from "../components/layout/AuthenticatedLayout";
import { AnimatedPage } from "../components/animated";
import ChatSidebar from "../components/chat/ChatSidebar";
import ChatMessageArea from "../components/chat/ChatMessageArea";
import useChatMessages from "../hooks/useChatMessages";
import useWebSocket from "../hooks/useWebSocket";
import type { ChatUserSearch } from "../types/chat";
import { colors, radius, shadow } from "../styles/theme";

function ChatPage() {
    const navigate = useNavigate();
    const { conversationId: conversationIdParam } = useParams();

    const storedUser = localStorage.getItem("user");
    const currentUserId: number | null = useMemo(() => {
        if (!storedUser) return null;
        try {
            return JSON.parse(storedUser).id;
        } catch {
            return null;
        }
    }, [storedUser]);

    const {
        conversations,
        activeConversationId,
        setActiveConversationId,
        messages,
        loadingConversations,
        loadingMessages,
        onlineUsers,
        handleIncomingMessage,
        handleOnlineStatus,
        startConversation,
        searchUsers,
        markAsRead,
    } = useChatMessages(currentUserId);

    const { sendMessage, sendReadReceipt } = useWebSocket({
        userId: currentUserId,
        onMessageReceived: handleIncomingMessage,
        onOnlineStatus: handleOnlineStatus,
    });

    // Sync URL param with active conversation
    useEffect(() => {
        if (conversationIdParam) {
            const id = parseInt(conversationIdParam, 10);
            if (!isNaN(id) && id !== activeConversationId) {
                setActiveConversationId(id);
            }
        }
    }, [conversationIdParam]);

    const handleSelectConversation = useCallback(
        (id: number) => {
            setActiveConversationId(id);
            navigate(`/chat/${id}`, { replace: true });
            markAsRead(id);

            const conv = conversations.find((c) => c.id === id);
            if (conv) {
                sendReadReceipt(id, conv.otherUserId);
            }
        },
        [navigate, setActiveConversationId, markAsRead, conversations, sendReadReceipt]
    );

    const handleStartConversation = useCallback(
        async (user: ChatUserSearch) => {
            const newConvId = await startConversation(user.id);
            if (newConvId) {
                navigate(`/chat/${newConvId}`, { replace: true });
            }
        },
        [startConversation, navigate]
    );

    const handleSendMessage = useCallback(
        (content: string) => {
            const activeConv = conversations.find(
                (c) => c.id === activeConversationId
            );
            if (activeConv) {
                sendMessage(activeConv.otherUserId, content);
            }
        },
        [activeConversationId, conversations, sendMessage]
    );

    const activeConversation =
        conversations.find((c) => c.id === activeConversationId) ?? null;

    const isOtherOnline = activeConversation
        ? onlineUsers.has(activeConversation.otherUserId)
        : false;

    return (
        <AnimatedPage>
            <AuthenticatedLayout>
                <ChatContainer>
                    <ChatSidebar
                        conversations={conversations}
                        activeConversationId={activeConversationId}
                        onSelectConversation={handleSelectConversation}
                        onStartConversation={handleStartConversation}
                        searchUsers={searchUsers}
                        onlineUsers={onlineUsers}
                        loading={loadingConversations}
                    />
                    <ChatMessageArea
                        conversation={activeConversation}
                        messages={messages}
                        currentUserId={currentUserId ?? 0}
                        onSendMessage={handleSendMessage}
                        loading={loadingMessages}
                        isOnline={isOtherOnline}
                    />
                </ChatContainer>
            </AuthenticatedLayout>
        </AnimatedPage>
    );
}

export default ChatPage;

const ChatContainer = styled(Box)`
    display: flex;
    height: calc(100vh - 6.5rem);
    background: ${colors.surface};
    border-radius: ${radius.xl};
    box-shadow: ${shadow.md};
    overflow: hidden;
    border: 1px solid ${colors.border};
`;