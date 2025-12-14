
import { Button, Card, CardBody, CardHeader, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@heroui/react";
import { toast } from "react-toastify";
import { AddCircle, Widget } from "@solar-icons/react";

export function CategoriesPage() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const handleAdd = (onClose: () => void) => {
        toast.success("A categoria foi criada com sucesso!");
        onClose();
    };

    return (
        <div className="flex flex-col flex-1 h-full overflow-hidden">
            <div className="flex items-center justify-between p-6">
                <div>
                    <h1 className="text-3xl font-bold">Categorias</h1>
                    <p className="text-sm text-default-500 mt-1">
                        Organize seus produtos por categorias
                    </p>
                </div>
                <Button color="primary" startContent={<AddCircle size={20} weight="Outline" />} onPress={onOpen}>
                    Adicionar Categoria
                </Button>
            </div>

            <Divider />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6 overflow-y-auto">
                {["Bebidas", "Lanches", "Pizzas", "Saladas", "Sobremesas", "Combos"].map((category, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <div className="flex flex-col items-center text-center gap-2 w-full">
                                <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Widget size={32} weight="Outline" className="text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold">{category}</h3>
                                <p className="text-sm text-default-500">12 produtos</p>
                            </div>
                        </CardHeader>
                        <CardBody>
                            <div className="flex gap-2">
                                <Button size="sm" variant="flat" className="flex-1">
                                    Editar
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
                size="lg"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <h2 className="text-2xl font-bold">Adicionar Categoria</h2>
                                <p className="text-sm text-default-500 font-normal">
                                    Crie uma nova categoria para organizar seus produtos
                                </p>
                            </ModalHeader>
                            <ModalBody>
                                <div className="flex flex-col gap-4">
                                    <Input
                                        label="Nome da Categoria"
                                        placeholder="Ex: Bebidas, Lanches, Pizzas"
                                        isRequired
                                    />
                                    <Input
                                        label="Descrição"
                                        placeholder="Descreva a categoria (opcional)"
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
