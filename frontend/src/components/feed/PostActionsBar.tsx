import { ChatBubbleOutline, FavoriteBorder, Favorite } from "@mui/icons-material";
import { Box } from "@mui/material";
import { motion } from "framer-motion";
import styled from "styled-components";

const MotionIconWrapper = motion.span;

type PostActionsBarProps = {
    likesCount: number;
    commentsCount: number;
    likedByCurrentUser: boolean;
    showComments: boolean;
    isLikeAnimating: boolean;
    onLike: () => void;
    onToggleComments: () => void;
};

function PostActionsBar({
                            likesCount,
                            commentsCount,
                            likedByCurrentUser,
                            showComments,
                            isLikeAnimating,
                            onLike,
                            onToggleComments,
                        }: PostActionsBarProps) {
    return (
        <ActionsWrapper>
            <ActionButton onClick={onLike}>
                <MotionIconWrapper
                    animate={isLikeAnimating ? { scale: [1, 1.35, 0.95, 1] } : { scale: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    style={{ display: "flex", alignItems: "center" }}
                >
                    {likedByCurrentUser ? (
                        <Favorite sx={{ fontSize: 20, color: "#059669" }} />
                    ) : (
                        <FavoriteBorder sx={{ fontSize: 20, color: "#64748b" }} />
                    )}
                </MotionIconWrapper>
                <span>{likedByCurrentUser ? "Unlike" : "Like"}</span>
                {likesCount > 0 && <CountBadge>{likesCount}</CountBadge>}
            </ActionButton>

            <ActionButton onClick={onToggleComments}>
                <ChatBubbleOutline sx={{ fontSize: 20 }} />
                <span>Comment</span>
                {!showComments && commentsCount > 0 && (
                    <CountBadge>{commentsCount}</CountBadge>
                )}
            </ActionButton>
        </ActionsWrapper>
    );
}

export default PostActionsBar;

const ActionsWrapper = styled(Box)`
  margin-top: 0.85rem;
  display: flex;
  gap: 0.75rem;
`;

const ActionButton = styled.button`
  flex: 1;
  height: 2.7rem;
  border: none;
  border-radius: 0.85rem;
  background: #f0fdf4;
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
    background: #dcfce7;
    color: #065f46;
  }
`;

const CountBadge = styled.span`
  min-width: 1.35rem;
  height: 1.35rem;
  padding: 0 0.35rem;
  border-radius: 999px;
  background: #d1fae5;
  color: #065f46;
  font-size: 0.75rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;