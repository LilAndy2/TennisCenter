import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

type PrivateRouteProps = {
    children: ReactNode;
    allowedRoles?: string[];
};

function PrivateRoute({ children, allowedRoles }: PrivateRouteProps) {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && allowedRoles.length > 0) {
        try {
            const user = JSON.parse(userStr);
            const userRoles: string[] = user.roles || [];
            const hasAccess = userRoles.some((role: string) =>
                allowedRoles.includes(role)
            );

            if (!hasAccess) {
                return <Navigate to="/feed" replace />;
            }
        } catch {
            return <Navigate to="/login" replace />;
        }
    }

    return <>{children}</>;
}

export default PrivateRoute;
