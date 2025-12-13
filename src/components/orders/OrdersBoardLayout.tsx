
import { Chip, Divider } from "@heroui/react";
import { CheckCircle, ChefHatHeart, Delivery } from "@solar-icons/react";
import { ScrollArea } from "../ui/scroll-area";
import { OrderCard } from "./OrderCard";
import type { Order } from "./OrderCard";

interface OrdersBoardLayoutProps {
    pendingOrders: Order[];
    inProductionOrders: Order[];
    sendingOrders: Order[];
    completedOrders: Order[];
    visibleColumns: {
        pending: boolean;
        in_production: boolean;
        sending: boolean;
        completed: boolean;
    };
    onAccept: (id: number) => void;
    onSend: (id: number) => void;
    onComplete: (id: number) => void;
}

export function OrdersBoardLayout({
    pendingOrders,
    inProductionOrders,
    sendingOrders,
    completedOrders,
    visibleColumns,
    onAccept,
    onSend,
    onComplete
}: OrdersBoardLayoutProps) {
    return (
        <div className="flex flex-1 overflow-hidden flex-row w-full">
            {/* Coluna Pendentes */}
            {visibleColumns.pending && (
                <div className="flex flex-1 flex-col min-w-0">
                    <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">Pendentes</span>
                            {pendingOrders.length > 0 && (
                                <Chip color="warning" variant="flat" size="sm" classNames={{ content: "font-semibold" }}>
                                    {pendingOrders.length}
                                </Chip>
                            )}
                        </div>
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
                                            onAccept={() => onAccept(order.id)}
                                            onSend={() => onSend(order.id)}
                                            onComplete={() => onComplete(order.id)}
                                        />
                                    ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center select-none">
                                    <CheckCircle size={64} weight="Outline" className="text-default-300 mb-4" />
                                    <p className="text-sm text-default-400">Nenhum pedido pendente</p>
                                    <p className="text-xs text-default-300 mt-1">Todos os pedidos foram processados</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            )}

            <Divider orientation="vertical" />

            {/* Coluna Preparando */}
            {visibleColumns.in_production && (
                <div className="flex flex-1 flex-col min-w-0">
                    <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">Preparando</span>
                            {inProductionOrders.length > 0 && (
                                <Chip color="primary" variant="flat" size="sm" classNames={{ content: "font-semibold" }}>
                                    {inProductionOrders.length}
                                </Chip>
                            )}
                        </div>
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
                                            onAccept={() => onAccept(order.id)}
                                            onSend={() => onSend(order.id)}
                                            onComplete={() => onComplete(order.id)}
                                        />
                                    ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center select-none">
                                    <ChefHatHeart size={64} weight="Outline" className="text-default-300 mb-4" />
                                    <p className="text-sm text-default-400">Nenhum pedido em produção</p>
                                    <p className="text-xs text-default-300 mt-1">Aceite pedidos para começar a preparação</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            )}

            <Divider orientation="vertical" />

            {/* Coluna Enviando */}
            {visibleColumns.sending && (
                <div className="flex flex-1 flex-col min-w-0">
                    <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">Enviando</span>
                            {sendingOrders.length > 0 && (
                                <Chip color="warning" variant="flat" size="sm" classNames={{ content: "font-semibold" }}>
                                    {sendingOrders.length}
                                </Chip>
                            )}
                        </div>
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
                                            onAccept={() => onAccept(order.id)}
                                            onSend={() => onSend(order.id)}
                                            onComplete={() => onComplete(order.id)}
                                        />
                                    ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center select-none">
                                    <Delivery size={64} weight="Outline" className="text-default-300 mb-4" />
                                    <p className="text-sm text-default-400">Nenhum pedido sendo enviado</p>
                                    <p className="text-xs text-default-300 mt-1">Pedidos prontos serão enviados aqui</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            )}

            <Divider orientation="vertical" />

            {/* Coluna Concluído */}
            {visibleColumns.completed && (
                <div className="flex flex-1 flex-col min-w-0">
                    <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">Concluído</span>
                            {completedOrders.length > 0 && (
                                <Chip color="success" variant="flat" size="sm" classNames={{ content: "font-semibold" }}>
                                    {completedOrders.length}
                                </Chip>
                            )}
                        </div>
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
                                            onAccept={() => onAccept(order.id)}
                                            onSend={() => onSend(order.id)}
                                            onComplete={() => onComplete(order.id)}
                                        />
                                    ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center select-none">
                                    <CheckCircle size={64} weight="Outline" className="text-default-300 mb-4" />
                                    <p className="text-sm text-default-400">Nenhum pedido concluído</p>
                                    <p className="text-xs text-default-300 mt-1">Pedidos finalizados aparecerão aqui</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            )}
        </div>
    );
}
