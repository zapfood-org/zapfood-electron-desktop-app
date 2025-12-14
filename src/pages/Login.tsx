import { addToast, Button, Card, CardBody, Input, Link, Tab, Tabs } from "@heroui/react";
import { Box, Delivery, GraphUp, Letter, LockPassword, Shop, User } from "@solar-icons/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import zapFoodLogo from "../assets/images/ZapFoodLogo.png";
import { TitleBar } from "../components/title-bar";

export function LoginPage() {
    const navigate = useNavigate();
    const [selectedTab, setSelectedTab] = useState("login");

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

    const handleLogin = () => {
        if (!loginData.email.trim() || !loginData.password.trim()) {
            addToast({
                title: "Erro",
                description: "Por favor, preencha todos os campos",
                color: "danger",
            });
            return;
        }

        // Simulação de login - redireciona para o dashboard
        addToast({
            title: "Login realizado",
            description: "Bem-vindo de volta!",
            color: "success",
        });
        navigate("/1/dashboard");
    };

    const handleRegister = () => {
        if (!registerData.name.trim() || !registerData.email.trim() || !registerData.password.trim() || !registerData.confirmPassword.trim()) {
            addToast({
                title: "Erro",
                description: "Por favor, preencha todos os campos",
                color: "danger",
            });
            return;
        }

        if (registerData.password !== registerData.confirmPassword) {
            addToast({
                title: "Erro",
                description: "As senhas não coincidem",
                color: "danger",
            });
            return;
        }

        if (registerData.password.length < 6) {
            addToast({
                title: "Erro",
                description: "A senha deve ter pelo menos 6 caracteres",
                color: "danger",
            });
            return;
        }

        // Simulação de cadastro - redireciona para o dashboard
        addToast({
            title: "Conta criada",
            description: "Sua conta foi criada com sucesso!",
            color: "success",
        });
        navigate("/1/dashboard");
    };

    return (
        <div className="flex flex-col h-screen w-full">
            <TitleBar />
            <div className="flex flex-1 w-full overflow-hidden">
                {/* Lado Esquerdo - Design criativo */}
                <div className="w-1/2 bg-gradient-to-br from-primary via-primary-600 to-primary-800 flex items-center justify-center p-12 relative overflow-hidden">
                    {/* Elementos decorativos de fundo */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white rounded-full blur-3xl"></div>
                    </div>

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
                                                    addToast({
                                                        title: "Recuperar senha",
                                                        description: "Funcionalidade em desenvolvimento",
                                                        color: "default",
                                                    });
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
        </div>
    );
}
