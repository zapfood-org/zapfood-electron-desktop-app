import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { CompaniesSideMenu } from "../components/companies-side-menu";
import { LoadingScreen } from "../components/LoadingScreen";

export function CompaniesLayout() {
    const navigate = useNavigate();
    const { data: session, isPending: isLoadingSession, refetch: refetchSession } = authClient.useSession();
    const [hasWaited, setHasWaited] = useState(false);

    // Give a small delay after mount to allow session to be established after login
    useEffect(() => {
        // Reset state when component mounts
        setHasWaited(false);
        
        // Force refetch session on mount to ensure fresh data
        const initialize = async () => {
            try {
                await refetchSession();
            } catch (error) {
                console.error("Error refetching session:", error);
            }
        };
        
        initialize();
        
        const timer = setTimeout(() => {
            setHasWaited(true);
        }, 300);
        return () => clearTimeout(timer);
    }, [refetchSession]);

    useEffect(() => {
        // Only redirect if we've waited and session is confirmed missing
        if (hasWaited && !isLoadingSession && !session) {
            navigate("/login");
        }
    }, [session, isLoadingSession, hasWaited, navigate]);

    // Show loading while waiting or if session is still loading
    if (isLoadingSession || !hasWaited) {
        return <LoadingScreen />;
    }

    // If no session after waiting, don't render (will redirect)
    if (!session) {
        return null;
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
