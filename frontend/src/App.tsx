import { AnimatePresence } from "framer-motion";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
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
import PrivateRoute from "./routes/PrivateRoute";
import AdminDashboardPage from "./pages/AdminDashboardPage.tsx";

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
            </Routes>
        </AnimatePresence>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AnimatedRoutes />
        </BrowserRouter>
    );
}

export default App;
