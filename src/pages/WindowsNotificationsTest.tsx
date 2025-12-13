import { ScrollArea } from "@/components/ui/scroll-area";
import { Button, Card, CardBody, CardHeader, Divider, Input } from "@heroui/react";
import { Bell } from "@solar-icons/react";
import { useState } from "react";

export function WindowsNotificationsTestPage() {
    const [title, setTitle] = useState("Teste de Notificação");
    const [body, setBody] = useState("Esta é uma notificação de teste do Windows enviada pelo ZapFood!");

    const handleSendNotification = () => {
        // Check if the browser supports notifications
        if (!("Notification" in window)) {
            alert("Este navegador não suporta notificações de desktop");
            return;
        }

        // Check whether notification permissions have already been granted
        if (Notification.permission === "granted") {
            new Notification(title, { body });
        } else if (Notification.permission !== "denied") {
            // We need to ask the user for permission
            Notification.requestPermission().then((permission) => {
                // If the user accepts, let's create a notification
                if (permission === "granted") {
                    new Notification(title, { body });
                }
            });
        }
    };

    return (
        <div className="flex flex-col flex-1 h-full">
            <div className="p-6">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Bell size={32} className="text-primary" />
                    Teste de Notificações
                </h1>
                <p className="text-default-500 mt-1">
                    Dispare notificações nativas do Windows para testar a integração.
                </p>
            </div>

            <Divider />

            <ScrollArea className="flex flex-col grow h-0 overflow-y-auto">
                <div className="p-6">
                    <Card className="max-w-md">
                        <CardHeader className="font-bold text-lg">
                            Configurar Notificação
                        </CardHeader>
                        <CardBody className="flex flex-col gap-4">
                            <Input
                                label="Título"
                                placeholder="Digite o título da notificação"
                                value={title}
                                onValueChange={setTitle}
                            />
                            <Input
                                label="Corpo da Mensagem"
                                placeholder="Digite a mensagem da notificação"
                                value={body}
                                onValueChange={setBody}
                            />
                            <Button
                                color="primary"
                                endContent={<Bell />}
                                onPress={handleSendNotification}
                            >
                                Enviar Notificação
                            </Button>
                        </CardBody>
                    </Card>
                </div>
            </ScrollArea>
        </div>
    );
}
