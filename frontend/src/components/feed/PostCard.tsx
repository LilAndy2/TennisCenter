import {
    ChatBubbleOutline,
    FavoriteBorder,
    MoreHoriz,
} from "@mui/icons-material";
import { Avatar, Box, IconButton, Typography } from "@mui/material";
import styled from "styled-components";

export type FeedPostType = {
    id: number;
    authorName: string;
    authorRole: string;
    content: string;
    imageUrl?: string;
    createdAt: string;
    likesCount: number;
    commentsCount: number;
};

type PostCardProps = {
    post: FeedPostType;
};

function PostCard({ post }: PostCardProps) {
    return (
        <CardWrapper>
            <PostHeader>
                <PostHeaderLeft>
                    <StyledAvatar />
                    <AuthorInfo>
                        <AuthorName>{post.authorName}</AuthorName>
                        <AuthorMeta>
                            {post.authorRole} • {post.createdAt}
                        </AuthorMeta>
                    </AuthorInfo>
                </PostHeaderLeft>

                <IconButton>
                    <MoreHoriz />
                </IconButton>
            </PostHeader>

            <PostContent>{post.content}</PostContent>

            {post.imageUrl ? <PostImage src={post.imageUrl} alt="Post" /> : null}

            <PostStats>
                <PostStatsText>{post.likesCount} likes</PostStatsText>
                <PostStatsText>{post.commentsCount} comments</PostStatsText>
            </PostStats>

            <PostActions>
                <ActionButton>
                    <FavoriteBorder sx={{ fontSize: 20 }} />
                    <span>Like</span>
                </ActionButton>

                <ActionButton>
                    <ChatBubbleOutline sx={{ fontSize: 20 }} />
                    <span>Comment</span>
                </ActionButton>
            </PostActions>
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

const PostStats = styled(Box)`
  margin-top: 1rem;
  padding-top: 0.85rem;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PostStatsText = styled(Typography)`
  font-size: 0.88rem !important;
  color: #64748b;
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