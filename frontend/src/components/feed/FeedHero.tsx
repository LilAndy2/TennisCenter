import { Add, FormatQuote } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import styled from "styled-components";
import {
    colors,
    spacing,
    fontSize,
    fontWeight,
    radius,
    shadow,
    transition,
    breakpoints,
} from "../../styles/theme";
import { GlassCard } from "../animated";

type FeedHeroProps = {
    onCreatePost: () => void;
};

function FeedHero({ onCreatePost }: FeedHeroProps) {
    return (
        <HeroWrapper>
            <HeroLeft>
                <QuoteIconWrapper>
                    <FormatQuote sx={{ fontSize: 28, color: colors.primary }} />
                </QuoteIconWrapper>

                <HeroTextSection>
                    <HeroTitle>
                        "Success in tennis doesn't come from a single shot, but from consistency."
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

const HeroWrapper = styled(GlassCard)`
    display: flex;
    justify-content: space-between;
    align-items: center;
    // gap: ${spacing.md};
    // padding: ${spacing.lg};
    // background: ${colors.surface};
    // border: 1px solid ${colors.borderGreenLight};
    // border-radius: ${radius.xl};
    // box-shadow: ${shadow.sm};

    @media (max-width: ${breakpoints.md}) {
        flex-direction: column;
        align-items: stretch;
    }
`;

const HeroLeft = styled(Box)`
    display: flex;
    align-items: center;
    gap: ${spacing.md};
`;

const QuoteIconWrapper = styled(Box)`
    width: 3rem;
    height: 3rem;
    border-radius: ${radius.md};
    background: ${colors.primaryLighter};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
`;

const HeroTextSection = styled(Box)`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
`;

const HeroTitle = styled(Typography)`
    font-size: ${fontSize.base} !important;
    font-weight: ${fontWeight.bold} !important;
    color: ${colors.textPrimary};
    line-height: 1.5 !important;
`;

const HeroSubtitle = styled(Typography)`
    font-size: ${fontSize.sm} !important;
    color: ${colors.textMuted};
`;

const CreatePostButton = styled.button`
    height: 2.85rem;
    padding: 0 ${spacing.md};
    border: none;
    border-radius: ${radius.pill};
    background: ${colors.primary};
    color: white;
    font-size: ${fontSize.base};
    font-weight: ${fontWeight.bold};
    display: flex;
    align-items: center;
    gap: 0.4rem;
    cursor: pointer;
    transition: all ${transition.normal};
    flex-shrink: 0;

    &:hover {
        background: ${colors.primaryHover};
        box-shadow: ${shadow.green};
    }

    &:active {
        transform: scale(0.97);
    }
`;