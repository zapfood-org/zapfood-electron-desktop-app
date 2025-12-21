import { Outlet, useNavigate } from "react-router-dom";
import { CompaniesSideMenu } from "../components/companies-side-menu";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { LoadingScreen } from "../components/LoadingScreen";

export function CompaniesLayout() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const { data } = await authClient.getSession();
                if (!data) {
                    navigate("/login");
                }
            } catch (error) {
                console.error("Session check failed", error);
                navigate("/login");
            } finally {
                setIsLoading(false);
            }
        };

        checkSession();
    }, [navigate]);

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <div className="flex flex-1 w-full h-full overflow-hidden">
            <CompaniesSideMenu />
            <div className="flex flex-1 flex-col overflow-hidden relative bg-background">
                <Outlet />
            </div>
        </div>
    );
}
