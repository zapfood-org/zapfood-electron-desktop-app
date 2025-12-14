
import { Button, Card, CardBody, CardHeader, Chip, DatePicker, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, useDisclosure } from "@heroui/react";
import { toast } from "react-toastify";
import { AddCircle, Bell } from "@solar-icons/react";
import { CalendarDateTime } from "@internationalized/date";
import { useState } from "react";

export function PushNotificationsPage() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [sendDate, setSendDate] = useState<CalendarDateTime | null>(null);

    const handleSend = (onClose: () => void) => {
        toast.success("A notificação foi enviada com sucesso!");
        setSendDate(null);
        onClose();
    };

    return (
        <div className="flex flex-col flex-1 h-full overflow-hidden">
            <div className="flex items-center justify-between p-6">
                <div>
                    <h1 className="text-3xl font-bold">Notificações Push</h1>
                    <p className="text-sm text-default-500 mt-1">
                        Envie notificações para seus clientes
                    </p>
                </div>
                <Button color="primary" startContent={<AddCircle size={20} weight="Outline" />} onPress={onOpen}>
                    Nova Notificação
                </Button>
            </div>

            <Divider />

            <div className="grid grid-cols-1 gap-4 p-6 overflow-y-auto">
                {[
                    { title: "Promoção de Verão", status: "enviada", date: "Hoje, 14:30", recipients: 1250 },
                    { title: "Novo Restaurante", status: "agendada", date: "Amanhã, 10:00", recipients: 890 },
                    { title: "Cupom Especial", status: "enviada", date: "Ontem, 16:45", recipients: 2100 },
                ].map((notification, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Bell size={20} weight="Outline" className="text-primary" />
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="text-lg font-semibold">{notification.title}</h3>
                                        <p className="text-sm text-default-500">{notification.date}</p>
                                    </div>
                                </div>
                                <Chip
                                    size="sm"
                                    color={notification.status === "enviada" ? "success" : "warning"}
                                    variant="flat"
                                >
                                    {notification.status}
                                </Chip>
                            </div>
                        </CardHeader>
                        <CardBody>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-default-500">
                                    {notification.recipients.toLocaleString()} destinatários
                                </span>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="flat">
                                        Ver Detalhes
                                    </Button>
                                    <Button size="sm" variant="bordered">
                                        Duplicar
                                    </Button>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>

            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                backdrop="blur"
                size="2xl"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <h2 className="text-2xl font-bold">Nova Notificação Push</h2>
                                <p className="text-sm text-default-500 font-normal">
                                    Crie e envie uma notificação para seus clientes
                                </p>
                            </ModalHeader>
                            <ModalBody>
                                <div className="flex flex-col gap-4">
                                    <Input
                                        label="Título"
                                        placeholder="Título da notificação"
                                        isRequired
                                    />
                                    <Input
                                        label="Mensagem"
                                        placeholder="Conteúdo da notificação"
                                        isRequired
                                    />
                                    <Select
                                        label="Público-alvo"
                                        placeholder="Selecione o público"
                                        isRequired
                                    >
                                        <SelectItem key="all">Todos os clientes</SelectItem>
                                        <SelectItem key="active">Clientes ativos</SelectItem>
                                        <SelectItem key="inactive">Clientes inativos</SelectItem>
                                    </Select>
                                    <DatePicker
                                        label="Data de Envio"
                                        value={sendDate}
                                        onChange={setSendDate}
                                        granularity="minute"
                                        firstDayOfWeek="mon"
                                        description="Deixe em branco para enviar agora"
                                    />
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>
                                    Cancelar
                                </Button>
                                <Button color="primary" onPress={() => handleSend(onClose)}>
                                    Enviar
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
