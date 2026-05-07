import { AnimatePresence } from "framer-motion";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import FeedPage from "./pages/FeedPage";
import TournamentsPage from "./pages/TournamentsPage";
import TournamentDetailsPage from "./pages/TournamentDetailsPage.tsx";
import SchedulePage from "./pages/SchedulePage";
import H2HPage from "./pages/H2HPage";
import AboutUsPage from "./pages/AboutUsPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import AdminDashboardPage from "./pages/AdminDashboardPage.tsx";
import AdminTournamentDetailsPage from "./pages/AdminTournamentDetailsPage.tsx";
import PrivateRoute from "./routes/PrivateRoute";
import LeaderboardPage from "./pages/LeaderboardPage.tsx";
import ChatPage from "./pages/ChatPage.tsx";

const GlobalStyle = createGlobalStyle`
    :root {
        --color-primary: #10b981;
        --color-primary-hover: #059669;
        --color-primary-light: #d1fae5;
        --color-primary-lighter: #ecfdf5;

        --color-text-primary: #111827;
        --color-text-secondary: #475569;
        --color-text-muted: #64748b;
        --color-text-hint: #94a3b8;

        --color-surface: #ffffff;
        --color-surface-hover: #f8fafc;
        --color-surface-alt: #f1f5f9;
        --color-border: #e5e7eb;
        --color-border-green: #d1fae5;

        --radius-sm: 0.5rem;
        --radius-md: 0.75rem;
        --radius-lg: 1rem;
        --radius-xl: 1.25rem;
        --radius-pill: 999px;

        --shadow-sm: 0 1px 4px rgba(15, 23, 42, 0.06);
        --shadow-md: 0 4px 16px rgba(15, 23, 42, 0.08);
        --shadow-lg: 0 8px 24px rgba(15, 23, 42, 0.10);

        --transition-fast: 0.15s ease;
        --transition-normal: 0.2s ease;

        --navbar-height: 4.25rem;
    }

    * {
        box-sizing: border-box;
    }

    body {
        margin: 0;
        font-family: Inter, "Segoe UI", system-ui, -apple-system, sans-serif;
        font-feature-settings: 'cv11', 'ss01';
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color: #0f172a;
        background: linear-gradient(180deg, #f0fdf4 0%, #f8fafc 40%);
        line-height: 1.6;
    }

    button, input, textarea, select {
        font-family: inherit;
    }
    
    html {
        scroll-behavior: smooth;
    }
    
    :focus-visible {
        outline: 2px solid #10b981;
        outline-offset: 2px;
    }
    
    .tabular-nums {
        font-variant-numeric: tabular-nums;
    }
    
    ::selection {
        background: #d1fae5;
        color: #065f46;
    }
    
    ::-webkit-scrollbar {
        width: 0.45rem;
        height: 0.45rem;
    }
    ::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 999px;
    }
    ::-webkit-scrollbar-track {
        background: transparent;
    }
    
    @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
    }
`;

function AnimatedRoutes() {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route
                    path="/feed"
                    element={
                        <PrivateRoute>
                            <FeedPage />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/tournaments"
                    element={
                        <PrivateRoute>
                            <TournamentsPage />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/tournaments/:id"
                    element={
                        <PrivateRoute>
                            <TournamentDetailsPage />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/schedule"
                    element={
                        <PrivateRoute>
                            <SchedulePage />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/h2h"
                    element={
                        <PrivateRoute>
                            <H2HPage />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/leaderboard"
                    element={
                        <PrivateRoute>
                            <LeaderboardPage />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/about-us"
                    element={
                        <PrivateRoute>
                            <AboutUsPage />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/profile"
                    element={
                        <PrivateRoute>
                            <ProfilePage />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/settings"
                    element={
                        <PrivateRoute>
                            <SettingsPage />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/admin"
                    element={
                        <PrivateRoute>
                            <AdminDashboardPage />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/admin/tournaments/:id"
                    element={
                        <PrivateRoute>
                            <AdminTournamentDetailsPage />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/chat"
                    element={
                        <PrivateRoute>
                            <ChatPage />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/chat/:conversationId"
                    element={
                        <PrivateRoute>
                            <ChatPage />
                        </PrivateRoute>
                    }
                />
            </Routes>
        </AnimatePresence>
    );
}

function App() {
    return (
        <BrowserRouter>
            <GlobalStyle />
            <AnimatedRoutes />
        </BrowserRouter>
    );
}

export default App;