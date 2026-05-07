import { Send } from "@mui/icons-material";
import { Avatar, Box, CircularProgress, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import { resolveImageUrl } from "../../utils/resolveImageUrl";
import type { ChatConversation, ChatMessage } from "../../types/chat";
import {
    colors,
    spacing,
    fontSize,
    fontWeight,
    radius,
    shadow,
    transition,
} from "../../styles/theme";

type ChatMessageAreaProps = {
    conversation: ChatConversation | null;
    messages: ChatMessage[];
    currentUserId: number;
    onSendMessage: (content: string) => void;
    loading: boolean;
    isOnline: boolean;
};

function ChatMessageArea({
                             conversation,
                             messages,
                             currentUserId,
                             onSendMessage,
                             loading,
                             isOnline,
                         }: ChatMessageAreaProps) {
    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        inputRef.current?.focus();
    }, [conversation?.id]);

    const handleSend = () => {
        const trimmed = inputValue.trim();
        if (!trimmed) return;
        onSendMessage(trimmed);
        setInputValue("");
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatMessageTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    const formatDateSeparator = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.floor(
            (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        return date.toLocaleDateString([], {
            weekday: "long",
            month: "short",
            day: "numeric",
        });
    };

    const shouldShowDate = (index: number) => {
        if (index === 0) return true;
        const prev = new Date(messages[index - 1].sentAt).toDateString();
        const curr = new Date(messages[index].sentAt).toDateString();
        return prev !== curr;
    };

    if (!conversation) {
        return (
            <EmptyArea>
                <EmptyContent>
                    <EmptyIconRow>
                        <EmptyDot $delay="0s" />
                        <EmptyDot $delay="0.15s" />
                        <EmptyDot $delay="0.3s" />
                    </EmptyIconRow>
                    <EmptyTitle>Your messages</EmptyTitle>
                    <EmptySubtitle>
                        Select a conversation from the sidebar or start a new one
                    </EmptySubtitle>
                </EmptyContent>
            </EmptyArea>
        );
    }

    return (
        <MessageAreaWrapper>
            <AreaHeader>
                <HeaderAvatar
                    src={resolveImageUrl(conversation.otherUserProfileImageUrl)}
                    alt={conversation.otherUserName}
                >
                    {conversation.otherUserName.charAt(0)}
                </HeaderAvatar>
                <HeaderInfo>
                    <HeaderName>{conversation.otherUserName}</HeaderName>
                    <HeaderStatus $online={isOnline}>
                        {isOnline ? "Online" : "Offline"}
                    </HeaderStatus>
                </HeaderInfo>
            </AreaHeader>

            <MessagesContainer>
                {loading ? (
                    <LoadingWrapper>
                        <CircularProgress size={28} sx={{ color: colors.primary }} />
                    </LoadingWrapper>
                ) : messages.length === 0 ? (
                    <NoMessagesHint>
                        No messages yet — say hello!
                    </NoMessagesHint>
                ) : (
                    messages.map((msg, index) => {
                        const isMine = msg.senderId === currentUserId;
                        return (
                            <div key={msg.id}>
                                {shouldShowDate(index) && (
                                    <DateSeparator>
                                        <DateLine />
                                        <DateLabel>
                                            {formatDateSeparator(msg.sentAt)}
                                        </DateLabel>
                                        <DateLine />
                                    </DateSeparator>
                                )}
                                <MessageRow $isMine={isMine}>
                                    {!isMine && (
                                        <MsgAvatar
                                            src={resolveImageUrl(msg.senderProfileImageUrl)}
                                            alt={msg.senderName}
                                        >
                                            {msg.senderName.charAt(0)}
                                        </MsgAvatar>
                                    )}
                                    <MessageBubble $isMine={isMine}>
                                        <MessageContent>{msg.content}</MessageContent>
                                        <MessageTime $isMine={isMine}>
                                            {formatMessageTime(msg.sentAt)}
                                        </MessageTime>
                                    </MessageBubble>
                                </MessageRow>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </MessagesContainer>

            <InputArea>
                <InputWrapper>
                    <StyledTextarea
                        ref={inputRef}
                        placeholder="Type a message..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={1}
                    />
                    <SendButton
                        onClick={handleSend}
                        $active={inputValue.trim().length > 0}
                    >
                        <Send sx={{ fontSize: 20 }} />
                    </SendButton>
                </InputWrapper>
            </InputArea>
        </MessageAreaWrapper>
    );
}

export default ChatMessageArea;

/* ─── Animations ─── */

const pulse = keyframes`
    0%, 100% { opacity: 0.3; transform: scale(0.85); }
    50% { opacity: 1; transform: scale(1); }
`;

/* ─── Empty State ─── */

const EmptyArea = styled(Box)`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(180deg, ${colors.backgroundGreen} 0%, ${colors.background} 100%);
`;

const EmptyContent = styled(Box)`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${spacing.sm};
`;

const EmptyIconRow = styled(Box)`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-bottom: ${spacing.xs};
`;

const EmptyDot = styled(Box)<{ $delay: string }>`
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: ${colors.primary};
    animation: ${pulse} 1.4s ease-in-out infinite;
    animation-delay: ${({ $delay }) => $delay};
`;

const EmptyTitle = styled(Typography)`
    font-size: ${fontSize.lg} !important;
    font-weight: ${fontWeight.bold} !important;
    color: ${colors.textPrimary};
`;

const EmptySubtitle = styled(Typography)`
    font-size: ${fontSize.sm} !important;
    color: ${colors.textMuted};
    max-width: 18rem;
    text-align: center;
    line-height: 1.5 !important;
`;

/* ─── Message Area ─── */

const MessageAreaWrapper = styled(Box)`
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    background: ${colors.backgroundGreen};
`;

const AreaHeader = styled(Box)`
    display: flex;
    align-items: center;
    gap: ${spacing.sm};
    padding: ${spacing.md} ${spacing.lg};
    background: ${colors.surface};
    border-bottom: 1px solid ${colors.border};
`;

const HeaderAvatar = styled(Avatar)`
    width: 2.5rem !important;
    height: 2.5rem !important;
    font-size: ${fontSize.sm} !important;
    background: ${colors.primaryLight} !important;
    color: ${colors.primaryDark} !important;
`;

const HeaderInfo = styled(Box)`
    display: flex;
    flex-direction: column;
`;

const HeaderName = styled(Typography)`
    font-size: ${fontSize.base} !important;
    font-weight: ${fontWeight.bold} !important;
    color: ${colors.textPrimary};
    line-height: 1.2 !important;
`;

const HeaderStatus = styled(Typography)<{ $online: boolean }>`
    font-size: ${fontSize.xs} !important;
    color: ${({ $online }) => ($online ? "#22c55e" : colors.textHint)};
    font-weight: ${fontWeight.medium} !important;
`;

const MessagesContainer = styled(Box)`
    flex: 1;
    overflow-y: auto;
    padding: ${spacing.md} ${spacing.lg};
    display: flex;
    flex-direction: column;
    gap: ${spacing.xs};
`;

const LoadingWrapper = styled(Box)`
    display: flex;
    justify-content: center;
    padding: ${spacing.xl};
`;

const NoMessagesHint = styled(Typography)`
    text-align: center;
    color: ${colors.textHint};
    font-size: ${fontSize.sm} !important;
    padding: ${spacing.xxl} 0;
`;

const DateSeparator = styled(Box)`
    display: flex;
    align-items: center;
    gap: ${spacing.sm};
    padding: ${spacing.sm} 0;
`;

const DateLine = styled(Box)`
    flex: 1;
    height: 1px;
    background: ${colors.border};
`;

const DateLabel = styled(Typography)`
    font-size: ${fontSize.xs} !important;
    color: ${colors.textHint};
    white-space: nowrap;
`;

const MessageRow = styled(Box)<{ $isMine: boolean }>`
    display: flex;
    align-items: flex-end;
    gap: ${spacing.xs};
    justify-content: ${({ $isMine }) => ($isMine ? "flex-end" : "flex-start")};
`;

const MsgAvatar = styled(Avatar)`
    width: 1.75rem !important;
    height: 1.75rem !important;
    font-size: 0.7rem !important;
    background: ${colors.primaryLight} !important;
    color: ${colors.primaryDark} !important;
    flex-shrink: 0;
`;

const MessageBubble = styled(Box)<{ $isMine: boolean }>`
    max-width: 70%;
    padding: ${spacing.xs} ${spacing.sm};
    border-radius: ${radius.md};
    background: ${({ $isMine }) => ($isMine ? colors.primary : colors.surface)};
    color: ${({ $isMine }) => ($isMine ? "white" : colors.textPrimary)};
    box-shadow: ${shadow.sm};
    border-bottom-right-radius: ${({ $isMine }) => ($isMine ? "0.25rem" : radius.md)};
    border-bottom-left-radius: ${({ $isMine }) => ($isMine ? radius.md : "0.25rem")};
    word-break: break-word;
`;

const MessageContent = styled(Typography)`
    font-size: ${fontSize.sm} !important;
    line-height: 1.5 !important;
    white-space: pre-wrap;
`;

const MessageTime = styled(Typography)<{ $isMine: boolean }>`
    font-size: 0.65rem !important;
    color: ${({ $isMine }) => ($isMine ? "rgba(255,255,255,0.7)" : colors.textHint)};
    text-align: right;
    margin-top: 0.15rem;
`;

const InputArea = styled(Box)`
    padding: ${spacing.sm} ${spacing.lg};
    background: ${colors.surface};
    border-top: 1px solid ${colors.border};
`;

const InputWrapper = styled(Box)`
    display: flex;
    align-items: flex-end;
    gap: ${spacing.xs};
    background: ${colors.surfaceAlt};
    border-radius: ${radius.lg};
    padding: ${spacing.xs} ${spacing.sm};
`;

const StyledTextarea = styled.textarea`
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-size: ${fontSize.sm};
    color: ${colors.textPrimary};
    resize: none;
    min-height: 1.5rem;
    max-height: 6rem;
    line-height: 1.5;
    padding: 0.25rem 0;
    font-family: inherit;

    &::placeholder {
        color: ${colors.textHint};
    }
`;

const SendButton = styled(Box)<{ $active: boolean }>`
    width: 2.25rem;
    height: 2.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: ${radius.sm};
    cursor: ${({ $active }) => ($active ? "pointer" : "default")};
    color: ${({ $active }) => ($active ? colors.primary : colors.textHint)};
    transition: all ${transition.fast};

    &:hover {
        background: ${({ $active }) => ($active ? colors.primaryLighter : "transparent")};
    }
`;