import { Search, Close } from "@mui/icons-material";
import { Avatar, Box, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { resolveImageUrl } from "../../utils/resolveImageUrl";
import type { ChatUserSearch as ChatUserSearchType } from "../../types/chat";
import {
    colors,
    spacing,
    fontSize,
    fontWeight,
    radius,
    transition,
} from "../../styles/theme";

type ChatUserSearchProps = {
    onSelectUser: (user: ChatUserSearchType) => void;
    searchUsers: (query: string) => Promise<ChatUserSearchType[]>;
    onClose: () => void;
};

function ChatUserSearch({ onSelectUser, searchUsers, onClose }: ChatUserSearchProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<ChatUserSearchType[]>([]);
    const [searching, setSearching] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (!query.trim()) {
            setResults([]);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setSearching(true);
            const data = await searchUsers(query);
            setResults(data);
            setSearching(false);
        }, 300);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query, searchUsers]);

    return (
        <SearchOverlay>
            <SearchHeader>
                <SearchTitle>New Conversation</SearchTitle>
                <CloseButton onClick={onClose}>
                    <Close sx={{ fontSize: 20 }} />
                </CloseButton>
            </SearchHeader>

            <SearchInputWrapper>
                <Search sx={{ fontSize: 18, color: colors.textHint }} />
                <SearchInput
                    ref={inputRef}
                    placeholder="Search by name or username..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </SearchInputWrapper>

            <ResultsList>
                {searching && (
                    <EmptyState>Searching...</EmptyState>
                )}

                {!searching && query.trim() && results.length === 0 && (
                    <EmptyState>No players found</EmptyState>
                )}

                {results.map((user) => (
                    <UserItem key={user.id} onClick={() => onSelectUser(user)}>
                        <StyledAvatar
                            src={resolveImageUrl(user.profileImageUrl)}
                            alt={user.fullName}
                        >
                            {user.fullName.charAt(0)}
                        </StyledAvatar>
                        <UserInfo>
                            <UserName>{user.fullName}</UserName>
                            <UserMeta>
                                @{user.username}
                                {user.playerLevel ? ` · ${user.playerLevel}` : ""}
                            </UserMeta>
                        </UserInfo>
                    </UserItem>
                ))}
            </ResultsList>
        </SearchOverlay>
    );
}

export default ChatUserSearch;

const SearchOverlay = styled(Box)`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${colors.surface};
    z-index: 10;
    display: flex;
    flex-direction: column;
`;

const SearchHeader = styled(Box)`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${spacing.md} ${spacing.lg};
    border-bottom: 1px solid ${colors.border};
`;

const SearchTitle = styled(Typography)`
    font-size: ${fontSize.md} !important;
    font-weight: ${fontWeight.bold} !important;
    color: ${colors.textPrimary};
`;

const CloseButton = styled(Box)`
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: ${radius.sm};
    cursor: pointer;
    color: ${colors.textMuted};
    transition: all ${transition.fast};

    &:hover {
        background: ${colors.surfaceAlt};
        color: ${colors.textPrimary};
    }
`;

const SearchInputWrapper = styled(Box)`
    display: flex;
    align-items: center;
    gap: ${spacing.xs};
    padding: ${spacing.sm} ${spacing.lg};
    border-bottom: 1px solid ${colors.border};
`;

const SearchInput = styled.input`
    flex: 1;
    border: none;
    outline: none;
    font-size: ${fontSize.sm};
    color: ${colors.textPrimary};
    background: transparent;

    &::placeholder {
        color: ${colors.textHint};
    }
`;

const ResultsList = styled(Box)`
    flex: 1;
    overflow-y: auto;
`;

const EmptyState = styled(Typography)`
    padding: ${spacing.xl};
    text-align: center;
    color: ${colors.textHint};
    font-size: ${fontSize.sm} !important;
`;

const UserItem = styled(Box)`
    display: flex;
    align-items: center;
    gap: ${spacing.sm};
    padding: ${spacing.sm} ${spacing.lg};
    cursor: pointer;
    transition: background ${transition.fast};

    &:hover {
        background: ${colors.surfaceHover};
    }
`;

const StyledAvatar = styled(Avatar)`
    width: 2.5rem !important;
    height: 2.5rem !important;
    font-size: ${fontSize.sm} !important;
    background: ${colors.primaryLight} !important;
    color: ${colors.primaryDark} !important;
`;

const UserInfo = styled(Box)`
    display: flex;
    flex-direction: column;
    min-width: 0;
`;

const UserName = styled(Typography)`
    font-size: ${fontSize.sm} !important;
    font-weight: ${fontWeight.semibold} !important;
    color: ${colors.textPrimary};
`;

const UserMeta = styled(Typography)`
    font-size: ${fontSize.xs} !important;
    color: ${colors.textMuted};
`;