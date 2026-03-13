import { motion } from "framer-motion";
import type { ReactNode } from "react";

type AuthAnimatedFormCardProps = {
    children: ReactNode;
};

function AuthAnimatedFormCard({ children }: AuthAnimatedFormCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 24, y: 6 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 14, y: -4 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
        >
            {children}
        </motion.div>
    );
}

export default AuthAnimatedFormCard;
