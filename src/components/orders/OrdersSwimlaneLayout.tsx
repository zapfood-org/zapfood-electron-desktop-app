
import { Chip, Divider } from "@heroui/react";
import { CheckCircle, ChefHatHeart, Delivery } from "@solar-icons/react";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import type { Order } from "./OrderCard";
import { OrderCard } from "./OrderCard";

interface OrdersSwimlaneLayoutProps {
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
    onAccept: (id: string) => void;
    onSend: (id: string) => void;
    onComplete: (id: string) => void;
    onEdit: (order: Order) => void;
    onViewDetails: (order: Order) => void;
}

export function OrdersSwimlaneLayout({
    pendingOrders,
    inProductionOrders,
    sendingOrders,
    completedOrders,
    visibleColumns,
    onAccept,
    onSend,
    onComplete,
    onEdit,
    onViewDetails
}: OrdersSwimlaneLayoutProps) {
    return (
        <div className="flex flex-1 overflow-y-auto gap-4 p-6 bg-default-50/50 flex-col">
            {/* Coluna Pendentes */}
            {visibleColumns.pending && (
                <div className="flex flex-col min-w-0 bg-background rounded-medium border border-default-200 shadow-sm transition-all w-full flex-none h-auto shrink-0 mb-4">
                    <div className="flex items-center justify-between px-4 py-3 bg-default-50/50 rounded-t-medium">
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
                    <ScrollArea className="w-full whitespace-nowrap" >
                        <div className="flex p-4 gap-4">
                            {pendingOrders.length > 0 ? (
                                pendingOrders
                                    .sort((a, b) => a.createdAt.valueOf() - b.createdAt.valueOf())
                                    .map((order) => (
                                        <div key={order.id} className="w-80 flex-none">
                                            <OrderCard
                                                order={order}
                                                onAccept={() => onAccept(order.id)}
                                                onSend={() => onSend(order.id)}
                                                onComplete={() => onComplete(order.id)}
                                                onEdit={() => onEdit(order)}
                                                onViewDetails={() => onViewDetails(order)}
                                            />
                                        </div>
                                    ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center w-full">
                                    <CheckCircle size={48} weight="Outline" className="text-default-300 mb-2" />
                                    <p className="text-sm text-default-400">Nenhum pedido pendente</p>
                                </div>
                            )}
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </div>
            )}

            {/* Coluna Preparando */}
            {visibleColumns.in_production && (
                <div className="flex flex-col min-w-0 bg-background rounded-medium border border-default-200 shadow-sm transition-all w-full flex-none h-auto shrink-0 mb-4">
                    <div className="flex items-center justify-between px-4 py-3 bg-default-50/50 rounded-t-medium">
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
                    <ScrollArea className="w-full whitespace-nowrap">
                        <div className="flex p-4 gap-4">
                            {inProductionOrders.length > 0 ? (
                                inProductionOrders
                                    .sort((a, b) => (a.acceptedAt?.valueOf() || 0) - (b.acceptedAt?.valueOf() || 0))
                                    .map((order) => (
                                        <div key={order.id} className="w-80 flex-none">
                                            <OrderCard
                                                order={order}
                                                onAccept={() => onAccept(order.id)}
                                                onSend={() => onSend(order.id)}
                                                onComplete={() => onComplete(order.id)}
                                                onEdit={() => onEdit(order)}
                                                onViewDetails={() => onViewDetails(order)}
                                            />
                                        </div>
                                    ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center w-full">
                                    <ChefHatHeart size={48} weight="Outline" className="text-default-300 mb-2" />
                                    <p className="text-sm text-default-400">Nenhum pedido em produção</p>
                                </div>
                            )}
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </div>
            )}

            {/* Coluna Enviando */}
            {visibleColumns.sending && (
                <div className="flex flex-col min-w-0 bg-background rounded-medium border border-default-200 shadow-sm transition-all w-full flex-none h-auto shrink-0 mb-4">
                    <div className="flex items-center justify-between px-4 py-3 bg-default-50/50 rounded-t-medium">
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
                    <ScrollArea className="w-full whitespace-nowrap">
                        <div className="flex p-4 gap-4">
                            {sendingOrders.length > 0 ? (
                                sendingOrders
                                    .sort((a, b) => (a.completedAt?.valueOf() || 0) - (b.completedAt?.valueOf() || 0))
                                    .map((order) => (
                                        <div key={order.id} className="w-80 flex-none">
                                            <OrderCard
                                                order={order}
                                                onAccept={() => onAccept(order.id)}
                                                onSend={() => onSend(order.id)}
                                                onComplete={() => onComplete(order.id)}
                                                onEdit={() => onEdit(order)}
                                                onViewDetails={() => onViewDetails(order)}
                                            />
                                        </div>
                                    ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center w-full">
                                    <Delivery size={48} weight="Outline" className="text-default-300 mb-2" />
                                    <p className="text-sm text-default-400">Nenhum pedido sendo enviado</p>
                                </div>
                            )}
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </div>
            )}

            {/* Coluna Concluído */}
            {visibleColumns.completed && (
                <div className="flex flex-col min-w-0 bg-background rounded-medium border border-default-200 shadow-sm transition-all w-full flex-none h-auto shrink-0 mb-4">
                    <div className="flex items-center justify-between px-4 py-3 bg-default-50/50 rounded-t-medium">
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
                    <ScrollArea className="w-full whitespace-nowrap">
                        <div className="flex p-4 gap-4">
                            {completedOrders.length > 0 ? (
                                completedOrders
                                    .sort((a, b) => (b.completedAt?.valueOf() || 0) - (a.completedAt?.valueOf() || 0))
                                    .map((order) => (
                                        <div key={order.id} className="w-80 flex-none">
                                            <OrderCard
                                                order={order}
                                                onAccept={() => onAccept(order.id)}
                                                onSend={() => onSend(order.id)}
                                                onComplete={() => onComplete(order.id)}
                                                onEdit={() => onEdit(order)}
                                                onViewDetails={() => onViewDetails(order)}
                                            />
                                        </div>
                                    ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center w-full">
                                    <CheckCircle size={48} weight="Outline" className="text-default-300 mb-2" />
                                    <p className="text-sm text-default-400">Nenhum pedido concluído</p>
                                </div>
                            )}
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </div>
            )}
        </div>
    );
}
