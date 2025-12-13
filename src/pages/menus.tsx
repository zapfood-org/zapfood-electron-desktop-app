
import { Button } from "@heroui/react";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { Divider } from "@heroui/react";
import { Input } from "@heroui/react";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@heroui/react";
import { Select, SelectItem } from "@heroui/react";
import { addToast } from "@heroui/react";
import { AddCircle, BookBookmark } from "@solar-icons/react";

export function MenusPage() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const handleCreate = (onClose: () => void) => {
        addToast({
            title: "Cardápio criado",
            description: "O cardápio foi criado com sucesso!",
            color: "success",
        });
        onClose();
    };

    return (
        <div className="flex flex-col flex-1 h-full overflow-hidden">
            <div className="flex items-center justify-between p-6">
                <div>
                    <h1 className="text-3xl font-bold">Cardápios</h1>
                    <p className="text-sm text-default-500 mt-1">
                        Gerencie os cardápios dos restaurantes
                    </p>
                </div>
                <Button color="primary" startContent={<AddCircle size={20} weight="Outline" />} onPress={onOpen}>
                    Criar Cardápio
                </Button>
            </div>

            <Divider />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 overflow-y-auto">
                {["Cardápio Principal", "Cardápio Executivo", "Cardápio Vegetariano", "Cardápio Kids"].map((menu, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <div className="flex items-center gap-3 w-full">
                                <div className="w-12 h-12 rounded-lg bg-default-200 flex items-center justify-center">
                                    <BookBookmark size={24} weight="Outline" />
                                </div>
                                <div className="flex flex-col flex-1">
                                    <h3 className="text-lg font-semibold">{menu}</h3>
                                    <p className="text-sm text-default-500">Ativo</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardBody>
                            <div className="flex gap-2">
                                <Button size="sm" variant="flat" className="flex-1">
                                    Editar
                                </Button>
                                <Button size="sm" variant="bordered" className="flex-1">
                                    Ver Itens
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
                                <h2 className="text-2xl font-bold">Criar Cardápio</h2>
                                <p className="text-sm text-default-500 font-normal">
                                    Configure um novo cardápio para o restaurante
                                </p>
                            </ModalHeader>
                            <ModalBody>
                                <div className="flex flex-col gap-4">
                                    <Input
                                        label="Nome do Cardápio"
                                        placeholder="Ex: Cardápio Principal, Cardápio Executivo"
                                        isRequired
                                    />
                                    <Select
                                        label="Restaurante"
                                        placeholder="Selecione o restaurante"
                                        isRequired
                                    >
                                        <SelectItem key="1">Restaurante 1</SelectItem>
                                        <SelectItem key="2">Restaurante 2</SelectItem>
                                        <SelectItem key="3">Restaurante 3</SelectItem>
                                    </Select>
                                    <Input
                                        label="Descrição"
                                        placeholder="Descreva o cardápio (opcional)"
                                    />
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>
                                    Cancelar
                                </Button>
                                <Button color="primary" onPress={() => handleCreate(onClose)}>
                                    Criar
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
