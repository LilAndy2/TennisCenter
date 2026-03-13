import { EmojiEventsOutlined } from "@mui/icons-material";
import { AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";
import tennisAuthImage from "../../assets/img-auth.png";
import AuthButton from "./AuthButton";
import {
    HeroContent,
    HeroIconContainer,
    HeroSection,
} from "./AuthHero";
import {
    AuthContent,
    AuthFormCardWrapper,
    AuthPage,
    AuthRightSection,
    AuthTopBar,
    AuthTopBarLeft,
    AuthTopBarRight,
} from "./AuthLayout";
import AuthTabButton from "./AuthTabButton";
import {
    BrandMutedText,
    BrandText,
    HeroDescription,
    HeroTitle,
} from "./AuthText";
import AuthAnimatedHeroContent from "./AuthAnimatedHeroContent";
import AuthAnimatedFormCard from "./AuthAnimatedFormCard";
import { useNavigate } from "react-router-dom";

type AuthShellProps = {
    heroTitle: ReactNode;
    heroDescription: string;
    isLogin: boolean;
    formCard: ReactNode;
};

function AuthShell({
                       heroTitle,
                       heroDescription,
                       isLogin,
                       formCard,
                   }: AuthShellProps) {
    const navigate = useNavigate();

    return (
        <AuthPage>
            <AuthTopBar>
                <AuthTopBarLeft>
                    <EmojiEventsOutlined sx={{ color: "#34d399", fontSize: 32 }} />
                    <BrandMutedText>Tennis</BrandMutedText>
                    <BrandText>Local</BrandText>
                </AuthTopBarLeft>

                <AuthTopBarRight>
                    <AuthTabButton $active={isLogin} onClick={() => navigate("/login")}>
                        Log in
                    </AuthTabButton>
                    <AuthButton onClick={() => navigate("/register")}>Sign up</AuthButton>
                </AuthTopBarRight>
            </AuthTopBar>

            <AuthContent>
                <HeroSection backgroundimage={tennisAuthImage}>
                    <AnimatePresence mode="wait">
                        <AuthAnimatedHeroContent key={isLogin ? "login-hero" : "register-hero"}>
                            <HeroContent>
                                <HeroIconContainer>
                                    <EmojiEventsOutlined sx={{ color: "white", fontSize: 36 }} />
                                </HeroIconContainer>

                                <HeroTitle>{heroTitle}</HeroTitle>
                                <HeroDescription>{heroDescription}</HeroDescription>
                            </HeroContent>
                        </AuthAnimatedHeroContent>
                    </AnimatePresence>
                </HeroSection>

                <AuthRightSection>
                    <AuthFormCardWrapper>
                        <AnimatePresence mode="wait">
                            <AuthAnimatedFormCard key={isLogin ? "login-card" : "register-card"}>
                                {formCard}
                            </AuthAnimatedFormCard>
                        </AnimatePresence>
                    </AuthFormCardWrapper>
                </AuthRightSection>
            </AuthContent>
        </AuthPage>
    );
}

export default AuthShell;
