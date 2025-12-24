import { authClient } from "@/lib/auth-client";
import { Button, Card, CardBody, Input, Link, Tab, Tabs } from "@heroui/react";
import {
  Box,
  Delivery,
  GraphUp,
  Letter,
  LockPassword,
  Shop,
  User,
} from "@solar-icons/react";
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

    try {
      await authClient.signIn.email(
        {
          email: loginData.email,
          password: loginData.password,
        },
        {
          onSuccess: async () => {
            toast.success("Login realizado com sucesso!");
            // Force session refresh to ensure data is loaded
            try {
              const session = await authClient.getSession();
              console.log("Session after login:", session);

              if (!session.data?.user) {
                toast.warning(
                  "Sessão não encontrada. Verifique se seu email foi verificado."
                );
                setIsLoading(false);
                return;
              }
            } catch (e) {
              console.error("Error refreshing session:", e);
              toast.error("Erro ao obter sessão. Tente fazer login novamente.");
              setIsLoading(false);
              return;
            }
            // Wait a bit to ensure session is fully established before navigating
            setTimeout(() => {
              navigate("/companies");
            }, 300);
          },
          onError: (ctx: unknown) => {
            console.error("Sign in error:", ctx);

            // Tentar extrair a mensagem de erro de diferentes estruturas possíveis
            let errorMessage =
              "Erro ao fazer login. Verifique suas credenciais.";

            // Primeiro, tentar parsear responseText se existir (parece ser a estrutura usada pelo better-auth)
            const ctxObj = ctx as Record<string, unknown>;
            if (
              ctxObj?.responseText &&
              typeof ctxObj.responseText === "string"
            ) {
              try {
                const parsed = JSON.parse(ctxObj.responseText) as {
                  message?: string;
                  code?: string;
                };
                errorMessage = parsed.message || parsed.code || errorMessage;
                console.log("Parsed error from responseText:", errorMessage);
              } catch {
                // Se não for JSON, usar o texto direto
                errorMessage = ctxObj.responseText || errorMessage;
                console.log(
                  "Error parsing responseText, using raw:",
                  errorMessage
                );
              }
            } else if (ctxObj?.error) {
              // Estrutura: ctx.error.message ou ctx.error.code
              const errorObj = ctxObj.error as Record<string, unknown> | string;
              if (typeof errorObj === "object" && errorObj !== null) {
                errorMessage =
                  (errorObj.message as string) ||
                  (errorObj.code as string) ||
                  errorMessage;
                console.log("Extracted error from ctx.error:", errorMessage);
              } else {
                errorMessage = String(errorObj) || errorMessage;
              }
            } else if (ctxObj?.message) {
              // Estrutura: ctx.message
              errorMessage = String(ctxObj.message);
              console.log("Extracted error from ctx.message:", errorMessage);
            } else if (typeof ctx === "string") {
              // Estrutura: ctx é uma string
              errorMessage = ctx;
            }

            console.log("Final error message:", errorMessage);

            // Mensagens mais específicas para erros comuns
            const errorLower = errorMessage.toLowerCase();

            let toastMessage = "";
            if (
              errorLower.includes("invalid_email_or_password") ||
              errorLower.includes("invalid email or password") ||
              (errorLower.includes("email") && errorLower.includes("password"))
            ) {
              toastMessage = "Email ou senha incorretos.";
            } else if (
              errorLower.includes("verified") ||
              errorLower.includes("verification")
            ) {
              toastMessage =
                "Email não verificado. Verifique sua caixa de entrada.";
            } else if (errorLower.includes("password")) {
              toastMessage = "Senha incorreta.";
            } else if (errorLower.includes("email")) {
              toastMessage = "Email inválido ou não encontrado.";
            } else {
              // Exibir a mensagem de erro original
              toastMessage = errorMessage;
            }

            console.log("Showing toast with message:", toastMessage);
            toast.error(toastMessage);
            setIsLoading(false);
          },
        }
      );
    } catch (error) {
      console.error("Unexpected sign in error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro inesperado ao fazer login. Tente novamente."
      );
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (
      !registerData.name.trim() ||
      !registerData.email.trim() ||
      !registerData.password.trim() ||
      !registerData.confirmPassword.trim()
    ) {
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

    try {
      await authClient.signUp.email(
        {
          name: registerData.name,
          email: registerData.email,
          password: registerData.password,
        },
        {
          onSuccess: async () => {
            toast.success(
              "Conta criada com sucesso! Verifique seu email para ativar a conta."
            );
            // Forçar refresh da sessão
            try {
              await authClient.getSession();
            } catch (e) {
              console.error("Error refreshing session:", e);
            }
            // Redireciona para a página de empresas
            setTimeout(() => {
              navigate("/companies");
            }, 300);
          },
          onError: (ctx: unknown) => {
            console.error("Sign up error:", ctx);

            // Tentar extrair a mensagem de erro de diferentes estruturas possíveis
            let errorMessage = "Erro ao criar conta. Tente novamente.";

            // Primeiro, tentar parsear responseText se existir
            const ctxObj = ctx as Record<string, unknown>;
            if (
              ctxObj?.responseText &&
              typeof ctxObj.responseText === "string"
            ) {
              try {
                const parsed = JSON.parse(ctxObj.responseText) as {
                  message?: string;
                  code?: string;
                };
                errorMessage = parsed.message || parsed.code || errorMessage;
              } catch {
                errorMessage = ctxObj.responseText || errorMessage;
              }
            } else if (ctxObj?.error) {
              // Estrutura: ctx.error.message ou ctx.error.code
              const errorObj = ctxObj.error as Record<string, unknown> | string;
              if (typeof errorObj === "object" && errorObj !== null) {
                errorMessage =
                  (errorObj.message as string) ||
                  (errorObj.code as string) ||
                  errorMessage;
              } else {
                errorMessage = String(errorObj) || errorMessage;
              }
            } else if (ctxObj?.message) {
              // Estrutura: ctx.message
              errorMessage = String(ctxObj.message);
            } else if (typeof ctx === "string") {
              // Estrutura: ctx é uma string
              errorMessage = ctx;
            }

            toast.error(errorMessage);
            setIsLoading(false);
          },
        }
      );
    } catch (error) {
      console.error("Unexpected sign up error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro inesperado ao criar conta. Tente novamente."
      );
      setIsLoading(false);
    }
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
                <div className="text-sm text-primary-foreground/80">
                  Pedidos/mês
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">500+</div>
                <div className="text-sm text-primary-foreground/80">
                  Restaurantes
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">99%</div>
                <div className="text-sm text-primary-foreground/80">
                  Satisfação
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lado Direito - Formulário */}
        <div className="w-1/2 flex items-center justify-center dark:bg-default-10 bg-default-100 p-8">
          <Card className="w-full max-w-md">
            <CardBody className="px-6 py-6">
              <div className="flex flex-col items-center mb-6">
                <img
                  src={zapFoodLogo}
                  alt="Logo"
                  width={128}
                  className="mb-4"
                />
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
                      onValueChange={(value) =>
                        setLoginData({ ...loginData, email: value })
                      }
                      startContent={<Letter size={18} weight="Outline" />}
                      isRequired
                      size="lg"
                    />
                    <Input
                      label="Senha"
                      type="password"
                      placeholder="Digite sua senha"
                      value={loginData.password}
                      onValueChange={(value) =>
                        setLoginData({ ...loginData, password: value })
                      }
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
                      onValueChange={(value) =>
                        setRegisterData({ ...registerData, name: value })
                      }
                      startContent={<User size={18} weight="Outline" />}
                      isRequired
                      size="lg"
                    />
                    <Input
                      label="E-mail"
                      type="email"
                      placeholder="seu@email.com"
                      value={registerData.email}
                      onValueChange={(value) =>
                        setRegisterData({ ...registerData, email: value })
                      }
                      startContent={<Letter size={18} weight="Outline" />}
                      isRequired
                      size="lg"
                    />
                    <Input
                      label="Senha"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={registerData.password}
                      onValueChange={(value) =>
                        setRegisterData({ ...registerData, password: value })
                      }
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
                      onValueChange={(value) =>
                        setRegisterData({
                          ...registerData,
                          confirmPassword: value,
                        })
                      }
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
    </div>
  );
}
