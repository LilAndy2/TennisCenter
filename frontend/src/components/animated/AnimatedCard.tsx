import { motion } from "framer-motion";
import type { ReactNode } from "react";
import styled from "styled-components";
import { colors, radius, transition } from "../../styles/theme";

type AnimatedCardProps = {
    children: ReactNode;
    index?: number;
    onClick?: () => void;
    className?: string;
};

function AnimatedCard({ children, index = 0, onClick, className }: AnimatedCardProps) {
    return (
        <StyledMotionDiv
            className={className}
            onClick={onClick}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                type: "spring",
                stiffness: 260,
                damping: 24,
                delay: index * 0.04, // 40ms stagger per item
            }}
            whileHover={{
                y: -4,
                transition: { type: "spring", stiffness: 400, damping: 20 },
            }}
            whileTap={{ scale: 0.98 }}
        >
            {children}
        </StyledMotionDiv>
    );
}

export default AnimatedCard;

const StyledMotionDiv = styled(motion.div)`
    border-radius: ${radius.xl};
    cursor: ${({ onClick }) => (onClick ? "pointer" : "default")};
    will-change: transform, opacity;
    
    position: relative;

    &::after {
        content: "";
        position: absolute;
        inset: -1px;
        border-radius: inherit;
        border: 2px solid transparent;
        transition: border-color ${transition.normal};
        pointer-events: none;
    }

    &:hover::after {
        border-color: ${colors.primaryLight};
    }
`;