import { Box, Avatar, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import styled from "styled-components";
import axiosInstance from "../../api/axiosInstance";

type CommentType = {
    id: number;
    authorName: string;
    content: string;
    createdAt: string;
};

type PostCommentsProps = {
    postId: number;
    onCommentAdded: () => void;
};

function PostComments({ postId, onCommentAdded }: PostCommentsProps) {
    const [comments, setComments] = useState<CommentType[]>([]);
    const [newComment, setNewComment] = useState("");

    const loadComments = async () => {
        try {
            const response = await axiosInstance.get<CommentType[]>(
                `/player/feed/posts/${postId}/comments`
            );
            setComments(response.data);
        } catch (error) {
            console.error("Failed to load comments", error);
        }
    };

    useEffect(() => {
        loadComments();
    }, [postId]);

    const handleCreateComment = async () => {
        if (!newComment.trim()) return;

        try {
            const response = await axiosInstance.post<CommentType>(
                `/player/feed/posts/${postId}/comments`,
                {
                    content: newComment,
                }
            );

            setComments((prev) => [...prev, response.data]);
            setNewComment("");
            onCommentAdded();
        } catch (error) {
            console.error("Failed to create comment", error);
        }
    };

    return (
        <CommentsWrapper>
            <CommentsList>
                {comments.map((comment) => (
                    <CommentItem key={comment.id}>
                        <Avatar sx={{ width: 28, height: 28 }} />

                        <CommentContent>
                            <CommentAuthor>{comment.authorName}</CommentAuthor>
                            <CommentText>{comment.content}</CommentText>
                        </CommentContent>
                    </CommentItem>
                ))}
            </CommentsList>

            <AddCommentRow>
                <CommentInput
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                />

                <SendButton onClick={handleCreateComment}>Post</SendButton>
            </AddCommentRow>
        </CommentsWrapper>
    );
}

export default PostComments;

const CommentsWrapper = styled(Box)`
  margin-top: 1rem;
  border-top: 1px solid #e5e7eb;
  padding-top: 0.8rem;
`;

const CommentsList = styled(Box)`
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    max-height: 14rem;
    overflow-y: auto;
    padding-right: 0.35rem;

    &::-webkit-scrollbar {
        width: 0.4rem;
    }

    &::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 999px;
    }
`;

const CommentItem = styled(Box)`
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;
`;

const CommentContent = styled(Box)`
  background: #f1f5f9;
  padding: 0.45rem 0.7rem;
  border-radius: 0.7rem;
  max-width: 90%;
`;

const CommentAuthor = styled(Typography)`
  font-size: 0.8rem !important;
  font-weight: 700 !important;
`;

const CommentText = styled(Typography)`
  font-size: 0.85rem !important;
`;

const AddCommentRow = styled(Box)`
  margin-top: 0.6rem;
  display: flex;
  gap: 0.5rem;
`;

const CommentInput = styled.input`
  flex: 1;
  border-radius: 0.6rem;
  border: 1px solid #e2e8f0;
  padding: 0.45rem 0.6rem;
  font-size: 0.85rem;
`;

const SendButton = styled.button`
  border: none;
  background: #10b981;
  color: white;
  border-radius: 0.6rem;
  padding: 0 0.8rem;
  cursor: pointer;

  &:hover {
    background: #059669;
  }
`;