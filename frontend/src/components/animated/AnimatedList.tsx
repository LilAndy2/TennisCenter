import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import type { ReactNode, CSSProperties } from "react";

type AnimatedListProps = {
    children: ReactNode;
    className?: string;
    style?: CSSProperties;
};

type AnimatedListItemProps = {
    children: ReactNode;
    className?: string;
};

const containerVariants: Variants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.04,
        },
    },
};

const itemVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 16,
        scale: 0.97,
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring" as const,
            stiffness: 300,
            damping: 24,
        },
    },
};

export function AnimatedList({ children, className, style }: AnimatedListProps) {
    return (
        <motion.div
            className={className}
            style={style}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {children}
        </motion.div>
    );
}

export function AnimatedListItem({ children, className }: AnimatedListItemProps) {
    return (
        <motion.div
            className={className}
            variants={itemVariants}
        >
            {children}
        </motion.div>
    );
}