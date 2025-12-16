
import { Button, Card, CardBody, CardHeader, Chip, Tooltip } from "@heroui/react";
import { BillList, Calendar, CheckCircle, ClockCircle, Delivery, MapPoint, PhoneCalling, Printer, Shop } from "@solar-icons/react";
import moment from "moment";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export type OrderStatus = "pending" | "preparing" | "delivering" | "completed";

export interface Order {
    id: string;
    name: string;
    description: string;
    customerName: string;
    customerPhone: string;
    address: string;
    total: number;
    deliveryType: "delivery" | "pickup" | "dine_in";
    createdAt: moment.Moment;
    acceptedAt?: moment.Moment;
    completedAt?: moment.Moment;
    status: OrderStatus;
    estimatedTime?: number; // minutos estimados
    isPaid?: boolean;
    items?: any[]; // Raw items from API
    tableId?: string;
    commandId?: string;
    observation?: string;
}

export function OrderCard({
    order,
    onAccept,
    onComplete,
    onSend,
    onEdit,
    onViewDetails
}: {
    order: Order;
    onAccept?: () => void;
    onComplete?: () => void;
    onSend?: () => void;
    onEdit?: () => void;
    onViewDetails?: () => void;
}) {
    const [elapsedTime, setElapsedTime] = useState("");
    const [productionTime, setProductionTime] = useState("");
    const [pendingAction, setPendingAction] = useState<"accept" | "send" | "complete" | null>(null);
    const navigate = useNavigate();
    const { tenantId } = useParams();

    const formatTime = (date: moment.Moment) => date.format("HH:mm");
    const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace(".", ",")}`;

    const isPending = order.status === "pending";
    const isInProduction = order.status === "preparing";
    const isSending = order.status === "delivering";
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
                        </div>
                        <div className="flex items-center gap-2">
                            {isUrgent && (
                                <Chip
                                    size="sm"
                                    color={isVeryUrgent ? "danger" : "warning"}
                                    variant="flat"
                                >
                                    {isVeryUrgent ? "ATRASADO" : "Atenção"}
                                </Chip>
                            )}
                            <Chip
                                size="sm"
                                color={order.deliveryType === "delivery" ? "primary" : order.deliveryType === "dine_in" ? "success" : "secondary"}
                                variant="flat"
                            >
                                {order.deliveryType === "delivery" ? "Entrega" : order.deliveryType === "dine_in" ? "Consumo no local" : "Retirada"}
                            </Chip>
                            {order.isPaid && (
                                <Chip size="sm" color="success" variant="solid" className="text-white font-bold">
                                    PAGO
                                </Chip>
                            )}
                        </div>
                    </div>
                    <div className="flex items-end gap-1">
                        <Tooltip content="Imprimir">
                            <Button size="sm" variant="flat" color="primary" isIconOnly>
                                <Printer size={16} weight="Outline" />
                            </Button>
                        </Tooltip>
                        <Tooltip content="Detalhes">
                            <Button
                                size="sm"
                                variant="flat"
                                color="primary"
                                isIconOnly
                                onPress={order.status === "completed" ? onViewDetails : onEdit}
                            >
                                <BillList size={16} weight="Outline" />
                            </Button>
                        </Tooltip>
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
                        <span className="font-medium text-default-700 truncate">{order.customerName}</span>
                        <div className="flex items-center gap-2 text-xs text-default-500">
                            <PhoneCalling size={14} weight="Outline" />
                            <span>{order.customerPhone}</span>
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
                            {pendingAction ? (
                                <>
                                    <Button
                                        color="danger"
                                        variant="solid"
                                        className="flex-1 text-white"
                                        onPress={() => setPendingAction(null)}
                                    >
                                        Voltar
                                    </Button>
                                    <Button
                                        color={pendingAction === "accept" ? "primary" : pendingAction === "send" ? "warning" : "success"}
                                        variant="solid"
                                        className="flex-1 text-white"
                                        startContent={<CheckCircle size={18} weight="Outline" />}
                                        onPress={() => {
                                            if (pendingAction === "accept" && onAccept) {
                                                onAccept();
                                            } else if (pendingAction === "send" && onSend) {
                                                onSend();
                                            } else if (pendingAction === "complete" && onComplete) {
                                                onComplete();
                                            }
                                            setPendingAction(null);
                                        }}
                                    >
                                        Confirmar
                                    </Button>
                                </>
                            ) : (
                                <>
                                    {order.isPaid && (
                                        <Button
                                            color="success"
                                            variant="solid"
                                            className="flex-1 text-white"
                                            startContent={<CheckCircle size={18} weight="Outline" />}
                                            onPress={() => setPendingAction("complete")}
                                        >
                                            Concluir Pedido
                                        </Button>
                                    )}
                                    {isPending && !order.isPaid && (
                                        <Button
                                            color="primary"
                                            variant="solid"
                                            className="flex-1 text-white"
                                            startContent={<CheckCircle size={18} weight="Outline" />}
                                            onPress={() => setPendingAction("accept")}
                                        >
                                            Aceitar Pedido
                                        </Button>
                                    )}
                                    {isInProduction && !order.isPaid && (
                                        <Button
                                            color="warning"
                                            variant="solid"
                                            className="flex-1 text-white"
                                            startContent={<Delivery size={18} weight="Outline" />}
                                            onPress={() => setPendingAction("send")}
                                        >
                                            Enviar Pedido
                                        </Button>
                                    )}
                                    {isSending && !order.isPaid && (
                                        <Button
                                            color="success"
                                            variant="solid"
                                            className="flex-1 text-white"
                                            startContent={order.deliveryType === "dine_in" ? <BillList size={18} weight="Outline" /> : <CheckCircle size={18} weight="Outline" />}
                                            onPress={() => {
                                                if (order.deliveryType === "dine_in") {
                                                    navigate(`/${tenantId}/orders/${order.id}/checkout`);
                                                } else {
                                                    setPendingAction("complete");
                                                }
                                            }}
                                        >
                                            {order.deliveryType === "dine_in" ? "Ir para Caixa" : "Finalizar Pedido"}
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </CardBody>
        </Card>
    );
}
