import { Button, Divider, Input, Popover, PopoverContent, PopoverTrigger, Radio, RadioGroup, Switch, Tab, Tabs, useDisclosure } from "@heroui/react";
import { BillList, Settings } from "@solar-icons/react";
import { Plus, Search } from "lucide-react";
import moment from "moment";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { NewOrderModal, type NewOrderFormData } from "../components/orders/NewOrderModal";
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
        address: "Mesa 05",
        total: 62.50,
        deliveryType: "dine_in",
        createdAt: moment().subtract(12, "minutes"),
        status: "pending",
        estimatedTime: 25,
    },
    {
        id: 3,
        name: "Pedido #003 (Comanda)",
        description: "3x Cerveja, 1x Porção de Fritas",
        customerName: "Pedro Oliveira",
        customerPhone: "(11) 99876-5432",
        address: "Comanda 12",
        total: 85.00,
        deliveryType: "dine_in",
        createdAt: moment().subtract(27, "minutes"),
        status: "pending",
        estimatedTime: 10,
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
        id: 10,
        name: "Pedido #010",
        description: "2x Suco de Laranja, 1x Sanduíche Natural",
        customerName: "Luiza Ferreira",
        customerPhone: "(11) 97777-8888",
        address: "Mesa 08",
        total: 32.00,
        deliveryType: "dine_in",
        createdAt: moment().subtract(8, "minutes"),
        acceptedAt: moment().subtract(3, "minutes"),
        status: "in_production",
        estimatedTime: 15,
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
    {
        id: 11,
        name: "Pedido #011",
        description: "1x Café Expresso, 1x Pão de Queijo",
        customerName: "Marcos Souza",
        customerPhone: "(11) 94444-5555",
        address: "Mesa 02",
        total: 12.50,
        deliveryType: "dine_in",
        createdAt: moment().subtract(20, "minutes"),
        acceptedAt: moment().subtract(15, "minutes"),
        completedAt: moment().subtract(2, "minutes"),
        status: "sending",
        estimatedTime: 5,
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

    // Check for payment success from navigation state
    const location = useLocation();
    const processedPaymentRef = useRef<number | null>(null);

    // Handler para mover pedidos pagos para concluído
    const handlePaymentSuccess = useCallback((paidOrderId: number) => {
        // Buscar o pedido em qualquer uma das listas e mover para concluído
        setPendingOrders(prev => {
            const order = prev.find(o => o.id === paidOrderId);
            if (order) {
                const completedOrder: Order = {
                    ...order,
                    status: "completed",
                    isPaid: true,
                    completedAt: moment(),
                };

                setCompletedOrders(completedPrev => [...completedPrev, completedOrder].sort((a, b) =>
                    (a.completedAt?.valueOf() || 0) - (b.completedAt?.valueOf() || 0)
                ));

                toast.success(`${order.name} foi pago e movido para concluído!`);
                return prev.filter(o => o.id !== paidOrderId);
            }
            return prev;
        });

        setInProductionOrders(prev => {
            const order = prev.find(o => o.id === paidOrderId);
            if (order) {
                const completedOrder: Order = {
                    ...order,
                    status: "completed",
                    isPaid: true,
                    completedAt: moment(),
                };

                setCompletedOrders(completedPrev => [...completedPrev, completedOrder].sort((a, b) =>
                    (a.completedAt?.valueOf() || 0) - (b.completedAt?.valueOf() || 0)
                ));

                toast.success(`${order.name} foi pago e movido para concluído!`);
                return prev.filter(o => o.id !== paidOrderId);
            }
            return prev;
        });

        setSendingOrders(prev => {
            const order = prev.find(o => o.id === paidOrderId);
            if (order) {
                const completedOrder: Order = {
                    ...order,
                    status: "completed",
                    isPaid: true,
                    completedAt: moment(),
                };

                setCompletedOrders(completedPrev => [...completedPrev, completedOrder].sort((a, b) =>
                    (a.completedAt?.valueOf() || 0) - (b.completedAt?.valueOf() || 0)
                ));

                toast.success(`${order.name} foi pago e movido para concluído!`);
                return prev.filter(o => o.id !== paidOrderId);
            }
            return prev;
        });
    }, []);

    useEffect(() => {
        if (location.state?.paymentSuccess && location.state?.orderId) {
            const paidOrderId = location.state.orderId;

            // Evitar processar o mesmo pagamento múltiplas vezes
            if (processedPaymentRef.current === paidOrderId) {
                return;
            }

            processedPaymentRef.current = paidOrderId;

            // Atualizar estado baseado em mudança externa (location.state)
            // Necessário atualizar estado aqui para sincronizar com navegação após pagamento
            handlePaymentSuccess(paidOrderId);

            // Clear state to prevent re-triggering on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location.state, handlePaymentSuccess]);

    // Modal State
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);

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
        // Buscar o pedido em qualquer uma das listas (exceto completed)
        const order =
            pendingOrders.find(o => o.id === orderId) ||
            inProductionOrders.find(o => o.id === orderId) ||
            sendingOrders.find(o => o.id === orderId);

        if (!order) return;

        const updatedOrder: Order = {
            ...order,
            status: "completed",
            completedAt: moment(),
        };

        // Remover o pedido da lista onde ele está
        setPendingOrders(prev => prev.filter(o => o.id !== orderId));
        setInProductionOrders(prev => prev.filter(o => o.id !== orderId));
        setSendingOrders(prev => prev.filter(o => o.id !== orderId));

        // Adicionar à lista de concluídos
        setCompletedOrders(prev => [...prev, updatedOrder].sort((a, b) =>
            (a.completedAt?.valueOf() || 0) - (b.completedAt?.valueOf() || 0)
        ));

        toast.success(`${order.name} foi finalizado com sucesso!`);
    };

    const handleEditOrder = (order: Order) => {
        setOrderToEdit(order);
        onOpen();
    };

    const handleUpdateOrder = (orderId: number, formData: NewOrderFormData) => {
        // Buscar o pedido em qualquer uma das listas
        const order =
            pendingOrders.find(o => o.id === orderId) ||
            inProductionOrders.find(o => o.id === orderId) ||
            sendingOrders.find(o => o.id === orderId) ||
            completedOrders.find(o => o.id === orderId);

        if (!order) return;

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

        // Montar descrição dos produtos
        const productsDescription = formData.products
            .map((op) => `${op.quantity}x ${op.product.name}`)
            .join(", ");

        // Calcular total
        const total = formData.products.reduce(
            (sum, op) => sum + op.product.price * op.quantity,
            0
        );

        // Criar pedido atualizado
        const updatedOrder: Order = {
            ...order,
            name: `Pedido #${String(orderId).padStart(3, "0")}`,
            description: productsDescription + (formData.observation ? ` - ${formData.observation}` : ""),
            customerName: formData.customerName,
            customerPhone: formData.customerPhone || "Não informado",
            address: address,
            total: total,
            deliveryType: formData.deliveryType,
        };

        // Atualizar o pedido na lista onde ele está
        const updateOrderInList = (prev: Order[]) =>
            prev.map(o => o.id === orderId ? updatedOrder : o);

        setPendingOrders(updateOrderInList);
        setInProductionOrders(updateOrderInList);
        setSendingOrders(updateOrderInList);
        setCompletedOrders(updateOrderInList);

        setOrderToEdit(null);
        toast.success(`${updatedOrder.name} foi atualizado com sucesso!`);
    };

    const handleCreateOrder = (formData: NewOrderFormData) => {
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

        // Montar descrição dos produtos
        const productsDescription = formData.products
            .map((op) => `${op.quantity}x ${op.product.name}`)
            .join(", ");

        // Calcular total
        const total = formData.products.reduce(
            (sum, op) => sum + op.product.price * op.quantity,
            0
        );

        // Criar novo pedido
        const newOrder: Order = {
            id: newId,
            name: `Pedido #${String(newId).padStart(3, "0")}`,
            description: productsDescription + (formData.observation ? ` - ${formData.observation}` : ""),
            customerName: formData.customerName,
            customerPhone: formData.customerPhone || "Não informado",
            address: address,
            total: total,
            deliveryType: formData.deliveryType,
            createdAt: moment(),
            status: "in_production",
            acceptedAt: moment(),
        };

        // Adicionar à lista de produção
        setInProductionOrders(prev => [...prev, newOrder].sort((a, b) =>
            (a.acceptedAt?.valueOf() || 0) - (b.acceptedAt?.valueOf() || 0)
        ));

        toast.success(`${newOrder.name} foi criado e enviado para produção!`);
        setOrderToEdit(null);
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
                    onEdit={handleEditOrder}
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
                    onEdit={handleEditOrder}
                />
            )}

            {/* Modal de Novo Pedido / Edição */}
            <NewOrderModal
                isOpen={isOpen}
                onClose={() => {
                    setOrderToEdit(null);
                    onClose();
                }}
                onCreateOrder={handleCreateOrder}
                orderToEdit={orderToEdit}
                onUpdateOrder={handleUpdateOrder}
            />
        </div>
    );
}
