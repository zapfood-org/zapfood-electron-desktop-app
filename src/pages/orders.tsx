
import { ScrollArea } from "../components/ui/scroll-area";
import { Avatar, Button, Card, CardBody, CardHeader, Chip, Divider, Input, addToast } from "@heroui/react";
import { Calendar, CheckCircle, ChefHatHeart, ClockCircle, Delivery, Eye, MapPoint, PhoneCalling, Shop } from "@solar-icons/react";
import { Plus } from "lucide-react";
import moment from "moment";
import { useEffect, useState } from "react";

type OrderStatus = "pending" | "in_production" | "sending" | "completed";

interface Order {
    id: number;
    name: string;
    description: string;
    customerName: string;
    customerPhone: string;
    address: string;
    total: number;
    deliveryType: "delivery" | "pickup";
    createdAt: moment.Moment;
    acceptedAt?: moment.Moment;
    completedAt?: moment.Moment;
    status: OrderStatus;
    estimatedTime?: number; // minutos estimados
}

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

function OrderCard({
    order,
    onAccept,
    onComplete,
    onSend
}: {
    order: Order;
    onAccept?: () => void;
    onComplete?: () => void;
    onSend?: () => void;
}) {
    const [elapsedTime, setElapsedTime] = useState("");
    const [productionTime, setProductionTime] = useState("");

    const formatTime = (date: moment.Moment) => date.format("HH:mm");
    const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace(".", ",")}`;

    const isPending = order.status === "pending";
    const isInProduction = order.status === "in_production";
    const isSending = order.status === "sending";
    const isCompleted = order.status === "completed";
    const isUrgent = isPending && moment().diff(order.createdAt, "minutes") > 15;
    const isVeryUrgent = isPending && moment().diff(order.createdAt, "minutes") > 25;

    useEffect(() => {
        const updateTimes = () => {
            if (isCompleted && order.completedAt) {
                const elapsed = moment().diff(order.completedAt, "minutes");
                setElapsedTime(`${elapsed} min`);
            } else {
                const elapsed = moment().diff(order.createdAt, "minutes");
                setElapsedTime(`${elapsed} min`);
            }

            if (order.acceptedAt && !order.completedAt) {
                const production = moment().diff(order.acceptedAt, "minutes");
                setProductionTime(`${production} min`);
            } else if (order.completedAt && !isCompleted) {
                const sending = moment().diff(order.completedAt, "minutes");
                setProductionTime(`${sending} min`);
            }
        };

        updateTimes();
        const interval = setInterval(updateTimes, 60000); // Atualiza a cada minuto

        return () => clearInterval(interval);
    }, [order, isCompleted]);

    return (
        <Card className={`w-full border border-default-200 transition-all ${isUrgent ? "border border-warning" : ""} ${isVeryUrgent ? "border-danger bg-danger-50" : ""}`}>
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between w-full gap-3">
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold truncate">{order.name}</h3>
                            {isUrgent && (
                                <Chip
                                    size="sm"
                                    color={isVeryUrgent ? "danger" : "warning"}
                                    variant="flat"
                                >
                                    {isVeryUrgent ? "URGENTE" : "Atenção"}
                                </Chip>
                            )}
                            <Chip
                                size="sm"
                                color={order.deliveryType === "delivery" ? "primary" : "secondary"}
                                variant="flat"
                            >
                                {order.deliveryType === "delivery" ? "Entrega" : "Retirada"}
                            </Chip>
                        </div>
                        <p className="text-sm text-default-600 font-medium">{order.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-lg font-bold text-primary">{formatCurrency(order.total)}</span>
                        <span className="text-sm text-default-400">{formatTime(order.createdAt)}</span>
                    </div>
                </div>
            </CardHeader>
            <CardBody className="pt-0">
                <div className="flex flex-col gap-3">
                    {/* Informações do Cliente */}
                    <div className="flex items-center gap-2 text-sm">
                        <Avatar
                            size="sm"
                            name={order.customerName}
                            className="bg-primary text-primary-foreground flex-shrink-0"
                        />
                        <div className="flex flex-col min-w-0 flex-1">
                            <span className="font-medium text-default-700 truncate">{order.customerName}</span>
                            <div className="flex items-center gap-2 text-xs text-default-500">
                                <PhoneCalling size={14} weight="Outline" />
                                <span>{order.customerPhone}</span>
                            </div>
                        </div>
                    </div>

                    {/* Endereço */}
                    <div className="flex items-start gap-2 text-sm text-default-600">
                        {order.deliveryType === "delivery" ? (
                            <MapPoint size={16} weight="Outline" className="mt-0.5 flex-shrink-0 text-default-400" />
                        ) : (
                            <Shop size={16} weight="Outline" className="mt-0.5 flex-shrink-0 text-default-400" />
                        )}
                        <span className="line-clamp-2">{order.address}</span>
                    </div>

                    {/* Tempo e Estatísticas */}
                    <div className="flex items-center justify-between text-xs text-default-500 pt-1 border-t border-default-200">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                                <ClockCircle size={14} weight="Outline" />
                                <span>
                                    {isPending
                                        ? `Recebido há ${elapsedTime}`
                                        : isInProduction
                                            ? `Em produção há ${productionTime}`
                                            : isSending
                                                ? `Enviando há ${productionTime}`
                                                : `Finalizado há ${elapsedTime}`
                                    }
                                </span>
                            </div>
                            {order.estimatedTime && (
                                <div className="flex items-center gap-1">
                                    <Calendar size={14} weight="Outline" />
                                    <span>Estimado: {order.estimatedTime} min</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Botões de Ação */}
                    {!isCompleted && (
                        <div className="flex gap-2 pt-2">
                            {isPending ? (
                                <Button
                                    color="primary"
                                    variant="solid"
                                    className="flex-1"
                                    startContent={<CheckCircle size={18} weight="Outline" />}
                                    onPress={onAccept}
                                >
                                    Aceitar Pedido
                                </Button>
                            ) : isInProduction ? (
                                <Button
                                    color="warning"
                                    variant="solid"
                                    className="flex-1"
                                    startContent={<Delivery size={18} weight="Outline" />}
                                    onPress={onSend}
                                >
                                    Enviar Pedido
                                </Button>
                            ) : isSending ? (
                                <Button
                                    color="success"
                                    variant="solid"
                                    className="flex-1"
                                    startContent={<CheckCircle size={18} weight="Outline" />}
                                    onPress={onComplete}
                                >
                                    Finalizar Pedido
                                </Button>
                            ) : null}
                            <Button
                                variant="bordered"
                                isIconOnly
                                className="flex-shrink-0"
                            >
                                <Eye size={18} weight="Outline" />
                            </Button>
                        </div>
                    )}
                </div>
            </CardBody>
        </Card>
    );
}

export function OrdersPage() {
    const [pendingOrders, setPendingOrders] = useState<Order[]>(initialPendingOrders);
    const [inProductionOrders, setInProductionOrders] = useState<Order[]>(initialInProductionOrders);
    const [sendingOrders, setSendingOrders] = useState<Order[]>(initialSendingOrders);
    const [completedOrders, setCompletedOrders] = useState<Order[]>(initialCompletedOrders);

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
            <div className="p-6">
                <h1 className="text-3xl font-bold">Pedidos</h1>
                <Button
                    variant="bordered"
                    isIconOnly
                    className="flex-shrink-0"
                >
                    <Plus size={18} />
                </Button>
            </div>

            <Divider />

            <div className="grid grid-cols-12 gap-4 px-6 py-3">
                <Input placeholder="Código do pedido" className="col-span-2" />
                <Input placeholder="Nome do cliente" className="col-span-2" />
            </div>


            <Divider />

            <div className="flex flex-1 overflow-hidden">
                {/* Coluna Pendentes */}
                <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center px-6 py-3">
                        <span className="font-semibold text-lg">Pendentes</span>
                        {pendingOrders.length > 0 && (
                            <Chip color="warning" variant="flat" size="sm">
                                {pendingOrders.length}
                            </Chip>
                        )}
                    </div>
                    <Divider />
                    <ScrollArea className="flex flex-col grow h-0 overflow-y-auto">
                        <div className="flex flex-col gap-4 p-6">
                            {pendingOrders.length > 0 ? (
                                pendingOrders
                                    .sort((a, b) => a.createdAt.valueOf() - b.createdAt.valueOf())
                                    .map((order) => (
                                        <OrderCard
                                            key={order.id}
                                            order={order}
                                            onAccept={() => handleAcceptOrder(order.id)}
                                            onSend={() => handleSendOrder(order.id)}
                                            onComplete={() => handleCompleteOrder(order.id)}
                                        />
                                    ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <CheckCircle size={64} weight="Outline" className="text-default-300 mb-4" />
                                    <p className="text-sm text-default-400">Nenhum pedido pendente</p>
                                    <p className="text-xs text-default-300 mt-1">Todos os pedidos foram processados</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                <Divider orientation="vertical" />

                {/* Coluna Preparando */}
                <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center px-6 py-3">
                        <span className="font-semibold text-lg">Preparando</span>
                        {inProductionOrders.length > 0 && (
                            <Chip color="primary" variant="flat" size="sm">
                                {inProductionOrders.length}
                            </Chip>
                        )}
                    </div>
                    <Divider />
                    <ScrollArea className="flex flex-col grow h-0 overflow-y-auto">
                        <div className="flex flex-col gap-4 p-6">
                            {inProductionOrders.length > 0 ? (
                                inProductionOrders
                                    .sort((a, b) => (a.acceptedAt?.valueOf() || 0) - (b.acceptedAt?.valueOf() || 0))
                                    .map((order) => (
                                        <OrderCard
                                            key={order.id}
                                            order={order}
                                            onAccept={() => handleAcceptOrder(order.id)}
                                            onSend={() => handleSendOrder(order.id)}
                                            onComplete={() => handleCompleteOrder(order.id)}
                                        />
                                    ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <ChefHatHeart size={64} weight="Outline" className="text-default-300 mb-4" />
                                    <p className="text-sm text-default-400">Nenhum pedido em produção</p>
                                    <p className="text-xs text-default-300 mt-1">Aceite pedidos para começar a preparação</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                <Divider orientation="vertical" />

                {/* Coluna Enviando */}
                <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center px-6 py-3">
                        <span className="font-semibold text-lg">Enviando</span>
                        {sendingOrders.length > 0 && (
                            <Chip color="warning" variant="flat" size="sm">
                                {sendingOrders.length}
                            </Chip>
                        )}
                    </div>
                    <Divider />
                    <ScrollArea className="flex flex-col grow h-0 overflow-y-auto">
                        <div className="flex flex-col gap-4 p-6">
                            {sendingOrders.length > 0 ? (
                                sendingOrders
                                    .sort((a, b) => (a.completedAt?.valueOf() || 0) - (b.completedAt?.valueOf() || 0))
                                    .map((order) => (
                                        <OrderCard
                                            key={order.id}
                                            order={order}
                                            onAccept={() => handleAcceptOrder(order.id)}
                                            onSend={() => handleSendOrder(order.id)}
                                            onComplete={() => handleCompleteOrder(order.id)}
                                        />
                                    ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Delivery size={64} weight="Outline" className="text-default-300 mb-4" />
                                    <p className="text-sm text-default-400">Nenhum pedido sendo enviado</p>
                                    <p className="text-xs text-default-300 mt-1">Pedidos prontos serão enviados aqui</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                <Divider orientation="vertical" />

                {/* Coluna Concluído */}
                <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center px-6 py-3">
                        <span className="font-semibold text-lg">Concluído</span>
                        {completedOrders.length > 0 && (
                            <Chip color="success" variant="flat" size="sm">
                                {completedOrders.length}
                            </Chip>
                        )}
                    </div>
                    <Divider />
                    <ScrollArea className="flex flex-col grow h-0 overflow-y-auto">
                        <div className="flex flex-col gap-4 p-6">
                            {completedOrders.length > 0 ? (
                                completedOrders
                                    .sort((a, b) => (b.completedAt?.valueOf() || 0) - (a.completedAt?.valueOf() || 0))
                                    .map((order) => (
                                        <OrderCard
                                            key={order.id}
                                            order={order}
                                            onAccept={() => handleAcceptOrder(order.id)}
                                            onSend={() => handleSendOrder(order.id)}
                                            onComplete={() => handleCompleteOrder(order.id)}
                                        />
                                    ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <CheckCircle size={64} weight="Outline" className="text-default-300 mb-4" />
                                    <p className="text-sm text-default-400">Nenhum pedido concluído</p>
                                    <p className="text-xs text-default-300 mt-1">Pedidos finalizados aparecerão aqui</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
}
