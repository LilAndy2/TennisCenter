import { motion } from "framer-motion";
import type { ReactNode } from "react";

type AuthAnimatedHeroContentProps = {
    children: ReactNode;
};

function AuthAnimatedHeroContent({ children }: AuthAnimatedHeroContentProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
        >
            {children}
        </motion.div>
    );
}

export default AuthAnimatedHeroContent;
