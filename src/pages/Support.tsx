
import { Button, Card, CardBody, CardHeader, Chip, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, useDisclosure } from "@heroui/react";
import { AddCircle, HeadphonesRoundSound, PhoneCalling } from "@solar-icons/react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

export function SupportPage() {
    const { tenantId } = useParams<{ tenantId: string }>();
    const navigate = useNavigate();
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const handleCreate = (onClose: () => void) => {
        toast.success("O ticket de suporte foi criado com sucesso!");
        onClose();
    };

    const handleNavigateToCustomerService = () => {
        navigate(`/${tenantId}/customer-service`);
    };

    return (
        <div className="flex flex-col flex-1 h-full overflow-hidden">
            <div className="flex items-center justify-between p-6">
                <div>
                    <h1 className="text-3xl font-bold">Suporte</h1>
                    <p className="text-sm text-default-500 mt-1">
                        Central de atendimento e tickets
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        color="primary"
                        variant="bordered"
                        startContent={<PhoneCalling size={20} weight="Outline" />}
                        onPress={handleNavigateToCustomerService}
                    >
                        Atendimento
                    </Button>
                    <Button color="primary" startContent={<AddCircle size={20} weight="Outline" />} onPress={onOpen}>
                        Novo Ticket
                    </Button>
                </div>
            </div>

            <Divider />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 overflow-y-auto">
                {[
                    { id: "#001", subject: "Problema com pagamento", status: "aberto", priority: "alta", date: "Hoje, 10:30" },
                    { id: "#002", subject: "Dúvida sobre comissões", status: "em andamento", priority: "média", date: "Ontem, 14:20" },
                    { id: "#003", subject: "Solicitação de recurso", status: "resolvido", priority: "baixa", date: "2 dias atrás" },
                ].map((ticket, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <HeadphonesRoundSound size={20} weight="Outline" className="text-primary" />
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="text-lg font-semibold">{ticket.subject}</h3>
                                        <p className="text-sm text-default-500">{ticket.id} • {ticket.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Chip
                                        size="sm"
                                        color={
                                            ticket.priority === "alta"
                                                ? "danger"
                                                : ticket.priority === "média"
                                                    ? "warning"
                                                    : "default"
                                        }
                                        variant="flat"
                                    >
                                        {ticket.priority}
                                    </Chip>
                                    <Chip
                                        size="sm"
                                        color={
                                            ticket.status === "resolvido"
                                                ? "success"
                                                : ticket.status === "em andamento"
                                                    ? "warning"
                                                    : "primary"
                                        }
                                        variant="flat"
                                    >
                                        {ticket.status}
                                    </Chip>
                                </div>
                            </div>
                        </CardHeader>
                        <CardBody>
                            <div className="flex gap-2">
                                <Button size="sm" variant="flat" className="flex-1">
                                    Ver Detalhes
                                </Button>
                                <Button size="sm" variant="bordered" className="flex-1">
                                    Responder
                                </Button>
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
                                <h2 className="text-2xl font-bold">Novo Ticket de Suporte</h2>
                                <p className="text-sm text-default-500 font-normal">
                                    Abra um novo ticket para suporte
                                </p>
                            </ModalHeader>
                            <ModalBody>
                                <div className="flex flex-col gap-4">
                                    <Input
                                        label="Assunto"
                                        placeholder="Descreva brevemente o problema"
                                        isRequired
                                    />
                                    <Select
                                        label="Prioridade"
                                        placeholder="Selecione a prioridade"
                                        isRequired
                                    >
                                        <SelectItem key="low">Baixa</SelectItem>
                                        <SelectItem key="medium">Média</SelectItem>
                                        <SelectItem key="high">Alta</SelectItem>
                                    </Select>
                                    <Select
                                        label="Categoria"
                                        placeholder="Selecione a categoria"
                                        isRequired
                                    >
                                        <SelectItem key="payment">Pagamento</SelectItem>
                                        <SelectItem key="technical">Técnico</SelectItem>
                                        <SelectItem key="billing">Faturamento</SelectItem>
                                        <SelectItem key="other">Outro</SelectItem>
                                    </Select>
                                    <Input
                                        label="Descrição"
                                        placeholder="Descreva o problema em detalhes"
                                        isRequired
                                    />
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>
                                    Cancelar
                                </Button>
                                <Button color="primary" onPress={() => handleCreate(onClose)}>
                                    Criar Ticket
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
