import { Add } from "@mui/icons-material";
import { Avatar, Box, Typography } from "@mui/material";
import { useState } from "react";
import styled from "styled-components";
import { resolveImageUrl } from "../../utils/resolveImageUrl";
import type { ChatConversation, ChatUserSearch as ChatUserSearchType } from "../../types/chat";
import ChatUserSearch from "./ChatUserSearch";
import {
    colors,
    spacing,
    fontSize,
    fontWeight,
    radius,
    transition,
} from "../../styles/theme";

type ChatSidebarProps = {
    conversations: ChatConversation[];
    activeConversationId: number | null;
    onSelectConversation: (id: number) => void;
    onStartConversation: (user: ChatUserSearchType) => void;
    searchUsers: (query: string) => Promise<ChatUserSearchType[]>;
    onlineUsers: Set<number>;
    loading: boolean;
};

function ChatSidebar({
                         conversations,
                         activeConversationId,
                         onSelectConversation,
                         onStartConversation,
                         searchUsers,
                         onlineUsers,
                         loading,
                     }: ChatSidebarProps) {
    const [showSearch, setShowSearch] = useState(false);

    const handleSelectUser = (user: ChatUserSearchType) => {
        onStartConversation(user);
        setShowSearch(false);
    };

    const formatTime = (dateStr: string | null) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.floor(
            (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 0) {
            return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        } else if (diffDays === 1) {
            return "Yesterday";
        } else if (diffDays < 7) {
            return date.toLocaleDateString([], { weekday: "short" });
        }
        return date.toLocaleDateString([], { month: "short", day: "numeric" });
    };

    return (
        <SidebarWrapper>
            <SidebarHeader>
                <SidebarTitle>Messages</SidebarTitle>
                <NewChatButton onClick={() => setShowSearch(true)}>
                    <Add sx={{ fontSize: 20 }} />
                </NewChatButton>
            </SidebarHeader>

            {showSearch && (
                <ChatUserSearch
                    onSelectUser={handleSelectUser}
                    searchUsers={searchUsers}
                    onClose={() => setShowSearch(false)}
                />
            )}

            <ConversationList>
                {loading ? (
                    <EmptyState>Loading conversations...</EmptyState>
                ) : conversations.length === 0 ? (
                    <EmptyState>
                        No conversations yet.
                        <br />
                        Start one by clicking the + button!
                    </EmptyState>
                ) : (
                    conversations.map((conv) => (
                        <ConversationItem
                            key={conv.id}
                            $active={conv.id === activeConversationId}
                            onClick={() => onSelectConversation(conv.id)}
                        >
                            <AvatarWrapper>
                                <StyledAvatar
                                    src={resolveImageUrl(conv.otherUserProfileImageUrl)}
                                    alt={conv.otherUserName}
                                >
                                    {conv.otherUserName.charAt(0)}
                                </StyledAvatar>
                                {onlineUsers.has(conv.otherUserId) && <OnlineDot />}
                            </AvatarWrapper>

                            <ConvInfo>
                                <ConvTopRow>
                                    <ConvName $unread={conv.unreadCount > 0}>
                                        {conv.otherUserName}
                                    </ConvName>
                                    <ConvTime>{formatTime(conv.lastMessageAt)}</ConvTime>
                                </ConvTopRow>
                                <ConvBottomRow>
                                    <ConvLastMessage $unread={conv.unreadCount > 0}>
                                        {conv.lastMessage || "No messages yet"}
                                    </ConvLastMessage>
                                    {conv.unreadCount > 0 && (
                                        <UnreadBadge>
                                            {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                                        </UnreadBadge>
                                    )}
                                </ConvBottomRow>
                            </ConvInfo>
                        </ConversationItem>
                    ))
                )}
            </ConversationList>
        </SidebarWrapper>
    );
}

export default ChatSidebar;

const SidebarWrapper = styled(Box)`
    width: 22rem;
    min-width: 22rem;
    border-right: 1px solid ${colors.border};
    display: flex;
    flex-direction: column;
    background: ${colors.surface};
    position: relative;

    @media (max-width: 48rem) {
        width: 100%;
        min-width: unset;
    }
`;

const SidebarHeader = styled(Box)`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${spacing.lg};
    border-bottom: 1px solid ${colors.border};
`;

const SidebarTitle = styled(Typography)`
    font-size: ${fontSize.lg} !important;
    font-weight: ${fontWeight.bold} !important;
    color: ${colors.textPrimary};
`;

const NewChatButton = styled(Box)`
    width: 2.25rem;
    height: 2.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: ${radius.sm};
    background: ${colors.primaryLighter};
    color: ${colors.primary};
    cursor: pointer;
    transition: all ${transition.fast};

    &:hover {
        background: ${colors.primaryLight};
        color: ${colors.primaryHover};
    }
`;

const ConversationList = styled(Box)`
    flex: 1;
    overflow-y: auto;
`;

const EmptyState = styled(Typography)`
    padding: ${spacing.xl} ${spacing.lg};
    text-align: center;
    color: ${colors.textHint};
    font-size: ${fontSize.sm} !important;
    line-height: 1.6 !important;
`;

const ConversationItem = styled(Box)<{ $active: boolean }>`
    display: flex;
    align-items: center;
    gap: ${spacing.sm};
    padding: ${spacing.sm} ${spacing.lg};
    cursor: pointer;
    transition: background ${transition.fast};
    background: ${({ $active }) => ($active ? colors.primaryLighter : "transparent")};
    border-left: 3px solid ${({ $active }) => ($active ? colors.primary : "transparent")};

    &:hover {
        background: ${({ $active }) =>
    $active ? colors.primaryLighter : colors.surfaceHover};
    }
`;

const AvatarWrapper = styled(Box)`
    position: relative;
    flex-shrink: 0;
`;

const StyledAvatar = styled(Avatar)`
    width: 2.75rem !important;
    height: 2.75rem !important;
    font-size: ${fontSize.sm} !important;
    background: ${colors.primaryLight} !important;
    color: ${colors.primaryDark} !important;
`;

const OnlineDot = styled(Box)`
    position: absolute;
    bottom: 1px;
    right: 1px;
    width: 0.65rem;
    height: 0.65rem;
    border-radius: 50%;
    background: #22c55e;
    border: 2px solid ${colors.surface};
`;

const ConvInfo = styled(Box)`
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
`;

const ConvTopRow = styled(Box)`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const ConvName = styled(Typography)<{ $unread: boolean }>`
    font-size: ${fontSize.sm} !important;
    font-weight: ${({ $unread }) =>
    $unread ? fontWeight.bold : fontWeight.semibold} !important;
    color: ${colors.textPrimary};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const ConvTime = styled(Typography)`
    font-size: ${fontSize.xs} !important;
    color: ${colors.textHint};
    white-space: nowrap;
    flex-shrink: 0;
`;

const ConvBottomRow = styled(Box)`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${spacing.xs};
`;

const ConvLastMessage = styled(Typography)<{ $unread: boolean }>`
    font-size: ${fontSize.xs} !important;
    color: ${({ $unread }) => ($unread ? colors.textSecondary : colors.textHint)};
    font-weight: ${({ $unread }) =>
    $unread ? fontWeight.medium : fontWeight.regular} !important;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const UnreadBadge = styled(Box)`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.25rem;
    height: 1.25rem;
    padding: 0 0.35rem;
    border-radius: 999px;
    background: ${colors.primary};
    color: white;
    font-size: 0.7rem;
    font-weight: ${fontWeight.bold};
    flex-shrink: 0;
`;