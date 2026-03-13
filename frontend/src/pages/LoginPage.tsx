import { Alert } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import AuthButton from "../components/auth/AuthButton";
import { AuthCard, AuthFieldsColumn, AuthTabsRow } from "../components/auth/AuthCard";
import { FieldLabel, FieldWrapper } from "../components/auth/AuthField";
import AuthInput from "../components/auth/AuthInput";
import AuthShell from "../components/auth/AuthShell";
import AuthTabButton from "../components/auth/AuthTabButton";
import {
    FooterText,
    FormSubtitle,
    FormTitle,
} from "../components/auth/AuthText";

type LoginFormData = {
    email: string;
    password: string;
};

type AuthResponse = {
    token: string;
    id: number;
    username: string;
    email: string;
    role: "ADMIN" | "PLAYER";
};

function LoginPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState<LoginFormData>({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (field: keyof LoginFormData, value: string) => {
        setFormData((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await axiosInstance.post<AuthResponse>("/auth/login", formData);
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data));
            navigate("/feed");
        } catch {
            setError("Email sau parolă incorecte.");
        } finally {
            setLoading(false);
        }
    };

    const formCard = (
        <AuthCard elevation={0}>
            <FormTitle>Welcome Back</FormTitle>
            <FormSubtitle>Enter your details to access your account</FormSubtitle>

            <AuthTabsRow>
                <AuthTabButton $active onClick={() => navigate("/login")}>
                    Login
                </AuthTabButton>
                <AuthTabButton $active={false} onClick={() => navigate("/register")}>
                    Register
                </AuthTabButton>
            </AuthTabsRow>

            <AuthFieldsColumn onSubmit={handleSubmit}>
                <FieldWrapper>
                    <FieldLabel>Email</FieldLabel>
                    <AuthInput
                        fullWidth
                        placeholder="Enter your email"
                        type="email"
                        value={formData.email}
                        onChange={(event) => handleChange("email", event.target.value)}
                    />
                </FieldWrapper>

                <FieldWrapper>
                    <FieldLabel>Password</FieldLabel>
                    <AuthInput
                        fullWidth
                        placeholder="Enter your password"
                        type="password"
                        value={formData.password}
                        onChange={(event) => handleChange("password", event.target.value)}
                    />
                </FieldWrapper>

                {error ? <Alert severity="error">{error}</Alert> : null}

                <AuthButton type="submit" fullWidth disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                </AuthButton>
            </AuthFieldsColumn>

            <FooterText>
                By continuing, you agree to our Terms of Service.
            </FooterText>
        </AuthCard>
    );

    return (
        <AuthShell
            isLogin
            heroTitle={
                <>
                    Compete. Connect.
                    <br />
                    Conquer.
                </>
            }
            heroDescription="Join the fastest growing local tennis community. Organize tournaments, find matches, and track your stats."
            formCard={formCard}
        />
    );
}

export default LoginPage;
