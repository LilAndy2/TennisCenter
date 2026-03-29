import { Add, FormatQuote } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import styled from "styled-components";

type FeedHeroProps = {
    onCreatePost: () => void;
};

function FeedHero({ onCreatePost }: FeedHeroProps) {
    return (
        <HeroWrapper>
            <HeroLeft>
                <QuoteIconWrapper>
                    <FormatQuote sx={{ fontSize: 32, color: "#10b981" }} />
                </QuoteIconWrapper>

                <HeroTextSection>
                    <HeroTitle>
                        “Success in tennis doesn’t come from a single shot, but from consistency.”
                    </HeroTitle>
                    <HeroSubtitle>
                        Stay active, support your community, and share your tennis journey.
                    </HeroSubtitle>
                </HeroTextSection>
            </HeroLeft>

            <CreatePostButton onClick={onCreatePost}>
                <Add sx={{ fontSize: 20 }} />
                <span>Create post</span>
            </CreatePostButton>
        </HeroWrapper>
    );
}

export default FeedHero;

const HeroWrapper = styled(Box)`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #ffffff, #f0fdf4);
  border: 1px solid #bbf7d0;
  border-radius: 1.25rem;
  box-shadow: 0 0.75rem 2rem rgba(5, 150, 105, 0.08);

  @media (max-width: 56rem) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const HeroLeft = styled(Box)`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const QuoteIconWrapper = styled(Box)`
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 1rem;
  background: #ecfdf5;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const HeroTextSection = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const HeroTitle = styled(Typography)`
  font-size: 1.05rem !important;
  font-weight: 700 !important;
  color: #111827;
`;

const HeroSubtitle = styled(Typography)`
  font-size: 0.95rem !important;
  color: #64748b;
`;

const CreatePostButton = styled.button`
  height: 3rem;
  padding: 0 1.1rem;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  font-size: 0.95rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  cursor: pointer;
  transition: 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: linear-gradient(135deg, #059669, #047857);
  }
`;