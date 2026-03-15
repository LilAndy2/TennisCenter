import {
    ChatBubbleOutline,
    DeleteOutline,
    FavoriteBorder,
    MoreVert,
    EditOutlined,
    Favorite,
} from "@mui/icons-material";
import {
    Avatar,
    Box,
    IconButton,
    Typography,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from "@mui/material";
import { useState } from "react";
import styled from "styled-components";
import PostComments from "./PostComments.tsx";
import { motion } from "framer-motion"

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

const MotionIconWrapper = motion.span;

function PostCard({ post, onDelete, onEdit, onCommentAdded, onToggleLike }: PostCardProps) {
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [isLikeAnimation, setIsLikeAnimation] = useState(false);

    const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        setMenuAnchor(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setMenuAnchor(null);
    };

    const handleDeleteClick = () => {
        handleCloseMenu();
        setConfirmDeleteOpen(true);
    };

    const handleConfirmDelete = () => {
        onDelete(post.id);
        setConfirmDeleteOpen(false);
    };

    const handleLikeClick = async () => {
        setIsLikeAnimation(true);
        onToggleLike(post.id);

        setTimeout(() => {
            setIsLikeAnimation(false);
        }, 300)
    }

    return (
        <CardWrapper>
            <PostHeader>
                <PostHeaderLeft>
                    <StyledAvatar />
                    <AuthorInfo>
                        <AuthorName>{post.authorName}</AuthorName>
                        <AuthorMeta>
                            {post.authorRole} • {new Date(post.createdAt).toLocaleString()}
                        </AuthorMeta>
                    </AuthorInfo>
                </PostHeaderLeft>

                {post.owner ? (
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

                            <MenuItem onClick={handleDeleteClick} sx={{ color: "#dc2626" }}>
                                <DeleteOutline sx={{ mr: 1 }} />
                                Delete
                            </MenuItem>
                        </Menu>
                    </>
                ) : null}
            </PostHeader>

            <PostContent>{post.content}</PostContent>

            {post.imageUrl ? <PostImage src={`http://localhost:8080${post.imageUrl}`} alt="Post" /> : null}

            <PostActions>
                <ActionButton onClick={handleLikeClick}>
                    <MotionIconWrapper
                        animate={
                            isLikeAnimation
                                ? { scale: [1, 1.35, 0.95, 1] }
                                : { scale: 1 }
                        }
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        style={{ display: "flex", alignItems: "center" }}
                    >
                        {post.likedByCurrentUser ? (
                            <Favorite sx={{ fontSize: 20, color: "#059669" }} />
                        ) : (
                            <FavoriteBorder sx={{ fontSize: 20, color: "#64748b" }} />
                        )}
                    </MotionIconWrapper>

                    <span>
                        {post.likedByCurrentUser ? "Unlike" : "Like"}
                    </span>

                    {post.likesCount > 0 ? (
                        <CountBadge>{post.likesCount}</CountBadge>
                    ) : null}
                </ActionButton>

                <ActionButton onClick={() => setShowComments((prev) => !prev)}>
                    <ChatBubbleOutline sx={{ fontSize: 20 }} />
                    <span>Comment</span>
                    {!showComments && post.commentsCount > 0 ? (
                        <CountBadge>{post.commentsCount}</CountBadge>
                    ) : null}
                </ActionButton>
            </PostActions>

            {showComments && (
                <PostComments
                    postId={post.id}
                    onCommentAdded={() => onCommentAdded(post.id)}
                />
            )}

            <Dialog
                open={confirmDeleteOpen}
                onClose={() => setConfirmDeleteOpen(false)}
            >
                <DialogTitle>Delete post</DialogTitle>

                <DialogContent>
                    <Typography>
                        Are you sure you want to permanently delete this post?
                    </Typography>
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setConfirmDeleteOpen(false)}>
                        Cancel
                    </Button>

                    <Button
                        color="error"
                        variant="contained"
                        onClick={handleConfirmDelete}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </CardWrapper>
    );
}

export default PostCard;

const CardWrapper = styled(Box)`
    width: 100%;
    background: white;
    border-radius: 1.25rem;
    border: 1px solid #e5e7eb;
    box-shadow: 0 0.75rem 2rem rgba(15, 23, 42, 0.05);
    padding: 1.2rem;
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
    background: #e2e8f0 !important;
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
`;

const PostActions = styled(Box)`
    margin-top: 0.85rem;
    display: flex;
    gap: 0.75rem;
`;

const ActionButton = styled.button`
    flex: 1;
    height: 2.7rem;
    border: none;
    border-radius: 0.85rem;
    background: #f8fafc;
    color: #334155;
    font-size: 0.92rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    cursor: pointer;
    transition: 0.2s ease;

    &:hover {
        background: #eef2f7;
    }
`;

const CountBadge = styled.span`
    min-width: 1.35rem;
    height: 1.35rem;
    padding: 0 0.35rem;
    border-radius: 999px;
    background: #e2e8f0;
    color: #334155;
    font-size: 0.75rem;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
`;
