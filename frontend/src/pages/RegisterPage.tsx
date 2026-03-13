import { Alert } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import AuthButton from "../components/auth/AuthButton";
import {
    AuthCard,
    AuthFieldsColumn,
    AuthRow,
    AuthTabsRow,
} from "../components/auth/AuthCard";
import { FieldLabel, FieldWrapper } from "../components/auth/AuthField";
import AuthInput from "../components/auth/AuthInput";
import AuthShell from "../components/auth/AuthShell";
import AuthTabButton from "../components/auth/AuthTabButton";
import {
    FooterText,
    FormSubtitle,
    FormTitle,
} from "../components/auth/AuthText";

type RegisterFormData = {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
};

type AuthResponse = {
    token: string;
    id: number;
    username: string;
    email: string;
    role: "ADMIN" | "PLAYER";
};

function RegisterPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState<RegisterFormData>({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (field: keyof RegisterFormData, value: string) => {
        setFormData((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Parolele nu coincid.");
            return;
        }

        setLoading(true);

        try {
            const response = await axiosInstance.post<AuthResponse>("/auth/register", {
                firstName: formData.firstName,
                lastName: formData.lastName,
                username: formData.username,
                email: formData.email,
                password: formData.password,
            });

            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data));
            navigate("/feed");
        } catch {
            setError("Înregistrarea a eșuat. Verifică datele introduse.");
        } finally {
            setLoading(false);
        }
    };

    const formCard = (
        <AuthCard elevation={0}>
            <FormTitle>Create Account</FormTitle>
            <FormSubtitle>Enter your details to create your account</FormSubtitle>

            <AuthTabsRow>
                <AuthTabButton $active={false} onClick={() => navigate("/login")}>
                    Login
                </AuthTabButton>
                <AuthTabButton $active onClick={() => navigate("/register")}>
                    Register
                </AuthTabButton>
            </AuthTabsRow>

            <AuthFieldsColumn onSubmit={handleSubmit}>
                <AuthRow>
                    <FieldWrapper>
                        <FieldLabel>First name</FieldLabel>
                        <AuthInput
                            fullWidth
                            placeholder="Enter first name"
                            value={formData.firstName}
                            onChange={(event) => handleChange("firstName", event.target.value)}
                        />
                    </FieldWrapper>

                    <FieldWrapper>
                        <FieldLabel>Last name</FieldLabel>
                        <AuthInput
                            fullWidth
                            placeholder="Enter last name"
                            value={formData.lastName}
                            onChange={(event) => handleChange("lastName", event.target.value)}
                        />
                    </FieldWrapper>
                </AuthRow>

                <FieldWrapper>
                    <FieldLabel>Username</FieldLabel>
                    <AuthInput
                        fullWidth
                        placeholder="Choose your username"
                        value={formData.username}
                        onChange={(event) => handleChange("username", event.target.value)}
                    />
                </FieldWrapper>

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

                <FieldWrapper>
                    <FieldLabel>Confirm password</FieldLabel>
                    <AuthInput
                        fullWidth
                        placeholder="Confirm your password"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(event) => handleChange("confirmPassword", event.target.value)}
                    />
                </FieldWrapper>

                {error ? <Alert severity="error">{error}</Alert> : null}

                <AuthButton type="submit" fullWidth disabled={loading}>
                    {loading ? "Creating account..." : "Sign Up"}
                </AuthButton>
            </AuthFieldsColumn>

            <FooterText>
                By continuing, you agree to our Terms of Service.
            </FooterText>
        </AuthCard>
    );

    return (
        <AuthShell
            isLogin={false}
            heroTitle={
                <>
                    Join. Play.
                    <br />
                    Improve.
                </>
            }
            heroDescription="Create your account and become part of your local tennis community. Track your results, enter tournaments, and build your profile."
            formCard={formCard}
        />
    );
}

export default RegisterPage;
