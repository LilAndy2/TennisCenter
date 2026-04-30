import { motion, AnimatePresence } from "framer-motion";
import styled from "styled-components";
import { fontSize, fontWeight } from "../../styles/theme";

type AnimatedBadgeProps = {
    count: number;
};

function AnimatedBadge({ count }: AnimatedBadgeProps) {
    return (
        <AnimatePresence>
            {count > 0 && (
                <BadgeWrapper
                    key="badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 20,
                    }}
                >
                    {count > 99 ? "99+" : count}
                </BadgeWrapper>
            )}
        </AnimatePresence>
    );
}

export default AnimatedBadge;

const BadgeWrapper = styled(motion.span)`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.25rem;
    height: 1.25rem;
    padding: 0 0.35rem;
    border-radius: 999px;
    background: #ef4444;
    color: white;
    font-size: ${fontSize.xs};
    font-weight: ${fontWeight.black};
    font-variant-numeric: tabular-nums;
    line-height: 1;
    position: absolute;
    top: -0.2rem;
    right: -0.3rem;
    pointer-events: none;
`;