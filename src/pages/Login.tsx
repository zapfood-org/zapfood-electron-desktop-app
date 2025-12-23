import { authClient } from "@/lib/auth-client";
import { Button, Card, CardBody, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input, Link, Tab, Tabs } from "@heroui/react";
import { Box, Code, Delivery, GraphUp, Letter, LockPassword, Shop, User } from "@solar-icons/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import zapFoodLogo from "../assets/images/ZapFoodLogo.png";
import { TitleBar } from "../components/title-bar";

import { FlickeringGrid } from "@/components/ui/shadcn-io/flickering-grid";

export function LoginPage() {
    const navigate = useNavigate();
    const [selectedTab, setSelectedTab] = useState("login");
    const [isLoading, setIsLoading] = useState(false);
    const { refetch: refetchSession } = authClient.useSession();

    // Clear any cached session data when component mounts
    useEffect(() => {
        const clearSession = async () => {
            try {
                // Force a fresh session check
                await refetchSession();
            } catch (error) {
                // Ignore errors, just ensure we have fresh state
                console.error("Error clearing session cache:", error);
            }
        };
        clearSession();
    }, [refetchSession]);

    // Login state
    const [loginData, setLoginData] = useState({
        email: "",
        password: "",
    });

    // Register state
    const [registerData, setRegisterData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const handleLogin = async () => {
        if (!loginData.email.trim() || !loginData.password.trim()) {
            toast.error("Por favor, preencha todos os campos");
            return;
        }

        setIsLoading(true);

        await authClient.signIn.email({
            email: loginData.email,
            password: loginData.password,
        }, {
            onSuccess: async () => {
                toast.success("Login realizado com sucesso!");
                // Force session refresh to ensure data is loaded
                try {
                    await authClient.getSession();
                } catch (e) {
                    console.error("Error refreshing session:", e);
                }
                // Wait a bit to ensure session is fully established before navigating
                setTimeout(() => {
                    navigate("/companies");
                }, 300);
            },
            onError: (ctx) => {
                toast.error(ctx.error.message);
                setIsLoading(false);
            }
        });
    };

    const handleGoogleLogin = async () => {
        try {
            const callbackURL = "http://localhost:5173/auth-success";

            // O endpoint sign-in/social é POST. Precisamos fazer o request manual para pegar a URL de redirecionamento.
            const response = await fetch("http://localhost:8080/api/v1/auth/sign-in/social", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                // Importante para salvar o cookie de 'state' que o backend envia
                credentials: "include",
                body: JSON.stringify({
                    provider: "google",
                    callbackURL: callbackURL,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Erro ao iniciar login social");
            }

            if (data.url) {
                // Abrir a URL retornada (Google) no popup interno
                window.open(data.url, "_blank", "width=600,height=700");
            } else {
                toast.error("URL de redirecionamento não encontrada");
            }
        } catch (error: unknown) {
            console.error(error);
            toast.error("Erro ao conectar com o servidor");
        }
    };

    useEffect(() => {
        // Escutar sucesso da autenticação vindo do Main Process (Internal Popup Flow)
        // @ts-expect-error - window.electron exposed in preload
        const removeAuthListener = window.electron?.onAuthSuccess(async () => {
            console.log("Auth Success Event Received");
            try {
                // Forçar verificação da sessão agora que o popup fechou e o cookie deve estar lá
                const { data } = await authClient.getSession();
                if (data) {
                    toast.success("Login social realizado!");
                    navigate("/companies");
                } else {
                    console.warn("Session not found after auth-success event");
                    // Tentar novamente após um breve delay (race condition nos cookies)
                    setTimeout(async () => {
                        const retry = await authClient.getSession();
                        if (retry.data) {
                            toast.success("Login social realizado!");
                            navigate("/companies");
                        } else {
                            toast.error("Erro ao validar sessão. Tente novamente.");
                        }
                    }, 1000);
                }
            } catch (e) {
                console.error("Error fetching session:", e);
            }
        });

        // Escutar deep links vindos do Main Process (Legacy/Fallback)
        // @ts-expect-error - window.electron exposed in preload
        const removeDeepLinkListener = window.electron?.onDeepLink((url: string) => {
            console.log("Deep Link received:", url);
            // ... existing deep link logic ...
            authClient.getSession().then(({ data }) => {
                if (data) {
                    navigate("/companies");
                }
            });
        });

        return () => {
            removeAuthListener?.();
            removeDeepLinkListener?.();
        }
    }, [navigate]);




    const handleRegister = async () => {
        if (!registerData.name.trim() || !registerData.email.trim() || !registerData.password.trim() || !registerData.confirmPassword.trim()) {
            toast.error("Por favor, preencha todos os campos");
            return;
        }

        if (registerData.password !== registerData.confirmPassword) {
            toast.error("As senhas não coincidem");
            return;
        }

        if (registerData.password.length < 6) {
            toast.error("A senha deve ter pelo menos 6 caracteres");
            return;
        }

        setIsLoading(true);

        // Simula delay de rede
        setTimeout(() => {
            setIsLoading(false);
            toast.success("Conta criada com sucesso!");
            // Redireciona para a página de empresas
            navigate("/companies");
        }, 1500);
    };

    return (
        <div className="flex flex-col h-screen w-full">
            <TitleBar />
            <div className="flex flex-1 w-full overflow-hidden">
                {/* Lado Esquerdo - Design criativo */}
                <div className="w-1/2 bg-gradient-to-br from-primary via-primary-600 to-primary-800 flex items-center justify-center p-12 relative overflow-hidden">
                    <FlickeringGrid
                        className="absolute inset-0 z-0"
                        squareSize={4}
                        gridGap={6}
                        flickerChance={0.2}
                        color="rgb(255, 255, 255)"
                        maxOpacity={0.2}
                    />

                    <div className="flex flex-col items-center text-center text-white max-w-lg relative z-10">
                        <div className="mb-8">
                            <h1 className="text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-primary-100">
                                Bem-vindo ao ZapFood
                            </h1>
                            <p className="text-xl text-primary-foreground/90 mt-4">
                                Gerencie seu negócio de delivery de forma simples e eficiente
                            </p>
                        </div>

                        {/* Cards de features */}
                        <div className="grid grid-cols-2 gap-4 mt-8 w-full">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                                <div className="flex items-center justify-center mb-3">
                                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                        <Box size={24} weight="Bold" className="text-white" />
                                    </div>
                                </div>
                                <h3 className="text-sm font-semibold mb-1">Pedidos</h3>
                                <p className="text-xs text-primary-foreground/80">
                                    Controle total
                                </p>
                            </div>

                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                                <div className="flex items-center justify-center mb-3">
                                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                        <Shop size={24} weight="Bold" className="text-white" />
                                    </div>
                                </div>
                                <h3 className="text-sm font-semibold mb-1">Restaurantes</h3>
                                <p className="text-xs text-primary-foreground/80">
                                    Múltiplos locais
                                </p>
                            </div>

                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                                <div className="flex items-center justify-center mb-3">
                                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                        <Delivery size={24} weight="Bold" className="text-white" />
                                    </div>
                                </div>
                                <h3 className="text-sm font-semibold mb-1">Entregas</h3>
                                <p className="text-xs text-primary-foreground/80">
                                    Rastreamento em tempo real
                                </p>
                            </div>

                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                                <div className="flex items-center justify-center mb-3">
                                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                        <GraphUp size={24} weight="Bold" className="text-white" />
                                    </div>
                                </div>
                                <h3 className="text-sm font-semibold mb-1">Relatórios</h3>
                                <p className="text-xs text-primary-foreground/80">
                                    Análises detalhadas
                                </p>
                            </div>
                        </div>

                        {/* Estatísticas */}
                        <div className="flex gap-8 mt-8">
                            <div className="text-center">
                                <div className="text-3xl font-bold">10k+</div>
                                <div className="text-sm text-primary-foreground/80">Pedidos/mês</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold">500+</div>
                                <div className="text-sm text-primary-foreground/80">Restaurantes</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold">99%</div>
                                <div className="text-sm text-primary-foreground/80">Satisfação</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lado Direito - Formulário */}
                <div className="w-1/2 flex items-center justify-center dark:bg-default-10 bg-default-100 p-8">
                    <Card className="w-full max-w-md">
                        <CardBody className="px-6 py-6">
                            <div className="flex flex-col items-center mb-6">
                                <img src={zapFoodLogo} alt="Logo" width={128} className="mb-4" />
                            </div>
                            <Tabs
                                aria-label="Autenticação"
                                selectedKey={selectedTab}
                                onSelectionChange={(key) => setSelectedTab(key as string)}
                                className="w-full"
                                color="primary"
                            >
                                <Tab key="login" title="Entrar">
                                    <div className="flex flex-col gap-4 pt-4">
                                        <div className="flex flex-col gap-2">
                                            <Button
                                                variant="bordered"
                                                startContent={<img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />}
                                                onPress={handleGoogleLogin}
                                                className="w-full"
                                            >
                                                Entrar com Google
                                            </Button>
                                            <div className="relative flex items-center gap-2 my-2">
                                                <div className="h-px bg-default-200 flex-1" />
                                                <span className="text-xs text-default-400">ou com email</span>
                                                <div className="h-px bg-default-200 flex-1" />
                                            </div>
                                        </div>

                                        <Input
                                            label="E-mail"
                                            type="email"
                                            placeholder="seu@email.com"
                                            value={loginData.email}
                                            onValueChange={(value) => setLoginData({ ...loginData, email: value })}
                                            startContent={<Letter size={18} weight="Outline" />}
                                            isRequired
                                            size="lg"
                                        />
                                        <Input
                                            label="Senha"
                                            type="password"
                                            placeholder="Digite sua senha"
                                            value={loginData.password}
                                            onValueChange={(value) => setLoginData({ ...loginData, password: value })}
                                            startContent={<LockPassword size={18} weight="Outline" />}
                                            isRequired
                                            size="lg"
                                        />
                                        <div className="flex items-center justify-between">
                                            <Link
                                                size="sm"
                                                className="text-xs cursor-pointer"
                                                onPress={() => {
                                                    toast.info("Funcionalidade em desenvolvimento");
                                                }}
                                            >
                                                Esqueceu a senha?
                                            </Link>
                                        </div>
                                        <Button
                                            color="primary"
                                            size="lg"
                                            onPress={handleLogin}
                                            className="w-full font-semibold"
                                            isLoading={isLoading}
                                        >
                                            Entrar
                                        </Button>
                                    </div>
                                </Tab>

                                <Tab key="register" title="Cadastrar">
                                    <div className="flex flex-col gap-4 pt-4">
                                        <Input
                                            label="Nome Completo"
                                            placeholder="Seu nome completo"
                                            value={registerData.name}
                                            onValueChange={(value) => setRegisterData({ ...registerData, name: value })}
                                            startContent={<User size={18} weight="Outline" />}
                                            isRequired
                                            size="lg"
                                        />
                                        <Input
                                            label="E-mail"
                                            type="email"
                                            placeholder="seu@email.com"
                                            value={registerData.email}
                                            onValueChange={(value) => setRegisterData({ ...registerData, email: value })}
                                            startContent={<Letter size={18} weight="Outline" />}
                                            isRequired
                                            size="lg"
                                        />
                                        <Input
                                            label="Senha"
                                            type="password"
                                            placeholder="Mínimo 6 caracteres"
                                            value={registerData.password}
                                            onValueChange={(value) => setRegisterData({ ...registerData, password: value })}
                                            startContent={<LockPassword size={18} weight="Outline" />}
                                            isRequired
                                            description="A senha deve ter pelo menos 6 caracteres"
                                            size="lg"
                                        />
                                        <Input
                                            label="Confirmar Senha"
                                            type="password"
                                            placeholder="Digite a senha novamente"
                                            value={registerData.confirmPassword}
                                            onValueChange={(value) => setRegisterData({ ...registerData, confirmPassword: value })}
                                            startContent={<LockPassword size={18} weight="Outline" />}
                                            isRequired
                                            size="lg"
                                        />
                                        <Button
                                            color="primary"
                                            size="lg"
                                            onPress={handleRegister}
                                            className="w-full font-semibold"
                                            isLoading={isLoading}
                                        >
                                            Criar Conta
                                        </Button>
                                    </div>
                                </Tab>
                            </Tabs>
                        </CardBody>
                    </Card>
                </div>
            </div>

            {/* Botão de Teste - Acesso sem login */}
            <div className="absolute bottom-4 right-4">
                <Dropdown placement="top-end">
                    <DropdownTrigger>
                        <Button
                            isIconOnly
                            variant="flat"
                            color="default"
                            size="sm"
                            className="opacity-50 hover:opacity-100"
                            title="Acesso de teste (sem login)"
                        >
                            <Code size={20} />
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                        aria-label="Páginas de teste"
                        onAction={(key) => {
                            const routes: Record<string, string> = {
                                companies: "/companies",
                                dashboard: "/1/dashboard",
                                orders: "/1/orders",
                                products: "/1/products",
                                menus: "/1/menus",
                                tables: "/1/tables",
                                bills: "/1/bills",
                            };
                            const route = routes[key as string];
                            if (route) {
                                navigate(route);
                            }
                        }}
                    >
                        <DropdownItem key="companies">Empresas</DropdownItem>
                        <DropdownItem key="dashboard">Dashboard</DropdownItem>
                        <DropdownItem key="orders">Pedidos</DropdownItem>
                        <DropdownItem key="products">Produtos</DropdownItem>
                        <DropdownItem key="menus">Cardápios</DropdownItem>
                        <DropdownItem key="tables">Mesas</DropdownItem>
                        <DropdownItem key="bills">Comandas</DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>
        </div>
    );
}
