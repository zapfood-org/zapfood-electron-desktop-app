import { Accordion, AccordionItem, Button, Chip, Divider, Spinner } from "@heroui/react";
import { ArrowLeft, BillList, CartLargeMinimalistic } from "@solar-icons/react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import type { Order } from "../components/orders/OrderCard";
import { api, restaurantId } from "../services/api";

interface Bill {
    id: string;
    name: string;
}

interface Table {
    id: string;
    name: string;
}

export function TableDetailsPage() {
    const { tableId } = useParams();
    const navigate = useNavigate();

    const [table, setTable] = useState<Table | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [bills, setBills] = useState<Bill[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (tableId) {
            fetchData();
        }
    }, [tableId]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Fetch table details first
            const tableRes = await api.get(`/tables/${tableId}`);
            setTable(tableRes.data);

            const [ordersRes, billsRes] = await Promise.all([
                api.get('/orders', {
                    params: {
                        restaurantId,
                        size: 1000
                    }
                }),
                api.get('/bills', {
                    params: { restaurantId, size: 100 }
                })
            ]);

            let fetchedOrders = ordersRes.data.orders || [];

            // Filter orders for this table
            if (tableId) {
                fetchedOrders = fetchedOrders.filter((o: any) => {
                    const orderTableId = o.tableId || (o.table ? o.table.id : null);
                    const isForTable = orderTableId === tableId;

                    // Show active (not finished) orders
                    const isFinished = o.status === 'completed' || o.status === 'cancelled';
                    return isForTable && !isFinished;
                });
            }

            const mappedOrders: Order[] = fetchedOrders.map((apiOrder: any) => ({
                id: apiOrder.id,
                name: apiOrder.name || `Pedido #${apiOrder.displayId}`,
                description: "",
                customerName: apiOrder.customerName,
                customerPhone: "",
                address: "",
                total: apiOrder.total || 0,
                deliveryType: "dine_in",
                createdAt: apiOrder.createdAt,
                status: apiOrder.status.toLowerCase(),
                isPaid: apiOrder.isPaid,
                items: apiOrder.items || [],
                billId: apiOrder.billId,
                tableId: apiOrder.tableId
            }));

            setOrders(mappedOrders);
            setBills(billsRes.data.bills || []);

        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            toast.error("Erro ao carregar detalhes da mesa");
        } finally {
            setIsLoading(false);
        }
    };

    const ordersByBill = orders.reduce((acc, order) => {
        const billId = order.billId || 'no-bill';
        if (!acc[billId]) acc[billId] = [];
        acc[billId].push(order);
        return acc;
    }, {} as Record<string, Order[]>);

    const formatCurrency = (val: number) => `R$ ${val.toFixed(2).replace('.', ',')}`;

    if (isLoading) {
        return (
            <div className="flex flex-1 items-center justify-center h-full">
                <Spinner size="lg" label="Carregando..." />
            </div>
        );
    }

    if (!table) {
        return (
            <div className="flex flex-col items-center justify-center flex-1 h-full gap-4">
                <p className="text-xl font-bold">Mesa não encontrada</p>
                <Button onPress={() => navigate(-1)}>Voltar</Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col flex-1 h-full bg-default-50">
            {/* Header */}
            <div className="flex items-center gap-4 p-6 bg-background border-b border-default-200">
                <Button isIconOnly variant="light" onPress={() => navigate(-1)}>
                    <ArrowLeft size={24} />
                </Button>
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        {table.name}
                        <Chip size="sm" color="success" variant="flat">Ocupada</Chip>
                    </h1>
                    <p className="text-small text-default-500">Detalhes dos pedidos e comandas</p>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {Object.keys(ordersByBill).length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 text-default-400">
                        <CartLargeMinimalistic size={64} />
                        <p className="text-xl">Nenhum pedido aberto nesta mesa</p>
                        <Button color="primary" variant="flat">
                            Novo Pedido
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
                        <Accordion selectionMode="multiple" defaultExpandedKeys="all" variant="splitted">
                            {Object.entries(ordersByBill).map(([billId, billOrders]) => {
                                const billName = billId === 'no-bill'
                                    ? "Sem Comanda / Avulso"
                                    : bills.find(b => b.id === billId)?.name || "Comanda Desconhecida";

                                const billTotal = billOrders.reduce((sum, o) => sum + o.total, 0);

                                return (
                                    <AccordionItem
                                        key={billId}
                                        aria-label={billName}
                                        title={
                                            <div className="flex items-center justify-between w-full pr-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                                                        <BillList size={24} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-lg">{billName}</span>
                                                        <span className="text-tiny text-default-500">{billOrders.length} pedido{billOrders.length > 1 ? 's' : ''}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-tiny text-default-500">Subtotal</span>
                                                    <span className="font-bold text-success text-xl">
                                                        {formatCurrency(billTotal)}
                                                    </span>
                                                </div>
                                            </div>
                                        }
                                        classNames={{
                                            base: "group-[.is-splitted]:px-4 group-[.is-splitted]:bg-background group-[.is-splitted]:shadow-sm",
                                            title: "py-2"
                                        }}
                                    >
                                        <div className="flex flex-col gap-3 pb-4 pt-2">
                                            {billOrders.map(order => (
                                                <div key={order.id} className="flex flex-col p-4 bg-default-50 rounded-xl border border-default-100">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <Chip size="sm" variant="dot" color={
                                                                order.status === 'pending' ? 'warning' :
                                                                    order.status === 'preparing' ? 'primary' :
                                                                        order.status === 'delivering' ? 'secondary' : 'default'
                                                            }>
                                                                {order.status === 'pending' ? 'Pendente' :
                                                                    order.status === 'preparing' ? 'Preparando' :
                                                                        order.status === 'delivering' ? 'Entregue' : order.status}
                                                            </Chip>
                                                            <span className="font-semibold">{order.name}</span>
                                                        </div>
                                                        <span className="font-semibold text-default-700">{formatCurrency(order.total)}</span>
                                                    </div>

                                                    {/* Items Details */}
                                                    <div className="flex flex-col gap-2 pl-4 border-l-2 border-default-200">
                                                        {order.items && order.items.map((item: any, idx: number) => (
                                                            <div key={idx} className="flex justify-between text-sm">
                                                                <div className="flex gap-2">
                                                                    <span className="font-medium text-default-700">{item.quantity}x</span>
                                                                    <span className="text-default-600">{item.product?.name || item.productName || "Item"}</span>
                                                                </div>
                                                                {item.observation && (
                                                                    <span className="text-default-400 italic text-xs">
                                                                        {item.observation}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}

                                            <Divider className="my-2" />
                                            <div className="flex justify-end gap-2">
                                                <Button size="sm" variant="flat" color="primary">
                                                    Adicionar Pedido
                                                </Button>
                                                {/* Future actions: Close Bill, Print, etc */}
                                            </div>
                                        </div>
                                    </AccordionItem>
                                );
                            })}
                        </Accordion>
                    </div>
                )}
            </div>
        </div>
    );
}
