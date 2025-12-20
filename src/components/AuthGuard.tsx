import { authClient } from "@/lib/auth-client";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import zapFoodLogo from "../assets/images/ZapFoodLogo.png";
import { Spinner } from "@heroui/react";

type AuthGuardProps = {
    children: React.ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
    const { data: session, isPending: isLoading } = authClient.useSession();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!isLoading) {
            if (!session) {
                // Se não tem sessão e não está no login, manda pro login
                if (location.pathname !== "/login") {
                    navigate("/login");
                }
            } else {
                // Se tem sessão e está no login, manda pro dashboard
                if (location.pathname === "/login" || location.pathname === "/") {
                    navigate("/1/dashboard"); // Redirecionamento padrão
                }
            }
        }
    }, [session, isLoading, navigate, location.pathname]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center bg-background gap-4">
                <img src={zapFoodLogo} alt="Logo" width={256} />
                <p className="text-sm text-muted-foreground">Iniciando sistema...</p>
                <Spinner />
            </div>
        );
    }

    // Se estamos no login e não tem sessão, renderiza o login (children será o Outlet ou LoginPage dependendo de como configurar)
    // Mas aqui o AuthGuard vai envolver as rotas protegidas?
    // O usuário pediu "Auto-login ao abrir o app".

    // Se não tem sessão e a rota é protegida (que não é login), o useEffect já vai ter redirecionado, mas precisamos evitar renderizar o children.
    if (!session && location.pathname !== "/login") {
        return null; // Ou loading spinner enquanto redireciona
    }

    return <>{children}</>;
}
