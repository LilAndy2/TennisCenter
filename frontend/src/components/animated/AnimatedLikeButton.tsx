import { FavoriteBorder, Favorite } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import styled from "styled-components";
import { colors, transition } from "../../styles/theme";

type AnimatedLikeButtonProps = {
    liked: boolean;
    count: number;
    onClick: () => void;
};

function AnimatedLikeButton({ liked, count, onClick }: AnimatedLikeButtonProps) {
    return (
        <ButtonWrapper onClick={onClick} $liked={liked}>
            <IconContainer>
                <AnimatePresence mode="wait">
                    {liked ? (
                        <motion.div
                            key="filled"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 15,
                            }}
                            style={{ display: "flex" }}
                        >
                            <Favorite sx={{ fontSize: 20 }} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="outline"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.8 }}
                            transition={{ duration: 0.15 }}
                            style={{ display: "flex" }}
                        >
                            <FavoriteBorder sx={{ fontSize: 20 }} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Burst ring on like */}
                <AnimatePresence>
                    {liked && (
                        <BurstRing
                            initial={{ scale: 0, opacity: 1 }}
                            animate={{ scale: 2.2, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                        />
                    )}
                </AnimatePresence>
            </IconContainer>

            <Count $liked={liked}>{count}</Count>
        </ButtonWrapper>
    );
}

export default AnimatedLikeButton;

const ButtonWrapper = styled.button<{ $liked: boolean }>`
    display: flex;
    align-items: center;
    gap: 0.35rem;
    border: none;
    background: none;
    padding: 0.4rem 0.6rem;
    border-radius: 999px;
    cursor: pointer;
    color: ${({ $liked }) => ($liked ? "#ef4444" : colors.textMuted)};
    transition: color ${transition.normal}, background ${transition.normal};

    &:hover {
        background: ${({ $liked }) => ($liked ? "#fee2e210" : colors.surfaceAlt)};
    }

    &:active {
        transform: scale(0.95);
    }
`;

const IconContainer = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
`;

const BurstRing = styled(motion.div)`
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 2px solid #ef4444;
    pointer-events: none;
`;

const Count = styled.span<{ $liked: boolean }>`
    font-size: 0.85rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: ${({ $liked }) => ($liked ? "#ef4444" : colors.textMuted)};
`;