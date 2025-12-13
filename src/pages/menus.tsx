
import { ScrollArea } from "@/components/ui/scroll-area";
import { addToast, Button, Card, CardBody, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, useDisclosure } from "@heroui/react";
import { AddCircle, BookBookmark, PenNewRound, TrashBinTrash } from "@solar-icons/react";
import { useState } from "react";

interface Menu {
    id: number;
    name: string;
    description?: string;
    status: "active" | "inactive";
    items: MenuItem[];
}

interface MenuItem {
    id: number;
    name: string;
    description: string;
    price: number;
    category: string;
}

const menusData: Menu[] = [
    {
        id: 1,
        name: "Cardápio Principal",
        description: "Cardápio completo com todas as opções",
        status: "active",
        items: [
            { id: 1, name: "Hambúrguer Clássico", description: "Pão, carne, queijo, alface, tomate", price: 25.90, category: "Lanches" },
            { id: 2, name: "Batata Frita", description: "Porção média de batatas fritas", price: 12.50, category: "Acompanhamentos" },
            { id: 3, name: "Refrigerante", description: "Lata 350ml", price: 5.00, category: "Bebidas" },
            { id: 4, name: "Pizza Margherita", description: "Molho de tomate, mussarela e manjericão", price: 45.00, category: "Pizzas" },
            { id: 5, name: "Pizza Calabresa", description: "Molho de tomate, mussarela, calabresa e cebola", price: 45.00, category: "Pizzas" },
            { id: 6, name: "Pizza Portuguesa", description: "Molho de tomate, mussarela, calabresa, cebola e ovos", price: 45.00, category: "Pizzas" },
            { id: 7, name: "Pizza Frango com Catupiry", description: "Molho de tomate, mussarela, frango, catupiry e cebola", price: 45.00, category: "Pizzas" },
            { id: 8, name: "Pizza Calabresa com Catupiry", description: "Molho de tomate, mussarela, calabresa, catupiry e cebola", price: 45.00, category: "Pizzas" },
            { id: 9, name: "Pizza Portuguesa com Catupiry", description: "Molho de tomate, mussarela, calabresa, cebola, ovos e catupiry", price: 45.00, category: "Pizzas" },
            { id: 10, name: "Pizza Frango com Catupiry", description: "Molho de tomate, mussarela, frango, catupiry e cebola", price: 45.00, category: "Pizzas" },
            { id: 11, name: "Pizza Calabresa com Catupiry", description: "Molho de tomate, mussarela, calabresa, catupiry e cebola", price: 45.00, category: "Pizzas" },
            { id: 12, name: "Pizza Portuguesa com Catupiry", description: "Molho de tomate, mussarela, calabresa, cebola, ovos e catupiry", price: 45.00, category: "Pizzas" },
        ]
    },
    {
        id: 2,
        name: "Cardápio Executivo",
        description: "Opções para o horário de almoço",
        status: "active",
        items: [
            { id: 5, name: "Prato Feito", description: "Arroz, feijão, salada e carne", price: 18.90, category: "Pratos" },
            { id: 6, name: "Suco Natural", description: "300ml", price: 8.00, category: "Bebidas" },
        ]
    },
    {
        id: 3,
        name: "Cardápio Vegetariano",
        description: "Opções vegetarianas",
        status: "active",
        items: [
            { id: 7, name: "Hambúrguer Vegetariano", description: "Pão, hambúrguer de grão-de-bico, vegetais", price: 22.90, category: "Lanches" },
            { id: 8, name: "Salada Caesar", description: "Alface, croutons, molho caesar", price: 16.50, category: "Saladas" },
        ]
    },
    {
        id: 4,
        name: "Cardápio Kids",
        description: "Opções para crianças",
        status: "active",
        items: [
            { id: 9, name: "Hambúrguer Kids", description: "Hambúrguer pequeno com batata", price: 15.90, category: "Lanches" },
            { id: 10, name: "Suco de Frutas", description: "200ml", price: 6.00, category: "Bebidas" },
        ]
    },
    {
        id: 5,
        name: "Cardápio Vegetariano",
        description: "Opções vegetarianas",
        status: "active",
        items: [
            { id: 13, name: "Hambúrguer Vegetariano", description: "Pão, hambúrguer de grão-de-bico, vegetais", price: 22.90, category: "Lanches" },
            { id: 14, name: "Salada Caesar", description: "Alface, croutons, molho caesar", price: 16.50, category: "Saladas" },
        ]
    },
    {
        id: 6,
        name: "Cardápio Vegano",
        description: "Opções veganas",
        status: "active",
        items: [
            { id: 15, name: "Hambúrguer Vegano", description: "Pão, hambúrguer de grão-de-bico, vegetais", price: 22.90, category: "Lanches" },
            { id: 16, name: "Salada Caesar", description: "Alface, croutons, molho caesar", price: 16.50, category: "Saladas" },
        ]
    },
    {
        id: 7,
        name: "Cardápio Vegetal",
        description: "Opções vegetais",
        status: "active",
        items: [
            { id: 17, name: "Hambúrguer Vegetal", description: "Pão, hambúrguer de grão-de-bico, vegetais", price: 22.90, category: "Lanches" },
            { id: 18, name: "Salada Caesar", description: "Alface, croutons, molho caesar", price: 16.50, category: "Saladas" },
        ]
    },
    {
        id: 8,
        name: "Cardápio Gourmet",
        description: "Opções vegetais",
        status: "active",
        items: [
            { id: 19, name: "Hambúrguer Gourmet", description: "Pão, hambúrguer de grão-de-bico, vegetais", price: 22.90, category: "Lanches" },
            { id: 20, name: "Salada Caesar", description: "Alface, croutons, molho caesar", price: 16.50, category: "Saladas" },
        ]
    },
    {
        id: 9,
        name: "Cardápio Vegetariano Gourmet",
        description: "Opções vegetais",
        status: "active",
        items: [
            { id: 21, name: "Hambúrguer Vegano", description: "Pão, hambúrguer de grão-de-bico, vegetais", price: 22.90, category: "Lanches" },
            { id: 22, name: "Salada Caesar", description: "Alface, croutons, molho caesar", price: 16.50, category: "Saladas" },
        ]
    },
    {
        id: 10,
        name: "Cardápio Vegano Gourmet",
        description: "Opções vegetais",
        status: "active",
        items: [
            { id: 23, name: "Hambúrguer Vegano Gourmet", description: "Pão, hambúrguer de grão-de-bico, vegetais", price: 22.90, category: "Lanches" },
            { id: 24, name: "Salada Caesar", description: "Alface, croutons, molho caesar", price: 16.50, category: "Saladas" },
        ]
    },
    {
        id: 11,
        name: "Cardápio Vegetal Gourmet",
        description: "Opções vegetais",
        status: "active",
        items: [
            { id: 25, name: "Hambúrguer Vegetal Gourmet", description: "Pão, hambúrguer de grão-de-bico, vegetais", price: 22.90, category: "Lanches" },
            { id: 26, name: "Salada Caesar", description: "Alface, croutons, molho caesar", price: 16.50, category: "Saladas" },
        ]
    }
];

export function MenusPage() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selectedMenu, setSelectedMenu] = useState<Menu | null>(menusData[0] || null);

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
                </div>
                <Button color="primary" startContent={<AddCircle size={20} weight="Outline" />} onPress={onOpen}>
                    Criar Cardápio
                </Button>
            </div>

            <Divider />

            <div className="grid grid-cols-[1fr_auto_2fr] h-full">
                {/* Coluna Esquerda - Lista de Cardápios */}
                <div className="flex flex-col flex-1">
                    <div className="p-4">
                        <Input
                            placeholder="Buscar cardápio..."
                        />
                    </div>
                    <Divider />
                    <ScrollArea className="flex flex-col grow h-0 overflow-y-auto">
                        <div className="p-4 space-y-2">
                            {menusData.map((menu) => (
                                <Card
                                    key={menu.id}
                                    className={`cursor-pointer transition-all w-full ${selectedMenu?.id === menu.id
                                        ? "border-2 border-primary bg-primary-50"
                                        : "border border-default-200 hover:border-primary-200"
                                        }`}
                                    isPressable
                                    onPress={() => setSelectedMenu(menu)}
                                >
                                    <CardBody className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-default-200 flex items-center justify-center flex-shrink-0">
                                                <BookBookmark size={20} weight="Outline" />
                                            </div>
                                            <div className="flex flex-col flex-1 min-w-0">
                                                <h3 className="text-base font-semibold truncate">{menu.name}</h3>
                                                <p className="text-xs text-default-500">
                                                    {menu.items.length} {menu.items.length === 1 ? "item" : "itens"}
                                                </p>
                                            </div>
                                            {menu.status === "active" && (
                                                <div className="w-2 h-2 rounded-full bg-success flex-shrink-0" />
                                            )}
                                        </div>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* Divider Vertical */}
                <Divider orientation="vertical" />

                {/* Coluna Direita - Itens do Cardápio */}
                <div className="flex-1 flex flex-col">
                    {selectedMenu ? (
                        <>
                            <div className="p-6 border-b border-default-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold">{selectedMenu.name}</h2>
                                        {selectedMenu.description && (
                                            <p className="text-sm text-default-500 mt-1">{selectedMenu.description}</p>
                                        )}
                                    </div>
                                    <Button size="sm" variant="flat" color="primary">
                                        Adicionar Item
                                    </Button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6">
                                {selectedMenu.items.length > 0 ? (
                                    <div className="space-y-3">
                                        {selectedMenu.items.map((item) => (
                                            <Card key={item.id} className="border border-default-200">
                                                <CardBody className="p-4">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h3 className="text-base font-semibold">{item.name}</h3>
                                                                <span className="text-xs text-default-500 bg-default-100 px-2 py-0.5 rounded">
                                                                    {item.category}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-default-600">{item.description}</p>
                                                        </div>
                                                        <div className="flex items-center gap-3 flex-shrink-0">
                                                            <span className="text-lg font-bold text-primary">
                                                                R$ {item.price.toFixed(2).replace(".", ",")}
                                                            </span>
                                                            <div className="flex gap-1">
                                                                <Button
                                                                    size="sm"
                                                                    variant="light"
                                                                    isIconOnly
                                                                    aria-label="Editar item"
                                                                >
                                                                    <PenNewRound size={18} weight="Outline" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="light"
                                                                    color="danger"
                                                                    isIconOnly
                                                                    aria-label="Excluir item"
                                                                >
                                                                    <TrashBinTrash size={18} weight="Outline" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center">
                                        <BookBookmark size={48} weight="Outline" className="text-default-300 mb-4" />
                                        <p className="text-default-500">Nenhum item neste cardápio</p>
                                        <Button size="sm" variant="flat" color="primary" className="mt-4">
                                            Adicionar Primeiro Item
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <BookBookmark size={48} weight="Outline" className="text-default-300 mb-4" />
                            <p className="text-default-500">Selecione um cardápio para ver os itens</p>
                        </div>
                    )}
                </div>
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
