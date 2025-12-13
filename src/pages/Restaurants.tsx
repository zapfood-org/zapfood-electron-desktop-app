
import { Button, Card, CardBody, CardHeader, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure, addToast } from "@heroui/react";
import { AddCircle, Shop } from "@solar-icons/react";

export function RestaurantsPage() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const handleAdd = (onClose: () => void) => {
        addToast({
            title: "Restaurante adicionado",
            description: "O restaurante foi cadastrado com sucesso!",
            color: "success",
        });
        onClose();
    };

    return (
        <div className="flex flex-col flex-1 h-full overflow-y-auto">
            <div className="flex items-center justify-between p-6">
                <div>
                    <h1 className="text-3xl font-bold">Restaurantes</h1>
                    <p className="text-sm text-default-500 mt-1">
                        Gerencie seus restaurantes parceiros
                    </p>
                </div>
                <Button color="primary" startContent={<AddCircle size={20} weight="Outline" />} onPress={onOpen}>
                    Adicionar Restaurante
                </Button>
            </div>

            <Divider />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                    <Card key={item}>
                        <CardHeader>
                            <div className="flex items-center gap-3 w-full">
                                <div className="w-12 h-12 rounded-lg bg-default-200 flex items-center justify-center">
                                    <Shop size={24} weight="Outline" />
                                </div>
                                <div className="flex flex-col flex-1">
                                    <h3 className="text-lg font-semibold">Restaurante {item}</h3>
                                    <p className="text-sm text-default-500">Status: Ativo</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardBody>
                            <div className="flex gap-2">
                                <Button size="sm" variant="flat" className="flex-1">
                                    Editar
                                </Button>
                                <Button size="sm" variant="bordered" className="flex-1">
                                    Ver Detalhes
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
                scrollBehavior="inside"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <h2 className="text-2xl font-bold">Adicionar Restaurante</h2>
                                <p className="text-sm text-default-500 font-normal">
                                    Preencha os dados do novo restaurante
                                </p>
                            </ModalHeader>
                            <ModalBody>
                                <div className="flex flex-col gap-4">
                                    <Input
                                        label="Nome do Restaurante"
                                        placeholder="Digite o nome"
                                        isRequired
                                    />
                                    <Input
                                        label="CNPJ"
                                        placeholder="00.000.000/0000-00"
                                        isRequired
                                    />
                                    <Input
                                        label="Email"
                                        type="email"
                                        placeholder="restaurante@exemplo.com"
                                        isRequired
                                    />
                                    <Input
                                        label="Telefone"
                                        placeholder="(11) 98765-4321"
                                        isRequired
                                    />
                                    <Input
                                        label="Endereço"
                                        placeholder="Rua, número, bairro"
                                        isRequired
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Cidade"
                                            placeholder="São Paulo"
                                            isRequired
                                        />
                                        <Input
                                            label="Estado"
                                            placeholder="SP"
                                            isRequired
                                        />
                                    </div>
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
