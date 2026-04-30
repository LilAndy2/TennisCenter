import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import type { ReactNode } from "react";

type AnimatedPageProps = {
    children: ReactNode;
};

const pageVariants: Variants = {
    initial: {
        opacity: 0,
        y: 12,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
        },
    },
    exit: {
        opacity: 0,
        y: -8,
        transition: {
            duration: 0.2,
            ease: [0.55, 0, 1, 0.45] as [number, number, number, number],
        },
    },
};

function AnimatedPage({ children }: AnimatedPageProps) {
    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ willChange: "opacity, transform" }}
        >
            {children}
        </motion.div>
    );
}

export default AnimatedPage;