
import { Button, Card, CardBody, CardHeader, Chip, Divider, Input, Switch, Textarea } from "@heroui/react";
import { toast } from "react-toastify";
import { CheckCircle, Copy, PhoneCalling, Settings, TrashBinTrash } from "@solar-icons/react";
import { useState } from "react";
import { ScrollArea } from "../components/ui/scroll-area";

interface WhatsAppConfig {
    phoneNumber: string;
    apiToken: string;
    welcomeMessage: string;
    autoReply: boolean;
    autoReplyMessage: string;
    isActive: boolean;
}

export function WhatsAppPage() {
    const [config, setConfig] = useState<WhatsAppConfig>({
        phoneNumber: "",
        apiToken: "",
        welcomeMessage: "Olá! Bem-vindo ao nosso restaurante. Como posso ajudar você hoje?",
        autoReply: true,
        autoReplyMessage: "Obrigado pela sua mensagem! Nossa equipe entrará em contato em breve.",
        isActive: false,
    });

    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);

        // Validações
        if (!config.phoneNumber.trim()) {
            toast.error("Por favor, informe o número do WhatsApp Business");
            setIsSaving(false);
            return;
        }

        if (!config.apiToken.trim()) {
            toast.error("Por favor, informe o token da API");
            setIsSaving(false);
            return;
        }

        // Simulação de salvamento
        await new Promise(resolve => setTimeout(resolve, 1000));

        toast.success("As configurações do WhatsApp foram salvas com sucesso!");

        setIsSaving(false);
    };

    const handleTestConnection = () => {
        if (!config.phoneNumber.trim() || !config.apiToken.trim()) {
            toast.error("Por favor, preencha o número e o token antes de testar");
            return;
        }

        toast.info("Testando conexão. Verificando conexão com a API do WhatsApp...");

        // Simulação de teste
        setTimeout(() => {
            toast.success("A conexão com o WhatsApp foi estabelecida com sucesso!");
        }, 2000);
    };

    const handleCopyPhoneNumber = () => {
        if (config.phoneNumber) {
            navigator.clipboard.writeText(config.phoneNumber);
            navigator.clipboard.writeText(config.phoneNumber);
            toast.success("Número do WhatsApp copiado para a área de transferência");
        }
    }


    const handleReset = () => {
        setConfig({
            phoneNumber: "",
            apiToken: "",
            welcomeMessage: "Olá! Bem-vindo ao nosso restaurante. Como posso ajudar você hoje?",
            autoReply: true,
            autoReplyMessage: "Obrigado pela sua mensagem! Nossa equipe entrará em contato em breve.",
            isActive: false,
        });
        toast.info("Configuração resetada. As configurações foram restauradas aos valores padrão");
    };

    return (
        <div className="flex flex-col flex-1 h-full overflow-hidden">
            <div className="p-6">
                <h1 className="text-3xl font-bold">WhatsApp Bot</h1>
                <p className="text-sm text-default-500 mt-1">
                    Configure o bot de mensagens para receber pedidos pelo WhatsApp
                </p>
            </div>

            <Divider />

            <ScrollArea className="flex flex-col grow h-0 overflow-y-auto">
                <div className="flex flex-col flex-1 gap-6 p-6">
                    {/* Status Card */}
                    <Card>
                        <CardHeader className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <PhoneCalling size={24} weight="Outline" className="text-primary" />
                                <div>
                                    <h2 className="text-xl font-semibold">Status do Bot</h2>
                                    <p className="text-sm text-default-500">Ative ou desative o bot de mensagens</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Chip
                                    color={config.isActive ? "success" : "default"}
                                    variant="flat"
                                    size="sm"
                                >
                                    {config.isActive ? "Ativo" : "Inativo"}
                                </Chip>
                                <Switch
                                    isSelected={config.isActive}
                                    onValueChange={(value) => setConfig({ ...config, isActive: value })}
                                />
                            </div>
                        </CardHeader>
                    </Card>

                    {/* Configurações Principais */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <Settings size={24} weight="Outline" className="text-primary" />
                                <h2 className="text-xl font-semibold">Configurações Principais</h2>
                            </div>
                        </CardHeader>
                        <CardBody className="flex flex-col gap-4">
                            <Input
                                label="Número do WhatsApp Business"
                                placeholder="(11) 98765-4321"
                                value={config.phoneNumber}
                                onValueChange={(value) => setConfig({ ...config, phoneNumber: value })}
                                description="Número que será usado para receber pedidos"
                                startContent={<PhoneCalling size={18} weight="Outline" className="text-default-400" />}
                                endContent={
                                    config.phoneNumber && (
                                        <Button
                                            isIconOnly
                                            variant="light"
                                            size="sm"
                                            onPress={handleCopyPhoneNumber}
                                        >
                                            <Copy size={16} weight="Outline" />
                                        </Button>
                                    )
                                }
                            />

                            <Input
                                label="Token da API"
                                placeholder="Digite o token da API do WhatsApp"
                                value={config.apiToken}
                                onValueChange={(value) => setConfig({ ...config, apiToken: value })}
                                description="Token de autenticação fornecido pela API do WhatsApp"
                                type="password"
                            />

                            <div className="flex gap-2">
                                <Button
                                    color="primary"
                                    onPress={handleTestConnection}
                                    className="flex-1"
                                >
                                    Testar Conexão
                                </Button>
                                <Button
                                    color="primary"
                                    onPress={handleSave}
                                    isLoading={isSaving}
                                    startContent={!isSaving && <CheckCircle size={18} weight="Outline" />}
                                    className="flex-1"
                                >
                                    Salvar Configurações
                                </Button>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Mensagens */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-xl font-semibold">Mensagens Automáticas</h2>
                        </CardHeader>
                        <CardBody className="flex flex-col gap-4">
                            <Textarea
                                label="Mensagem de Boas-vindas"
                                placeholder="Digite a mensagem de boas-vindas"
                                value={config.welcomeMessage}
                                onValueChange={(value: string) => setConfig({ ...config, welcomeMessage: value })}
                                description="Mensagem enviada automaticamente quando um cliente inicia uma conversa"
                                minRows={3}
                            />

                            <div className="flex items-center justify-between p-4 rounded-lg bg-default-100">
                                <div className="flex flex-col flex-1">
                                    <span className="font-medium">Resposta Automática</span>
                                    <span className="text-sm text-default-500">
                                        Enviar resposta automática quando o bot não souber responder
                                    </span>
                                </div>
                                <Switch
                                    isSelected={config.autoReply}
                                    onValueChange={(value) => setConfig({ ...config, autoReply: value })}
                                />
                            </div>

                            {config.autoReply && (
                                <Textarea
                                    label="Mensagem de Resposta Automática"
                                    placeholder="Digite a mensagem de resposta automática"
                                    value={config.autoReplyMessage}
                                    onValueChange={(value: string) => setConfig({ ...config, autoReplyMessage: value })}
                                    description="Mensagem enviada quando o bot não conseguir responder"
                                    minRows={3}
                                />
                            )}
                        </CardBody>
                    </Card>

                    {/* Instruções */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-xl font-semibold">Como Funciona</h2>
                        </CardHeader>
                        <CardBody className="flex flex-col gap-3">
                            <div className="flex gap-3">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                                    1
                                </div>
                                <div>
                                    <p className="font-medium">Configure o número do WhatsApp Business</p>
                                    <p className="text-sm text-default-500">
                                        Use um número verificado pelo WhatsApp Business API
                                    </p>
                                </div>
                            </div>
                            <Divider />
                            <div className="flex gap-3">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                                    2
                                </div>
                                <div>
                                    <p className="font-medium">Obtenha o token da API</p>
                                    <p className="text-sm text-default-500">
                                        Gere um token de acesso na plataforma do WhatsApp Business
                                    </p>
                                </div>
                            </div>
                            <Divider />
                            <div className="flex gap-3">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                                    3
                                </div>
                                <div>
                                    <p className="font-medium">Personalize as mensagens</p>
                                    <p className="text-sm text-default-500">
                                        Configure as mensagens de boas-vindas e respostas automáticas
                                    </p>
                                </div>
                            </div>
                            <Divider />
                            <div className="flex gap-3">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                                    4
                                </div>
                                <div>
                                    <p className="font-medium">Ative o bot</p>
                                    <p className="text-sm text-default-500">
                                        Ative o bot para começar a receber pedidos pelo WhatsApp
                                    </p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Ações */}
                    <div className="flex justify-end gap-2">
                        <Button
                            color="danger"
                            startContent={<TrashBinTrash size={18} weight="Outline" />}
                            onPress={handleReset}
                        >
                            Resetar Configurações
                        </Button>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
