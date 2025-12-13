
import { Avatar, Button, Card, CardBody, CardHeader, Chip, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure, addToast } from "@heroui/react";
import { AddCircle } from "@solar-icons/react";

export function DeliveryDriversPage() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const handleAdd = (onClose: () => void) => {
        addToast({
            title: "Entregador adicionado",
            description: "O entregador foi cadastrado com sucesso!",
            color: "success",
        });
        onClose();
    };

    return (
        <div className="flex flex-col flex-1 h-full overflow-hidden">
            <div className="flex items-center justify-between p-6">
                <div>
                    <h1 className="text-3xl font-bold">Entregadores</h1>
                    <p className="text-sm text-default-500 mt-1">
                        Gerencie seus entregadores e motoboys
                    </p>
                </div>
                <Button color="primary" startContent={<AddCircle size={20} weight="Outline" />} onPress={onOpen}>
                    Adicionar Entregador
                </Button>
            </div>

            <Divider />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 overflow-y-auto">
                {[
                    { name: "João Silva", status: "disponível", deliveries: 12 },
                    { name: "Maria Santos", status: "em entrega", deliveries: 8 },
                    { name: "Pedro Costa", status: "disponível", deliveries: 15 },
                    { name: "Ana Oliveira", status: "offline", deliveries: 5 },
                ].map((driver, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <div className="flex items-center gap-3 w-full">
                                <Avatar
                                    size="lg"
                                    name={driver.name}
                                    className="bg-primary text-primary-foreground"
                                />
                                <div className="flex flex-col flex-1">
                                    <h3 className="text-lg font-semibold">{driver.name}</h3>
                                    <Chip
                                        size="sm"
                                        color={
                                            driver.status === "disponível"
                                                ? "success"
                                                : driver.status === "em entrega"
                                                    ? "warning"
                                                    : "default"
                                        }
                                        variant="flat"
                                    >
                                        {driver.status}
                                    </Chip>
                                </div>
                            </div>
                        </CardHeader>
                        <CardBody>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-default-500">Entregas hoje:</span>
                                    <span className="font-medium">{driver.deliveries}</span>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="flat" className="flex-1">
                                        Ver Detalhes
                                    </Button>
                                    <Button size="sm" variant="bordered" className="flex-1">
                                        Localizar
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
                                <h2 className="text-2xl font-bold">Adicionar Entregador</h2>
                                <p className="text-sm text-default-500 font-normal">
                                    Cadastre um novo entregador no sistema
                                </p>
                            </ModalHeader>
                            <ModalBody>
                                <div className="flex flex-col gap-4">
                                    <Input
                                        label="Nome Completo"
                                        placeholder="Digite o nome"
                                        isRequired
                                    />
                                    <Input
                                        label="CPF"
                                        placeholder="000.000.000-00"
                                        isRequired
                                    />
                                    <Input
                                        label="Telefone"
                                        placeholder="(11) 98765-4321"
                                        isRequired
                                    />
                                    <Input
                                        label="Email"
                                        type="email"
                                        placeholder="entregador@exemplo.com"
                                    />
                                    <Input
                                        label="CNH"
                                        placeholder="00000000000"
                                        isRequired
                                    />
                                    <Input
                                        label="Placa do Veículo"
                                        placeholder="ABC-1234"
                                        isRequired
                                    />
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>
                                    Cancelar
                                </Button>
                                <Button color="primary" onPress={() => handleAdd(onClose)}>
                                    Adicionar
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
