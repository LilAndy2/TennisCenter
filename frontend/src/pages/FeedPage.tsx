import { Box } from "@mui/material";
import { useState } from "react";
import styled from "styled-components";
import CreatePostModal from "../components/feed/CreatePostModal";
import FeedHero from "../components/feed/FeedHero";
import PostCard, { type FeedPostType } from "../components/feed/PostCard";
import AuthenticatedLayout from "../components/layout/AuthenticatedLayout";

const initialMockPosts: FeedPostType[] = [
    {
        id: 1,
        authorName: "Andrei Manea",
        authorRole: "PLAYER",
        content:
            "Really excited for the next local tournament this weekend. Good luck to everyone and let’s keep the matches competitive and fair.",
        imageUrl:
            "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1200&q=80",
        createdAt: "2 hours ago",
        likesCount: 18,
        commentsCount: 6,
    },
    {
        id: 2,
        authorName: "Tournament Admin",
        authorRole: "ADMIN",
        content:
            "Important announcement: registrations for the Spring Open close on Friday at 18:00. Please make sure your profile information is complete before registering.",
        createdAt: "5 hours ago",
        likesCount: 11,
        commentsCount: 3,
    },
];

type StoredUser = {
    username: string;
    email: string;
    role: string;
};

function FeedPage() {
    const [posts, setPosts] = useState<FeedPostType[]>(initialMockPosts);
    const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);

    const handleOpenCreatePostModal = () => {
        setIsCreatePostModalOpen(true);
    };

    const handleCloseCreatePostModal = () => {
        setIsCreatePostModalOpen(false);
    };

    const handleCreatePost = (postData: {
        content: string;
        imageFile: File | null;
    }) => {
        const storedUser = localStorage.getItem("user");
        const parsedUser: StoredUser | null = storedUser ? JSON.parse(storedUser) : null;

        const newPost: FeedPostType = {
            id: Date.now(),
            authorName: parsedUser?.username ?? "Player",
            authorRole: parsedUser?.role ?? "USER",
            content: postData.content,
            imageUrl: postData.imageFile
                ? URL.createObjectURL(postData.imageFile)
                : undefined,
            createdAt: "Just now",
            likesCount: 0,
            commentsCount: 0,
        };

        setPosts((previousPosts) => [newPost, ...previousPosts]);
    };

    return (
        <AuthenticatedLayout>
            <FeedPageWrapper>
                <FeedCenterColumn>
                    <FeedHero onCreatePost={handleOpenCreatePostModal} />

                    <PostsSection>
                        {posts.map((post) => (
                            <PostCard key={post.id} post={post} />
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