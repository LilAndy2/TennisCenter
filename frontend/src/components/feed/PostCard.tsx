import { DeleteOutline, EditOutlined, MoreVert } from "@mui/icons-material";
import { Avatar, Box, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import { useState } from "react";
import styled from "styled-components";
import { formatTimeAgo } from "../../utils/formatTimeAgo";
import PostActionsBar from "./PostActionsBar";
import PostComments from "./PostComments";
import DeletePostDialog from "./DeletePostDialog";

export type FeedPostType = {
    id: number;
    authorName: string;
    authorRole: string;
    content: string;
    imageUrl?: string;
    createdAt: string;
    owner: boolean;
    commentsCount: number;
    likesCount: number;
    likedByCurrentUser: boolean;
};

type PostCardProps = {
    post: FeedPostType;
    onDelete: (postId: number) => void;
    onEdit: (post: FeedPostType) => void;
    onCommentAdded: (postId: number) => void;
    onToggleLike: (postId: number) => void;
};

function PostCard({ post, onDelete, onEdit, onCommentAdded, onToggleLike }: PostCardProps) {
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [isLikeAnimating, setIsLikeAnimating] = useState(false);

    const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        setMenuAnchor(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setMenuAnchor(null);
    };

    const handleLikeClick = () => {
        setIsLikeAnimating(true);
        onToggleLike(post.id);
        setTimeout(() => setIsLikeAnimating(false), 300);
    };

    return (
        <CardWrapper>
            <PostHeader>
                <PostHeaderLeft>
                    <StyledAvatar />
                    <AuthorInfo>
                        <AuthorName>{post.authorName}</AuthorName>
                        <AuthorMeta>
                            {post.authorRole} • {formatTimeAgo(post.createdAt)}
                        </AuthorMeta>
                    </AuthorInfo>
                </PostHeaderLeft>

                {post.owner && (
                    <>
                        <IconButton onClick={handleOpenMenu}>
                            <MoreVert />
                        </IconButton>
                        <Menu
                            anchorEl={menuAnchor}
                            open={Boolean(menuAnchor)}
                            onClose={handleCloseMenu}
                        >
                            <MenuItem
                                onClick={() => {
                                    handleCloseMenu();
                                    onEdit(post);
                                }}
                            >
                                <EditOutlined sx={{ mr: 1 }} />
                                Edit
                            </MenuItem>
                            <MenuItem
                                onClick={() => {
                                    handleCloseMenu();
                                    setConfirmDeleteOpen(true);
                                }}
                                sx={{ color: "#dc2626" }}
                            >
                                <DeleteOutline sx={{ mr: 1 }} />
                                Delete
                            </MenuItem>
                        </Menu>
                    </>
                )}
            </PostHeader>

            <PostContent>{post.content}</PostContent>

            {post.imageUrl && (
                <PostImage src={`http://localhost:8080${post.imageUrl}`} alt="Post" />
            )}

            <PostActionsBar
                likesCount={post.likesCount}
                commentsCount={post.commentsCount}
                likedByCurrentUser={post.likedByCurrentUser}
                showComments={showComments}
                isLikeAnimating={isLikeAnimating}
                onLike={handleLikeClick}
                onToggleComments={() => setShowComments((prev) => !prev)}
            />

            {showComments && (
                <PostComments
                    postId={post.id}
                    onCommentAdded={() => onCommentAdded(post.id)}
                />
            )}

            <DeletePostDialog
                open={confirmDeleteOpen}
                onClose={() => setConfirmDeleteOpen(false)}
                onConfirm={() => {
                    onDelete(post.id);
                    setConfirmDeleteOpen(false);
                }}
            />
        </CardWrapper>
    );
}

export default PostCard;

const CardWrapper = styled(Box)`
    width: 100%;
    background: white;
    border-radius: 1.25rem;
    border: 1px solid #e5e7eb;
    box-shadow: 0 1px 4px rgba(15, 23, 42, 0.06);
    padding: 1.2rem;
    transition: box-shadow 0.2s ease;

    &:hover {
        box-shadow: 0 4px 16px rgba(15, 23, 42, 0.09);
    }
`;

const PostHeader = styled(Box)`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
`;

const PostHeaderLeft = styled(Box)`
    display: flex;
    align-items: center;
    gap: 0.85rem;
`;

const StyledAvatar = styled(Avatar)`
    width: 2.8rem !important;
    height: 2.8rem !important;
    background: #ecfdf5 !important;
    color: #059669 !important;
`;

const AuthorInfo = styled(Box)`
    display: flex;
    flex-direction: column;
`;

const AuthorName = styled(Typography)`
    font-size: 0.98rem !important;
    font-weight: 700 !important;
    color: #111827;
`;

const AuthorMeta = styled(Typography)`
    font-size: 0.82rem !important;
    color: #64748b;
`;

const PostContent = styled(Typography)`
    margin-top: 1rem !important;
    color: #1f2937;
    line-height: 1.7 !important;
    white-space: pre-line;
`;

const PostImage = styled.img`
    width: 100%;
    max-height: 25rem;
    object-fit: cover;
    border-radius: 1rem;
    margin-top: 1rem;
    border: 1px solid #d1fae5;
`;