import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

type PrivateRouteProps = {
    children: ReactNode;
};

function PrivateRoute({ children }: PrivateRouteProps) {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}

export default PrivateRoute;
