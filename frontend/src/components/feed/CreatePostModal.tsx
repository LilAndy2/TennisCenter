import {
    AddPhotoAlternateOutlined,
    Close,
    DeleteOutline,
} from "@mui/icons-material";
import {
    Avatar,
    Box,
    Dialog,
    DialogContent,
    IconButton,
    Typography,
} from "@mui/material";
import { useMemo, useRef, useState } from "react";
import styled from "styled-components";

type StoredUser = {
    username: string;
    email: string;
    role: string;
    profileImageUrl?: string;
};

type CreatePostModalProps = {
    open: boolean;
    onClose: () => void;
    onSubmit: (postData: { content: string; imageFile: File | null }) => void;
};

function CreatePostModal({ open, onClose, onSubmit }: CreatePostModalProps) {
    const storedUser = localStorage.getItem("user");
    const parsedUser: StoredUser | null = useMemo(
        () => (storedUser ? JSON.parse(storedUser) : null),
        [storedUser]
    );

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [content, setContent] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");

    const resetForm = () => {
        setContent("");
        setImageFile(null);
        setImagePreviewUrl("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleOpenFilePicker = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];

        if (!selectedFile) {
            return;
        }

        setImageFile(selectedFile);
        setImagePreviewUrl(URL.createObjectURL(selectedFile));
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreviewUrl("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = () => {
        if (!content.trim() && !imageFile) {
            return;
        }

        onSubmit({
            content: content.trim(),
            imageFile,
        });

        resetForm();
        onClose();
    };

    return (
        <StyledDialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogContentWrapper>
                <HeaderRow>
                    <HeaderTitle>Create post</HeaderTitle>

                    <IconButton onClick={handleClose}>
                        <Close />
                    </IconButton>
                </HeaderRow>

                <UserRow>
                    {parsedUser?.profileImageUrl ? (
                        <StyledAvatar src={parsedUser.profileImageUrl} alt="Profile" />
                    ) : (
                        <StyledAvatar />
                    )}

                    <UserInfo>
                        <UserName>{parsedUser?.username ?? "Player"}</UserName>
                        <UserMeta>{parsedUser?.role ?? "USER"}</UserMeta>
                    </UserInfo>
                </UserRow>

                <StyledTextArea
                    placeholder="What would you like to share with the tennis community?"
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                />

                {imagePreviewUrl ? (
                    <ImagePreviewSection>
                        <PreviewImage src={imagePreviewUrl} alt="Selected post preview" />

                        <RemoveImageButton onClick={handleRemoveImage}>
                            <DeleteOutline sx={{ fontSize: 18 }} />
                            <span>Remove image</span>
                        </RemoveImageButton>
                    </ImagePreviewSection>
                ) : null}

                <HiddenInput
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                />

                <BottomRow>
                    <LeftActions>
                        <UploadImageButton type="button" onClick={handleOpenFilePicker}>
                            <AddPhotoAlternateOutlined sx={{ fontSize: 20 }} />
                            <span>Add photo</span>
                        </UploadImageButton>
                    </LeftActions>

                    <RightActions>
                        <CancelButton type="button" onClick={handleClose}>
                            Cancel
                        </CancelButton>

                        <PostButton
                            type="button"
                            onClick={handleSubmit}
                            disabled={!content.trim() && !imageFile}
                        >
                            Post
                        </PostButton>
                    </RightActions>
                </BottomRow>
            </DialogContentWrapper>
        </StyledDialog>
    );
}

export default CreatePostModal;

const StyledDialog = styled(Dialog)`
  .MuiPaper-root {
    border-radius: 1.25rem;
    box-shadow: 0 1.25rem 3.75rem rgba(15, 23, 42, 0.18);
  }
`;

const DialogContentWrapper = styled(DialogContent)`
  padding: 1.25rem !important;
`;

const HeaderRow = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const HeaderTitle = styled(Typography)`
  font-size: 1.25rem !important;
  font-weight: 800 !important;
  color: #111827;
`;

const UserRow = styled(Box)`
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 1rem;
`;

const StyledAvatar = styled(Avatar)`
  width: 3rem !important;
  height: 3rem !important;
  background: #e2e8f0 !important;
`;

const UserInfo = styled(Box)`
  display: flex;
  flex-direction: column;
`;

const UserName = styled(Typography)`
  font-size: 0.96rem !important;
  font-weight: 700 !important;
  color: #111827;
`;

const UserMeta = styled(Typography)`
  font-size: 0.82rem !important;
  color: #64748b;
`;

const StyledTextArea = styled.textarea`
  width: 95%;
  min-height: 9rem;
  resize: none;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  padding: 1rem;
  font-family: Inter, Arial, sans-serif;
  font-size: 0.98rem;
  color: #111827;
  outline: none;
  transition: 0.2s ease;
  background: #ffffff;

  &:focus {
    border-color: #10b981;
    box-shadow: 0 0 0 0.25rem rgba(16, 185, 129, 0.12);
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const ImagePreviewSection = styled(Box)`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const PreviewImage = styled.img`
  width: 100%;
  max-height: 22rem;
  object-fit: cover;
  border-radius: 1rem;
  border: 1px solid #e5e7eb;
`;

const RemoveImageButton = styled.button`
  width: fit-content;
  height: 2.5rem;
  padding: 0 0.95rem;
  border: none;
  border-radius: 999px;
  background: #fef2f2;
  color: #dc2626;
  font-size: 0.9rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  cursor: pointer;
  transition: 0.2s ease;

  &:hover {
    background: #fee2e2;
  }
`;

const BottomRow = styled(Box)`
  margin-top: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  @media (max-width: 40rem) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const LeftActions = styled(Box)`
  display: flex;
  align-items: center;
`;

const RightActions = styled(Box)`
  display: flex;
  align-items: center;
  gap: 0.75rem;

  @media (max-width: 40rem) {
    width: 100%;
  }
`;

const UploadImageButton = styled.button`
  height: 2.8rem;
  padding: 0 1rem;
  border: none;
  border-radius: 999px;
  background: #ecfdf5;
  color: #059669;
  font-size: 0.92rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  cursor: pointer;
  transition: 0.2s ease;

  &:hover {
    background: #d1fae5;
  }
`;

const CancelButton = styled.button`
  height: 2.8rem;
  padding: 0 1rem;
  border: none;
  border-radius: 999px;
  background: #f1f5f9;
  color: #334155;
  font-size: 0.92rem;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;

  &:hover {
    background: #e2e8f0;
  }

  @media (max-width: 40rem) {
    flex: 1;
  }
`;

const PostButton = styled.button`
  height: 2.8rem;
  padding: 0 1.1rem;
  border: none;
  border-radius: 999px;
  background: #10b981;
  color: white;
  font-size: 0.92rem;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;

  &:hover:not(:disabled) {
    background: #059669;
  }

  &:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
  }

  @media (max-width: 40rem) {
    flex: 1;
  }
`;