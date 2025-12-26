import { authClient } from "@/lib/auth-client";
import { Button, Card, CardBody, Input, Link, Tab, Tabs } from "@heroui/react";
import { Eye, EyeClosed, Letter, LockPassword, User } from "@solar-icons/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { TitleBar } from "../components/title-bar";

import doodleBackgroundImage from "@/assets/images/doodle-seamless.png";
import zappyTextLogo from "@/assets/images/zappy-text.png";
import { FlickeringGrid } from "@/components/ui/shadcn-io/flickering-grid";

export function LoginPage() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

            setIsLoading(false);

            // Wait a bit to ensure cookies are saved and session is established
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Force session refresh to update the hook state
            try {
              await refetchSession();

              // Also try to get session directly to verify it's working
              const sessionCheck = await authClient.getSession();
              console.log("Session check after login:", sessionCheck);

              if (!sessionCheck.data && !sessionCheck.error) {
                console.warn(
                  "Session is null after login - cookies may not be saved yet"
                );
                // Try one more time after a longer delay
                await new Promise((resolve) => setTimeout(resolve, 500));
                const retrySession = await authClient.getSession();
                console.log("Retry session check:", retrySession);
              }
            } catch (e) {
              console.error("Error refetching session:", e);
            }

            // Navigate - the CompaniesLayout will verify the session
            navigate("/companies");
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
          <div
            className="absolute inset-0 z-0 opacity-25 bg-repeat"
            style={{
              backgroundImage: `url(${doodleBackgroundImage})`,
              backgroundRepeat: "repeat",
              backgroundSize: "500px 500px",
              backgroundPosition: "0 0",
            }}
            aria-hidden="true"
          ></div>
          <FlickeringGrid
            className="absolute inset-0 z-0"
            squareSize={4}
            gridGap={6}
            flickerChance={0.2}
            color="rgb(255, 255, 255)"
            maxOpacity={0.2}
          />

          <div className="flex flex-col items-center text-center text-white max-w-lg relative z-10 select-none">
            <img src={zappyTextLogo} alt="Logo" width={512} />
          </div>
        </div>

        {/* Lado Direito - Formulário */}
        <div className="w-1/2 flex items-center justify-center dark:bg-default-10 bg-default-100 p-8">
          <Card className="w-full max-w-md">
            <CardBody className="px-6 py-6">
              <div className="flex flex-col items-start mb-6">
                <h1 className="text-2xl font-bold">Bem-vindo ao ZappyFood</h1>
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
                      type={showLoginPassword ? "text" : "password"}
                      placeholder="Digite sua senha"
                      value={loginData.password}
                      onValueChange={(value) =>
                        setLoginData({ ...loginData, password: value })
                      }
                      startContent={<LockPassword size={18} weight="Outline" />}
                      endContent={
                        <button
                          className="focus:outline-none"
                          type="button"
                          onClick={() =>
                            setShowLoginPassword(!showLoginPassword)
                          }
                          aria-label={
                            showLoginPassword
                              ? "Ocultar senha"
                              : "Mostrar senha"
                          }
                        >
                          {showLoginPassword ? (
                            <EyeClosed size={18} className="text-default-400" />
                          ) : (
                            <Eye size={18} className="text-default-400" />
                          )}
                        </button>
                      }
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
                      type={showRegisterPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={registerData.password}
                      onValueChange={(value) =>
                        setRegisterData({ ...registerData, password: value })
                      }
                      startContent={<LockPassword size={18} weight="Outline" />}
                      endContent={
                        <button
                          className="focus:outline-none"
                          type="button"
                          onClick={() =>
                            setShowRegisterPassword(!showRegisterPassword)
                          }
                          aria-label={
                            showRegisterPassword
                              ? "Ocultar senha"
                              : "Mostrar senha"
                          }
                        >
                          {showRegisterPassword ? (
                            <EyeClosed size={18} className="text-default-400" />
                          ) : (
                            <Eye size={18} className="text-default-400" />
                          )}
                        </button>
                      }
                      isRequired
                      description="A senha deve ter pelo menos 6 caracteres"
                      size="lg"
                    />
                    <Input
                      label="Confirmar Senha"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Digite a senha novamente"
                      value={registerData.confirmPassword}
                      onValueChange={(value) =>
                        setRegisterData({
                          ...registerData,
                          confirmPassword: value,
                        })
                      }
                      startContent={<LockPassword size={18} weight="Outline" />}
                      endContent={
                        <button
                          className="focus:outline-none"
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          aria-label={
                            showConfirmPassword
                              ? "Ocultar senha"
                              : "Mostrar senha"
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeClosed size={18} className="text-default-400" />
                          ) : (
                            <Eye size={18} className="text-default-400" />
                          )}
                        </button>
                      }
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
