
import { Avatar, Button, Card, CardBody, CardHeader, Chip } from "@heroui/react";
import { Calendar, CheckCircle, ClockCircle, Delivery, Eye, MapPoint, PhoneCalling, Shop } from "@solar-icons/react";
import moment from "moment";
import { useEffect, useState } from "react";

export type OrderStatus = "pending" | "in_production" | "sending" | "completed";

export interface Order {
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

export function OrderCard({
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
