
import {
    Drawer,
    DrawerBody,
    DrawerContent,
    DrawerFooter,
    DrawerHeader
} from "@heroui/drawer";
import { Button, Card, CardBody, Checkbox, CheckboxGroup, Chip, Divider, Switch, useDisclosure } from "@heroui/react";
import { CheckCircle, ChefHatHeart, Delivery, PenNewRound, Settings } from "@solar-icons/react";
import { useState } from "react";
import { ScrollArea } from "../ui/scroll-area";
import type { Order } from "./OrderCard";
import { OrderCard } from "./OrderCard";
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
    onAccept: (id: string) => void;
    onSend: (id: string) => void;
    onComplete: (id: string) => void;
    onEdit: (order: Order) => void;
    onViewDetails: (order: Order) => void;
}

export function OrdersBoardLayout({
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
}: OrdersBoardLayoutProps) {
    const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onOpenChange: onDrawerOpenChange } = useDisclosure();
    const [autoAcceptEnabled, setAutoAcceptEnabled] = useState(false);
    const [notificationSound, setNotificationSound] = useState(true);
    const [acceptedChannels, setAcceptedChannels] = useState<string[]>(["delivery", "pickup", "dine_in"]);

    return (
        <div className="flex flex-1 overflow-hidden flex-row w-full">
            {/* Coluna Pendentes */}
            {visibleColumns.pending && (
                <div className="flex flex-1 flex-col min-w-0">
                    <div className="flex items-center justify-between px-6 py-3">
                        <div className="flex flex-1 items-center gap-2 justify-between">
                            <span className="font-semibold">Pendentes</span>
                            {pendingOrders.length > 0 && (
                                <Chip color="warning" variant="flat" size="sm" classNames={{ content: "font-semibold" }}>
                                    {pendingOrders.length}
                                </Chip>
                            )}
                        </div>
                    </div>

                    <Divider />

                    <div className="flex flex-col gap-4 px-6 py-3">
                        {/* Card de Aceitar Pedidos Automaticamente */}
                        <Card>
                            <CardBody className="p-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <Settings size={20} weight="Outline" className="text-primary" />
                                        </div>
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <h3 className="text-sm font-semibold">Aceitar Pedidos Automaticamente</h3>
                                            <p className="text-xs text-default-500">
                                                {autoAcceptEnabled
                                                    ? "Pedidos serão aceitos automaticamente"
                                                    : "Aceite manualmente cada pedido"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            isSelected={autoAcceptEnabled}
                                            onValueChange={setAutoAcceptEnabled}
                                            size="sm"
                                        />
                                        <Button
                                            isIconOnly
                                            variant="light"
                                            size="sm"
                                            onPress={onDrawerOpen}
                                            aria-label="Editar configurações"
                                        >
                                            <PenNewRound size={18} weight="Outline" />
                                        </Button>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
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
                                            onEdit={() => onEdit(order)}
                                            onViewDetails={() => onViewDetails(order)}
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
                    <div className="flex items-center justify-between px-6 py-3">
                        <div className="flex flex-1 items-center gap-2 justify-between">
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
                                            onEdit={() => onEdit(order)}
                                            onViewDetails={() => onViewDetails(order)}
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
                    <div className="flex items-center justify-between px-6 py-3">
                        <div className="flex flex-1 items-center gap-2 justify-between">
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
                                            onEdit={() => onEdit(order)}
                                            onViewDetails={() => onViewDetails(order)}
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
                    <div className="flex items-center justify-between px-6 py-3">
                        <div className="flex flex-1 items-center gap-2 justify-between">
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
                                            onEdit={() => onEdit(order)}
                                            onViewDetails={() => onViewDetails(order)}
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

            {/* Drawer de Configurações */}
            <Drawer
                isOpen={isDrawerOpen}
                onOpenChange={onDrawerOpenChange}
                placement="right"
                backdrop="blur"
            >
                <DrawerContent>
                    <DrawerHeader className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <Settings size={24} weight="Outline" />
                            <h2 className="text-xl font-bold">Configurações de Aceitação</h2>
                        </div>
                        <p className="text-sm text-default-500 font-normal">
                            Configure como os pedidos serão aceitos automaticamente
                        </p>
                    </DrawerHeader>
                    <DrawerBody>
                        <div className="flex flex-col gap-6">
                            {/* Switch Principal */}
                            <div className="flex items-center justify-between p-4 rounded-lg bg-default-50 border border-default-200">
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold">Aceitar Pedidos Automaticamente</span>
                                    <span className="text-xs text-default-500">
                                        Ative para aceitar pedidos sem confirmação manual
                                    </span>
                                </div>
                                <Switch
                                    isSelected={autoAcceptEnabled}
                                    onValueChange={setAutoAcceptEnabled}
                                />
                            </div>

                            {autoAcceptEnabled && (
                                <Divider />
                            )}

                            {/* Som de notificação */}
                            <div className="flex items-center justify-between p-4 rounded-lg bg-default-50 border border-default-200">
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold">Som de Notificação</span>
                                    <span className="text-xs text-default-500">
                                        Reproduzir som quando um novo pedido chegar
                                    </span>
                                </div>
                                <Switch
                                    isSelected={notificationSound}
                                    onValueChange={setNotificationSound}
                                />
                            </div>

                            {/* Filtros adicionais */}
                            <div className="flex flex-col gap-2">
                                <CheckboxGroup
                                    label="Aceitar apenas pedidos de"
                                    value={acceptedChannels}
                                    onValueChange={(value) => {
                                        if (value.length > 0) {
                                            setAcceptedChannels(value);
                                        }
                                    }}
                                >
                                    <Checkbox value="delivery">Delivery</Checkbox>
                                    <Checkbox value="pickup">Retirada</Checkbox>
                                    <Checkbox value="dine_in">Balcão</Checkbox>
                                </CheckboxGroup>
                            </div>
                        </div>
                    </DrawerBody>
                    <DrawerFooter>
                        <Button variant="light" onPress={() => onDrawerOpenChange()}>
                            Fechar
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </div>
    );
}
