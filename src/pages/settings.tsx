
import { Button } from "@heroui/react";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { Divider } from "@heroui/react";
import { Input } from "@heroui/react";
import { Switch } from "@heroui/react";

export function SettingsPage() {
    return (
        <div className="flex flex-col flex-1 h-full overflow-hidden">
            <div className="p-6">
                <h1 className="text-3xl font-bold">Configurações</h1>
                <p className="text-sm text-default-500 mt-1">
                    Gerencie as configurações do sistema
                </p>
            </div>

            <Divider />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-6 overflow-y-auto">
                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-semibold">Informações Gerais</h2>
                    </CardHeader>
                    <CardBody className="flex flex-col gap-4">
                        <Input label="Nome da Empresa" placeholder="Digite o nome" />
                        <Input label="Email" type="email" placeholder="email@exemplo.com" />
                        <Input label="Telefone" placeholder="(11) 98765-4321" />
                        <Button color="primary">Salvar Alterações</Button>
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-semibold">Notificações</h2>
                    </CardHeader>
                    <CardBody className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="font-medium">Notificações por Email</span>
                                <span className="text-sm text-default-500">Receba notificações importantes</span>
                            </div>
                            <Switch defaultSelected />
                        </div>
                        <Divider />
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="font-medium">Notificações Push</span>
                                <span className="text-sm text-default-500">Notificações em tempo real</span>
                            </div>
                            <Switch defaultSelected />
                        </div>
                        <Divider />
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="font-medium">Notificações SMS</span>
                                <span className="text-sm text-default-500">Alertas por mensagem de texto</span>
                            </div>
                            <Switch />
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-semibold">Segurança</h2>
                    </CardHeader>
                    <CardBody className="flex flex-col gap-4">
                        <Input label="Senha Atual" type="password" placeholder="Digite sua senha" />
                        <Input label="Nova Senha" type="password" placeholder="Digite a nova senha" />
                        <Input label="Confirmar Senha" type="password" placeholder="Confirme a senha" />
                        <Button color="primary">Alterar Senha</Button>
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-semibold">Integrações</h2>
                    </CardHeader>
                    <CardBody className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="font-medium">API Gateway</span>
                                <span className="text-sm text-default-500">Conectado</span>
                            </div>
                            <Button size="sm" variant="flat">Configurar</Button>
                        </div>
                        <Divider />
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="font-medium">Pagamento</span>
                                <span className="text-sm text-default-500">Desconectado</span>
                            </div>
                            <Button size="sm" variant="flat">Conectar</Button>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
