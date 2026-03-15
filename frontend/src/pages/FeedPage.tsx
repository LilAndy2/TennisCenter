import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import styled from "styled-components";
import axiosInstance from "../api/axiosInstance";
import CreatePostModal from "../components/feed/CreatePostModal";
import FeedHero from "../components/feed/FeedHero";
import PostCard, { type FeedPostType } from "../components/feed/PostCard";
import AuthenticatedLayout from "../components/layout/AuthenticatedLayout";

function FeedPage() {
    const [posts, setPosts] = useState<FeedPostType[]>([]);
    const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);

    const loadPosts = async () => {
        try {
            const response = await axiosInstance.get<FeedPostType[]>("/player/feed/posts");
            setPosts(response.data);
        } catch (error) {
            console.error("Failed to load posts", error);
        }
    };

    useEffect(() => {
        loadPosts();
    }, []);

    const handleOpenCreatePostModal = () => {
        setIsCreatePostModalOpen(true);
    };

    const handleCloseCreatePostModal = () => {
        setIsCreatePostModalOpen(false);
    };

    const handleCreatePost = async (postData: {
        content: string;
        imageFile: File | null;
    }) => {
        try {
            const formData = new FormData();

            if (postData.content) {
                formData.append("content", postData.content);
            }

            if (postData.imageFile) {
                formData.append("image", postData.imageFile);
            }

            const response = await axiosInstance.post<FeedPostType>(
                "/player/feed/posts",
                formData
            );

            setPosts((previousPosts) => [response.data, ...previousPosts]);
        } catch (error) {
            console.error("Failed to create post", error);
            throw error;
        }
    };

    const handleDeletePost = async (postId: number) => {
        try {
            await axiosInstance.delete(`/player/feed/posts/${postId}`);
            setPosts((previousPosts) =>
                previousPosts.filter((post) => post.id !== postId)
            );
        } catch (error) {
            console.error("Failed to delete post", error);
        }
    };

    return (
        <AuthenticatedLayout>
            <FeedPageWrapper>
                <FeedCenterColumn>
                    <FeedHero onCreatePost={handleOpenCreatePostModal} />

                    <PostsSection>
                        {posts.map((post) => (
                            <PostCard key={post.id} post={post} onDelete={handleDeletePost} />
                        ))}
                    </PostsSection>
                </FeedCenterColumn>
            </FeedPageWrapper>

            <CreatePostModal
                open={isCreatePostModalOpen}
                onClose={handleCloseCreatePostModal}
                onSubmit={handleCreatePost}
            />
        </AuthenticatedLayout>
    );
}

export default FeedPage;

const FeedPageWrapper = styled(Box)`
    width: 100%;
    display: flex;
    justify-content: center;
`;

const FeedCenterColumn = styled(Box)`
    width: 100%;
    max-width: 48rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
`;

const PostsSection = styled(Box)`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;