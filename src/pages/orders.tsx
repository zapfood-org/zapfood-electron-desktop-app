
import { Button, Divider, Input, addToast, Popover, PopoverTrigger, PopoverContent, Switch, RadioGroup, Radio } from "@heroui/react";
import { Settings } from "@solar-icons/react";
import { Plus } from "lucide-react";
import moment from "moment";
import { useState } from "react";
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
    const [pendingOrders, setPendingOrders] = useState<Order[]>(initialPendingOrders);
    const [inProductionOrders, setInProductionOrders] = useState<Order[]>(initialInProductionOrders);
    const [sendingOrders, setSendingOrders] = useState<Order[]>(initialSendingOrders);
    const [completedOrders, setCompletedOrders] = useState<Order[]>(initialCompletedOrders);

    // Settings State
    const [visibleColumns, setVisibleColumns] = useState({
        pending: true,
        in_production: true,
        sending: true,
        completed: true
    });
    const [layoutMode, setLayoutMode] = useState<"columns" | "rows">("columns");

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

        addToast({
            title: "Pedido aceito",
            description: `${order.name} foi movido para produção`,
            color: "success",
        });
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

        addToast({
            title: "Pedido enviado",
            description: `${order.name} foi enviado para entrega`,
            color: "warning",
        });
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

        addToast({
            title: "Pedido finalizado",
            description: `${order.name} foi finalizado com sucesso!`,
            color: "success",
        });
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
                    <Button variant="solid" color="primary" startContent={<Plus size={18} />}>
                        Novo Pedido
                    </Button>
                </div>
            </div>

            <Divider />

            <div className="grid grid-cols-12 gap-4 px-6 py-3">
                <Input placeholder="Código do pedido" className="col-span-2" />
                <Input placeholder="Nome do cliente" className="col-span-2" />
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
        </div>
    );
}
