import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import type { PlayerProfile, MatchHistoryEntry, TitleFinal } from "../types/profile";

function usePlayerProfile(userId?: number) {
    const [profile, setProfile] = useState<PlayerProfile | null>(null);
    const [matchHistory, setMatchHistory] = useState<MatchHistoryEntry[]>([]);
    const [titlesAndFinals, setTitlesAndFinals] = useState<TitleFinal[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploadingImage, setUploadingImage] = useState(false);

    const resolvedUserId = userId ?? (() => {
        const stored = localStorage.getItem("user");
        if (stored) {
            const parsed = JSON.parse(stored);
            return parsed.id as number;
        }
        return null;
    })();

    const loadProfile = async () => {
        if (!resolvedUserId) return;
        try {
            setLoading(true);
            const profileUrl = userId
                ? `/player/profile/${resolvedUserId}`
                : "/player/profile/me";

            const [profileRes, historyRes, titlesRes] = await Promise.all([
                axiosInstance.get<PlayerProfile>(profileUrl),
                axiosInstance.get<MatchHistoryEntry[]>(
                    `/player/profile/${resolvedUserId}/match-history`
                ),
                axiosInstance.get<TitleFinal[]>(
                    `/player/profile/${resolvedUserId}/titles-finals`
                ),
            ]);

            setProfile(profileRes.data);
            setMatchHistory(historyRes.data);
            setTitlesAndFinals(titlesRes.data);
        } catch (error) {
            console.error("Failed to load profile", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, [resolvedUserId]);

    const uploadProfileImage = async (file: File) => {
        if (!resolvedUserId) return;
        try {
            setUploadingImage(true);
            const formData = new FormData();
            formData.append("image", file);
            const res = await axiosInstance.post<PlayerProfile>(
                `/player/profile/${resolvedUserId}/profile-image`,
                formData
            );
            setProfile(res.data);

            // Sync localStorage so navbar avatar updates immediately
            const stored = localStorage.getItem("user");
            if (stored) {
                const userData = JSON.parse(stored);
                userData.profileImageUrl = res.data.profileImageUrl
                    ? `http://localhost:8080${res.data.profileImageUrl}`
                    : null;
                localStorage.setItem("user", JSON.stringify(userData));
            }
        } catch (error) {
            console.error("Failed to upload profile image", error);
        } finally {
            setUploadingImage(false);
        }
    };

    const updateBio = async (bio: string) => {
        if (!resolvedUserId) return;
        try {
            const res = await axiosInstance.put<PlayerProfile>(
                `/player/profile/${resolvedUserId}`,
                { bio }
            );
            setProfile(res.data);
        } catch (error) {
            console.error("Failed to update bio", error);
        }
    };

    return {
        profile,
        matchHistory,
        titlesAndFinals,
        loading,
        uploadingImage,
        uploadProfileImage,
        updateBio,
        reload: loadProfile,
    };
}

export default usePlayerProfile;