import { Button, Divider, Input, Popover, PopoverContent, PopoverTrigger, Radio, RadioGroup, Switch, Tab, Tabs, useDisclosure, Spinner } from "@heroui/react";
import { BillList, Settings } from "@solar-icons/react";
import { Plus, Search } from "lucide-react";
import moment from "moment";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";



import { NewOrderModal, type NewOrderFormData } from "../components/orders/NewOrderModal";
import type { Order } from "../components/orders/OrderCard";
import { OrderDetailsModal } from "../components/orders/OrderDetailsModal";
import { OrdersBoardLayout } from "../components/orders/OrdersBoardLayout";
import { OrdersSwimlaneLayout } from "../components/orders/OrdersSwimlaneLayout";
import { api, restaurantId } from "../services/api";

export function OrdersPage() {
    const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
    const [inProductionOrders, setInProductionOrders] = useState<Order[]>([]);
    const [sendingOrders, setSendingOrders] = useState<Order[]>([]);
    const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(false);

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
    const processedPaymentRef = useRef<string | null>(null);

    // Fetch Orders
    const fetchOrders = async (background = false) => {
        if (!background) setIsLoading(true);
        try {
            const [ordersResponse, tablesResponse] = await Promise.all([
                api.get(`/orders`, {
                    params: { restaurantId, size: 100 }
                }),
                api.get(`/tables`, {
                    params: { restaurantId, size: 100 }
                })
            ]);

            const fetchedOrders = ordersResponse.data.orders || [];
            const fetchedTables = tablesResponse.data.tables || [];

            // Create a lookup map for tables
            const tablesMap = new Map(fetchedTables.map((t: any) => [t.id, t.name]));

            // Map API orders to UI Order interface
            const mappedOrders: Order[] = fetchedOrders.map((apiOrder: any) => {
                let status: any = apiOrder.status ? apiOrder.status.toLowerCase() : 'pending';
                let deliveryType: any = apiOrder.type ? apiOrder.type.toLowerCase() : 'delivery';

                if (status === 'in_production') status = 'preparing';
                if (status === 'sending') status = 'delivering';

                // Normalize items description
                const itemsList = apiOrder.items || [];
                let description = itemsList.map((i: any) => `${i.quantity}x ${i.productName || i.name || 'Item'}`).join(', ');
                if (!description && itemsList.length === 0) description = "Sem itens";

                // Resolve Table Name
                let addressDisplay = apiOrder.deliveryAddress || "Sem endereço";
                if (deliveryType === 'dine_in') {
                    if (apiOrder.table && apiOrder.table.name) {
                        addressDisplay = apiOrder.table.name;
                    } else if (apiOrder.tableName) {
                        addressDisplay = apiOrder.tableName;
                    } else if (apiOrder.tableId) {
                        // Try lookup from fetched tables
                        const tableName = tablesMap.get(apiOrder.tableId);
                        addressDisplay = tableName ? tableName : `Mesa ${apiOrder.tableId}`;
                    } else {
                        addressDisplay = "Mesa desconhecida";
                    }
                }

                return {
                    id: apiOrder.id,
                    name: `Pedido #${String(apiOrder.displayId).padStart(3, "0")}`,
                    description: description,
                    customerName: apiOrder.customerName || "Cliente",
                    customerPhone: apiOrder.customerPhone || "Não informado",
                    address: addressDisplay,
                    total: apiOrder.total || 0,
                    deliveryType: deliveryType,
                    createdAt: moment(apiOrder.createdAt),
                    acceptedAt: apiOrder.acceptedAt ? moment(apiOrder.acceptedAt) : undefined,
                    completedAt: apiOrder.completedAt ? moment(apiOrder.completedAt) : undefined,
                    status: status,
                    estimatedTime: apiOrder.estimatedTime,
                    isPaid: false, // Default
                    items: apiOrder.items || [],
                    tableId: apiOrder.tableId,
                    billId: apiOrder.billId,
                    observation: apiOrder.observation
                };
            });

            // Distribute into columns based on new values
            setPendingOrders(mappedOrders.filter(o => o.status === 'pending'));
            setInProductionOrders(mappedOrders.filter(o => o.status === 'preparing'));
            setSendingOrders(mappedOrders.filter(o => o.status === 'delivering'));
            setCompletedOrders(mappedOrders.filter(o => o.status === 'completed'));

        } catch (error) {
            console.error("Erro ao buscar pedidos:", error);
            toast.error("Erro ao carregar pedidos");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Handler para mover pedidos pagos para concluído
    const handlePaymentSuccess = useCallback((paidOrderId: string) => {
        // Buscar o pedido em qualquer uma das listas e mover para concluído
        const updateList = (prev: Order[]) => {
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
        }

        setPendingOrders(prev => updateList(prev));
        setInProductionOrders(prev => updateList(prev));
        setSendingOrders(prev => updateList(prev));
    }, []);

    useEffect(() => {
        if (location.state?.paymentSuccess && location.state?.orderId) {
            const paidOrderId = String(location.state.orderId);

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
    const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
    const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);
    const [orderToView, setOrderToView] = useState<Order | null>(null);

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            await api.patch(`/orders/${orderId}`, { status: newStatus.toUpperCase() });
        } catch (error) {
            console.error("Erro ao atualizar status:", error);
        }
    }

    const handleAcceptOrder = async (orderId: string) => {
        const order = pendingOrders.find(o => o.id === orderId);
        if (!order) return;

        const updatedOrder: Order = {
            ...order,
            status: "preparing",
            acceptedAt: moment(),
        };

        setPendingOrders(prev => prev.filter(o => o.id !== orderId));
        setInProductionOrders(prev => [...prev, updatedOrder].sort((a, b) =>
            (a.acceptedAt?.valueOf() || 0) - (b.acceptedAt?.valueOf() || 0)
        ));

        // API Call: Expects PREPARING
        await updateOrderStatus(orderId, "PREPARING");

        toast.success(`${order.name} foi movido para produção`);
    };

    const handleSendOrder = async (orderId: string) => {
        const order = inProductionOrders.find(o => o.id === orderId);
        if (!order) return;

        const updatedOrder: Order = {
            ...order,
            status: "delivering",
            completedAt: moment(),
        };

        setInProductionOrders(prev => prev.filter(o => o.id !== orderId));
        setSendingOrders(prev => [...prev, updatedOrder].sort((a, b) =>
            (a.completedAt?.valueOf() || 0) - (b.completedAt?.valueOf() || 0)
        ));

        // API Call: Expects DELIVERING
        await updateOrderStatus(orderId, "DELIVERING");

        toast.warning(`${order.name} foi enviado para entrega`);
    };

    const handleCompleteOrder = async (orderId: string) => {
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

        await updateOrderStatus(orderId, "COMPLETED");

        toast.success(`${order.name} foi finalizado com sucesso!`);
    };

    const handleEditOrder = (order: Order) => {
        if (order.status === "completed") {
            return;
        }
        setOrderToEdit(order);
        onOpen();
    };

    const handleViewDetails = (order: Order) => {
        setOrderToView(order);
        onDetailsOpen();
    };

    const handleUpdateOrder = async (orderId: string, formData: NewOrderFormData) => {
        try {
            const payload = {
                type: formData.deliveryType.toUpperCase(),
                customerName: formData.customerName,
                customerPhone: formData.customerPhone,
                deliveryAddress: formData.address,
                tableId: formData.table || null,
                billId: formData.bill || null,
                observation: formData.observation,
                items: formData.products.map(p => ({
                    productId: p.product.id,
                    quantity: p.quantity,
                    observation: "",
                })),
                restaurantId: restaurantId,
            };

            await api.patch(`/orders/${orderId}`, payload);

            toast.success("Pedido atualizado com sucesso!");
            setOrderToEdit(null);
            onClose(); // Close NewOrderModal
            fetchOrders(true); // Refresh list in background

        } catch (error) {
            console.error("Erro ao atualizar pedido:", error);
            toast.error("Erro ao atualizar pedido.");
        }
    };

    const handleCreateOrder = async (formData: NewOrderFormData) => {
        try {
            const payload = {
                type: formData.deliveryType.toUpperCase(),
                customerName: formData.customerName,
                customerPhone: formData.customerPhone,
                deliveryAddress: formData.address,
                tableId: formData.table || undefined,
                billId: formData.bill || undefined,
                observation: formData.observation,
                items: formData.products.map(p => ({
                    productId: p.product.id,
                    quantity: p.quantity,
                    observation: "",
                })),
                restaurantId: restaurantId,
                estimatedTime: 30,
                status: 'PREPARING' // Pedidos manuais vão direto para PREPARING (produção)
            };

            await api.post(`/orders`, payload);

            toast.success("Pedido criado com sucesso!");
            setOrderToEdit(null);
            fetchOrders(true); // Refresh list in background

        } catch (error) {
            console.error("Erro ao criar pedido:", error);
            toast.error("Erro ao criar pedido.");
        }
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

            {isLoading ? (
                <div className="flex flex-1 items-center justify-center">
                    <Spinner size="lg" />
                </div>
            ) : (
                layoutMode === "columns" ? (
                    <OrdersBoardLayout
                        pendingOrders={pendingOrders}
                        inProductionOrders={inProductionOrders}
                        sendingOrders={sendingOrders}
                        completedOrders={completedOrders}
                        visibleColumns={visibleColumns}
                        // @ts-ignore
                        onAccept={handleAcceptOrder}
                        // @ts-ignore
                        onSend={handleSendOrder}
                        // @ts-ignore
                        onComplete={handleCompleteOrder}
                        onEdit={handleEditOrder}
                        onViewDetails={handleViewDetails}
                    />
                ) : (
                    <OrdersSwimlaneLayout
                        pendingOrders={pendingOrders}
                        inProductionOrders={inProductionOrders}
                        sendingOrders={sendingOrders}
                        completedOrders={completedOrders}
                        visibleColumns={visibleColumns}
                        // @ts-ignore
                        onAccept={handleAcceptOrder}
                        // @ts-ignore
                        onSend={handleSendOrder}
                        // @ts-ignore
                        onComplete={handleCompleteOrder}
                        onEdit={handleEditOrder}
                        onViewDetails={handleViewDetails}
                    />
                )
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

            {/* Modal de Detalhes do Pedido */}
            <OrderDetailsModal
                isOpen={isDetailsOpen}
                onClose={() => {
                    setOrderToView(null);
                    onDetailsClose();
                }}
                order={orderToView}
                onEdit={handleEditOrder}
            />
        </div>
    );
}
