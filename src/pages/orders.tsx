import { Button, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Popover, PopoverContent, PopoverTrigger, Radio, RadioGroup, Select, SelectItem, Switch, Tab, Tabs, Textarea, useDisclosure } from "@heroui/react";
import { BillList, Settings } from "@solar-icons/react";
import { Plus, Search } from "lucide-react";
import moment from "moment";
import { useState } from "react";
import { toast } from "react-toastify";
import type { Order } from "../components/orders/OrderCard";
import { OrdersBoardLayout } from "../components/orders/OrdersBoardLayout";
import { OrdersSwimlaneLayout } from "../components/orders/OrdersSwimlaneLayout";

// Dados mockados iniciais
const initialPendingOrders: Order[] = [
    {
        id: 1,
        name: "Pedido #001",
        description: "2x Hambúrguer, 1x Batata Frita, 1x Refrigerante",
        customerName: "João Silva",
        customerPhone: "(11) 98765-4321",
        address: "Rua das Flores, 123 - Centro",
        total: 45.90,
        deliveryType: "delivery",
        createdAt: moment().subtract(5, "minutes"),
        status: "pending",
        estimatedTime: 30,
    },
    {
        id: 2,
        name: "Pedido #002",
        description: "1x Pizza Grande, 1x Refrigerante",
        customerName: "Maria Santos",
        customerPhone: "(11) 91234-5678",
        address: "Retirada no balcão",
        total: 62.50,
        deliveryType: "pickup",
        createdAt: moment().subtract(12, "minutes"),
        status: "pending",
        estimatedTime: 25,
    },
    {
        id: 3,
        name: "Pedido #003",
        description: "3x Salada, 2x Água",
        customerName: "Pedro Oliveira",
        customerPhone: "(11) 99876-5432",
        address: "Av. Paulista, 1000 - Bela Vista",
        total: 35.00,
        deliveryType: "delivery",
        createdAt: moment().subtract(27, "minutes"),
        status: "pending",
        estimatedTime: 20,
    },
];

const initialInProductionOrders: Order[] = [
    {
        id: 4,
        name: "Pedido #004",
        description: "1x Pizza Média, 1x Refrigerante",
        customerName: "Ana Costa",
        customerPhone: "(11) 92345-6789",
        address: "Rua Augusta, 500 - Consolação",
        total: 48.00,
        deliveryType: "delivery",
        createdAt: moment().subtract(15, "minutes"),
        acceptedAt: moment().subtract(10, "minutes"),
        status: "in_production",
        estimatedTime: 25,
    },
    {
        id: 5,
        name: "Pedido #005",
        description: "2x Hambúrguer, 2x Batata Frita",
        customerName: "Carlos Mendes",
        customerPhone: "(11) 94567-8901",
        address: "Retirada no balcão",
        total: 58.90,
        deliveryType: "pickup",
        createdAt: moment().subtract(20, "minutes"),
        acceptedAt: moment().subtract(18, "minutes"),
        status: "in_production",
        estimatedTime: 20,
    },
];

const initialSendingOrders: Order[] = [
    {
        id: 6,
        name: "Pedido #006",
        description: "1x Salada, 1x Água",
        customerName: "Juliana Lima",
        customerPhone: "(11) 95678-9012",
        address: "Rua das Acácias, 789 - Jardins",
        total: 28.00,
        deliveryType: "delivery",
        createdAt: moment().subtract(40, "minutes"),
        acceptedAt: moment().subtract(35, "minutes"),
        completedAt: moment().subtract(10, "minutes"),
        status: "sending",
        estimatedTime: 15,
    },
];

const initialCompletedOrders: Order[] = [
    {
        id: 7,
        name: "Pedido #007",
        description: "1x Pizza Grande, 2x Refrigerante",
        customerName: "Roberto Silva",
        customerPhone: "(11) 96789-0123",
        address: "Retirada no balcão",
        total: 75.00,
        deliveryType: "pickup",
        createdAt: moment().subtract(60, "minutes"),
        acceptedAt: moment().subtract(55, "minutes"),
        completedAt: moment().subtract(45, "minutes"),
        status: "completed",
        estimatedTime: 30,
    },
];


export function OrdersPage() {
    // Opções para selects
    const tableOptions = Array.from({ length: 30 }, (_, i) => (i + 1).toString());
    const commandOptions = Array.from({ length: 50 }, (_, i) => (i + 1).toString());

    const [pendingOrders, setPendingOrders] = useState<Order[]>(initialPendingOrders);
    const [inProductionOrders, setInProductionOrders] = useState<Order[]>(initialInProductionOrders);
    const [sendingOrders, setSendingOrders] = useState<Order[]>(initialSendingOrders);
    const [completedOrders, setCompletedOrders] = useState<Order[]>(initialCompletedOrders);

    // Settings State
    const [visibleColumns, setVisibleColumns] = useState({
        pending: true,
        in_production: true,
        sending: true,
        completed: false
    });
    const [layoutMode, setLayoutMode] = useState<"columns" | "rows">("columns");

    // Modal State
    const { isOpen, onOpen, onClose } = useDisclosure();

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        customerName: "",
        customerPhone: "",
        address: "",
        total: "",
        deliveryType: "delivery" as "delivery" | "pickup" | "dine_in",
        estimatedTime: "",
        table: "",
        command: "",
    });

    const handleAcceptOrder = (orderId: number) => {
        const order = pendingOrders.find(o => o.id === orderId);
        if (!order) return;

        const updatedOrder: Order = {
            ...order,
            status: "in_production",
            acceptedAt: moment(),
        };

        setPendingOrders(prev => prev.filter(o => o.id !== orderId));
        setInProductionOrders(prev => [...prev, updatedOrder].sort((a, b) =>
            (a.acceptedAt?.valueOf() || 0) - (b.acceptedAt?.valueOf() || 0)
        ));

        toast.success(`${order.name} foi movido para produção`);
    };

    const handleSendOrder = (orderId: number) => {
        const order = inProductionOrders.find(o => o.id === orderId);
        if (!order) return;

        const updatedOrder: Order = {
            ...order,
            status: "sending",
            completedAt: moment(),
        };

        setInProductionOrders(prev => prev.filter(o => o.id !== orderId));
        setSendingOrders(prev => [...prev, updatedOrder].sort((a, b) =>
            (a.completedAt?.valueOf() || 0) - (b.completedAt?.valueOf() || 0)
        ));

        toast.warning(`${order.name} foi enviado para entrega`);
    };

    const handleCompleteOrder = (orderId: number) => {
        const order = sendingOrders.find(o => o.id === orderId);
        if (!order) return;

        const updatedOrder: Order = {
            ...order,
            status: "completed",
        };

        setSendingOrders(prev => prev.filter(o => o.id !== orderId));
        setCompletedOrders(prev => [...prev, updatedOrder].sort((a, b) =>
            (a.completedAt?.valueOf() || 0) - (b.completedAt?.valueOf() || 0)
        ));

        toast.success(`${order.name} foi finalizado com sucesso!`);
    };

    const handleCreateOrder = () => {
        // Validar campos obrigatórios
        if (!formData.name || !formData.customerName || !formData.customerPhone || !formData.total) {
            toast.error("Preencha todos os campos obrigatórios");
            return;
        }

        if (formData.deliveryType === "delivery" && !formData.address) {
            toast.error("O endereço é obrigatório para entregas");
            return;
        }

        // Gerar novo ID
        const allOrders = [...pendingOrders, ...inProductionOrders, ...sendingOrders, ...completedOrders];
        const newId = allOrders.length > 0 ? Math.max(...allOrders.map(o => o.id)) + 1 : 1;

        // Montar endereço com mesa/comanda se for retirada ou consumo no local
        let address = formData.deliveryType === "delivery" ? formData.address : formData.deliveryType === "dine_in" ? "Consumo no local" : "Retirada no balcão";
        if (formData.deliveryType === "pickup" || formData.deliveryType === "dine_in") {
            const parts = [];
            if (formData.table) parts.push(`Mesa ${formData.table}`);
            if (formData.command) parts.push(`Comanda ${formData.command}`);
            if (parts.length > 0) {
                address = parts.join(" - ");
            } else if (formData.deliveryType === "dine_in") {
                address = "Consumo no local";
            }
        }

        // Criar novo pedido
        const newOrder: Order = {
            id: newId,
            name: formData.name,
            description: formData.description || "Sem descrição",
            customerName: formData.customerName,
            customerPhone: formData.customerPhone,
            address: address,
            total: parseFloat(formData.total.replace(",", ".")),
            deliveryType: formData.deliveryType,
            createdAt: moment(),
            status: "pending",
            estimatedTime: formData.estimatedTime ? parseInt(formData.estimatedTime) : undefined,
        };

        // Adicionar à lista de pendentes
        setPendingOrders(prev => [...prev, newOrder].sort((a, b) =>
            b.createdAt.valueOf() - a.createdAt.valueOf()
        ));

        // Resetar formulário e fechar modal
        setFormData({
            name: "",
            description: "",
            customerName: "",
            customerPhone: "",
            address: "",
            total: "",
            deliveryType: "delivery",
            estimatedTime: "",
            table: "",
            command: "",
        });
        onClose();

        toast.success(`${newOrder.name} foi criado com sucesso!`);
    };


    return (
        <div className="flex flex-col flex-1 h-full overflow-hidden">
            <div className="flex justify-between items-center p-6">
                <div>
                    <h1 className="text-3xl font-bold">Pedidos</h1>
                </div>
                <div className="flex gap-2">
                    <Popover placement="bottom-end">
                        <PopoverTrigger>
                            <Button variant="bordered" startContent={<Settings size={18} />}>
                                Configurações
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                            <div className="px-1 py-2 w-full">
                                <p className="text-small font-bold text-foreground mb-4">Visualização</p>
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-2">
                                        <span className="text-tiny text-default-500 font-medium">Layout</span>
                                        <RadioGroup
                                            orientation="horizontal"
                                            value={layoutMode}
                                            onValueChange={(val) => setLayoutMode(val as "columns" | "rows")}
                                            classNames={{ wrapper: "gap-4" }}
                                        >
                                            <Radio value="columns">Colunas</Radio>
                                            <Radio value="rows">Linhas</Radio>
                                        </RadioGroup>
                                    </div>
                                    <Divider />
                                    <div className="flex flex-col gap-2">
                                        <span className="text-tiny text-default-500 font-medium">Colunas Visíveis</span>
                                        <div className="flex flex-col gap-2">
                                            <Switch isSelected={visibleColumns.pending} onValueChange={(v) => setVisibleColumns(prev => ({ ...prev, pending: v }))} size="sm">Pendentes</Switch>
                                            <Switch isSelected={visibleColumns.in_production} onValueChange={(v) => setVisibleColumns(prev => ({ ...prev, in_production: v }))} size="sm">Preparando</Switch>
                                            <Switch isSelected={visibleColumns.sending} onValueChange={(v) => setVisibleColumns(prev => ({ ...prev, sending: v }))} size="sm">Enviando</Switch>
                                            <Switch isSelected={visibleColumns.completed} onValueChange={(v) => setVisibleColumns(prev => ({ ...prev, completed: v }))} size="sm">Concluído</Switch>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                    <Button variant="solid" color="primary" startContent={<Plus size={18} />} onPress={onOpen}>
                        Novo Pedido
                    </Button>
                </div>
            </div>

            <Divider />

            <div className="flex flex-row items-center w-full gap-4 px-6 py-3">
                <Tabs aria-label="Options" color="primary" >
                    <Tab
                        key="all"
                        title={
                            <div className="flex items-center space-x-2">
                                <span>Todos</span>
                            </div>
                        }
                    />
                    <Tab
                        key="house"
                        title={
                            <div className="flex items-center space-x-2">
                                <span>Casa</span>
                            </div>
                        }
                    />
                    <Tab
                        key="delivery"
                        title={
                            <div className="flex items-center space-x-2">
                                <span>Delivery</span>
                            </div>
                        }
                    />
                    <Tab
                        key="pickup"
                        title={
                            <div className="flex items-center space-x-2">
                                <span>Retirada</span>
                            </div>
                        }
                    />

                </Tabs>
                <div className="grid grid-cols-12 gap-4 w-full">
                    <Input placeholder="Código do pedido" className="col-span-2" startContent={<BillList size={18} />} />
                    <Input placeholder="Nome do cliente" className="col-span-2" startContent={<Search size={18} />} />
                </div>
            </div>


            <Divider />

            {layoutMode === "columns" ? (
                <OrdersBoardLayout
                    pendingOrders={pendingOrders}
                    inProductionOrders={inProductionOrders}
                    sendingOrders={sendingOrders}
                    completedOrders={completedOrders}
                    visibleColumns={visibleColumns}
                    onAccept={handleAcceptOrder}
                    onSend={handleSendOrder}
                    onComplete={handleCompleteOrder}
                />
            ) : (
                <OrdersSwimlaneLayout
                    pendingOrders={pendingOrders}
                    inProductionOrders={inProductionOrders}
                    sendingOrders={sendingOrders}
                    completedOrders={completedOrders}
                    visibleColumns={visibleColumns}
                    onAccept={handleAcceptOrder}
                    onSend={handleSendOrder}
                    onComplete={handleCompleteOrder}
                />
            )}

            {/* Modal de Novo Pedido */}
            <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold">Novo Pedido</h2>
                        <p className="text-sm text-default-500 font-normal">Preencha os dados do pedido</p>
                    </ModalHeader>
                    <ModalBody>
                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Nome do Pedido"
                                    placeholder="Ex: Pedido #001"
                                    value={formData.name}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
                                    isRequired
                                />
                                <Input
                                    label="Valor Total"
                                    placeholder="0,00"
                                    value={formData.total}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, total: value }))}
                                    startContent={<span className="text-default-500">R$</span>}
                                    isRequired
                                />
                            </div>

                            <Textarea
                                label="Descrição"
                                placeholder="Ex: 2x Hambúrguer, 1x Batata Frita, 1x Refrigerante"
                                value={formData.description}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                                minRows={2}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Nome do Cliente"
                                    placeholder="Ex: João Silva"
                                    value={formData.customerName}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, customerName: value }))}
                                    isRequired
                                />
                                <Input
                                    label="Telefone"
                                    placeholder="(11) 98765-4321"
                                    value={formData.customerPhone}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, customerPhone: value }))}
                                    isRequired
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <span className="text-sm text-default-600 font-medium">Tipo de Entrega</span>
                                <RadioGroup
                                    orientation="horizontal"
                                    value={formData.deliveryType}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, deliveryType: value as "delivery" | "pickup" | "dine_in" }))}
                                    classNames={{ wrapper: "gap-4" }}
                                >
                                    <Radio value="delivery">Entrega</Radio>
                                    <Radio value="pickup">Retirada</Radio>
                                    <Radio value="dine_in">Consumo no local</Radio>
                                </RadioGroup>
                            </div>

                            {formData.deliveryType === "delivery" && (
                                <Input
                                    label="Endereço"
                                    placeholder="Rua, número - Bairro"
                                    value={formData.address}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, address: value }))}
                                    isRequired={formData.deliveryType === "delivery"}
                                />
                            )}

                            {(formData.deliveryType === "pickup" || formData.deliveryType === "dine_in") && (
                                <div className="grid grid-cols-2 gap-4">
                                    <Select
                                        label="Mesa"
                                        placeholder="Selecione a mesa"
                                        selectedKeys={formData.table ? [formData.table] : []}
                                        onSelectionChange={(keys) => {
                                            const value = Array.from(keys)[0] as string;
                                            setFormData(prev => ({ ...prev, table: value || "" }));
                                        }}
                                    >
                                        {tableOptions.map((table) => (
                                            <SelectItem key={table}>
                                                Mesa {table}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                    <Select
                                        label="Comanda"
                                        placeholder="Selecione a comanda"
                                        selectedKeys={formData.command ? [formData.command] : []}
                                        onSelectionChange={(keys) => {
                                            const value = Array.from(keys)[0] as string;
                                            setFormData(prev => ({ ...prev, command: value || "" }));
                                        }}
                                    >
                                        {commandOptions.map((command) => (
                                            <SelectItem key={command}>
                                                Comanda {command}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                </div>
                            )}

                            <Input
                                label="Tempo Estimado (minutos)"
                                placeholder="30"
                                type="number"
                                value={formData.estimatedTime}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, estimatedTime: value }))}
                            />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={onClose}>
                            Cancelar
                        </Button>
                        <Button color="primary" onPress={handleCreateOrder} className="text-white">
                            Criar Pedido
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}
