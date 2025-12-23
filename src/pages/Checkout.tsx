
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button, Card, CardBody, Checkbox, Divider, Input, useDisclosure, Spinner } from "@heroui/react";
import { ArrowLeft, BillList, Card as CardIcon, CheckCircle, MinusCircle, Printer, RoundAltArrowDown, RoundAltArrowUp, Wallet, WalletMoney } from "@solar-icons/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Keypad } from "../components/checkout/Keypad";
import { SplitBillModal } from "../components/checkout/SplitBillModal";
import { api } from "../services/api";
import { authClient } from "@/lib/auth-client";

interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
    isPaid?: boolean;
    paidQuantity?: number; // Quantidade já paga
}

interface Order {
    id: string;
    table?: string;
    customer?: string;
    items: OrderItem[];
    subtotal: number;
    serviceFee: number;
}

export function CheckoutPage() {
    const { data: activeOrg } = authClient.useActiveOrganization();
    const restaurantId = activeOrg?.id;
    
    const navigate = useNavigate();
    const { orderId, tenantId } = useParams();
    const { isOpen: isSplitOpen, onOpen: onOpenSplit, onClose: onCloseSplit } = useDisclosure();


    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

    // Estado para itens expandidos (mostrando unidades individuais) - usando Set para Accordion
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    // Estado para unidades individuais selecionadas: "itemId-unitIndex"
    const [selectedUnits, setSelectedUnits] = useState<Set<string>>(new Set());
    // Estado para unidades individuais pagas: "itemId-unitIndex"
    const [paidUnits, setPaidUnits] = useState<Set<string>>(new Set());
    // Initialize with all unpaid items selected by default
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [selectedPayment, setSelectedPayment] = useState<string>("cash");
    const [amountPaid, setAmountPaid] = useState<number>(0);
    const [amountPaidString, setAmountPaidString] = useState<string>("");
    const [splitAmount, setSplitAmount] = useState<number | null>(null);

    // Fetch Order
    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId) return;
            setIsLoading(true);
            try {
                const response = await api.get(`/orders/${orderId}`, {
                    params: { restaurantId }
                });
                const apiOrder = response.data;

                // Transform Items
                const items: OrderItem[] = (apiOrder.items || []).map((i: any, index: number) => ({
                    id: i.id || `item-${index}`,
                    name: i.productName || i.name || 'Item',
                    quantity: i.quantity || 1,
                    price: i.price || (i.product ? i.product.price : 0) || 0,
                    isPaid: false,
                    paidQuantity: 0
                }));

                // Calculate subtotal if not provided
                const subtotal = apiOrder.total || items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
                const serviceFee = subtotal * 0.1; // 10% assumed

                let tableName = "";
                if (apiOrder.tableId) {
                    try {
                        const tableResponse = await api.get(`/tables/${apiOrder.tableId}`);
                        tableName = tableResponse.data.name;
                    } catch (error) {
                        console.error("Erro ao buscar mesa:", error);
                        tableName = `${apiOrder.tableId}`;
                    }
                }

                const fetchedOrder: Order = {
                    id: apiOrder.id,
                    table: tableName,
                    customer: apiOrder.customerName,
                    items: items,
                    subtotal: subtotal,
                    serviceFee: serviceFee
                };

                setOrder(fetchedOrder);
                setOrderItems(items);
                // Select all unpaid items by default
                setSelectedItems(new Set(items.map(i => i.id)));

            } catch (error) {
                console.error("Erro ao buscar pedido:", error);
                toast.error("Erro ao carregar detalhes do pedido");
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    // Toggle expand/collapse item
    const handleToggleExpand = (itemId: string) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(itemId)) {
            newExpanded.delete(itemId);
        } else {
            newExpanded.add(itemId);
        }
        setExpandedItems(newExpanded);
    };

    // Toggle selection of individual unit
    const handleToggleUnit = (itemId: string, unitIndex: number) => {
        const unitKey = `${itemId}-${unitIndex}`;
        const newSelected = new Set(selectedUnits);
        if (newSelected.has(unitKey)) {
            newSelected.delete(unitKey);
        } else {
            newSelected.add(unitKey);
        }
        setSelectedUnits(newSelected);
        setSplitAmount(null);
    };

    // Get unpaid quantity for an item
    const getUnpaidQuantity = (item: OrderItem) => {
        const paidQty = item.paidQuantity || 0;
        return item.quantity - paidQty;
    };

    // Get selected quantity for an item (considering both item selection and unit selection)
    const getSelectedQuantity = (item: OrderItem) => {
        if (expandedItems.has(item.id)) {
            // Count selected units
            let count = 0;
            for (let i = 0; i < item.quantity; i++) {
                const unitKey = `${item.id}-${i}`;
                if (selectedUnits.has(unitKey) && !paidUnits.has(unitKey)) {
                    count++;
                }
            }
            return count;
        } else {
            // If item is selected as whole
            return selectedItems.has(item.id) && !item.isPaid ? getUnpaidQuantity(item) : 0;
        }
    };

    // Check if there's any selection (items or units)
    const hasSelection = useMemo(() => {
        return selectedItems.size > 0 || selectedUnits.size > 0;
    }, [selectedItems, selectedUnits]);

    // Calculate totals based on unpaid items
    const unpaidItems = useMemo(() => {
        return orderItems.map(item => {
            const unpaidQty = getUnpaidQuantity(item);
            return { ...item, unpaidQuantity: unpaidQty };
        }).filter(item => item.unpaidQuantity > 0);
    }, [orderItems]);

    const unpaidSubtotal = useMemo(() => {
        return unpaidItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }, [unpaidItems]);

    const serviceFeeRate = 0.1; // 10%
    const unpaidServiceFee = unpaidSubtotal * serviceFeeRate;
    const unpaidTotal = unpaidSubtotal + unpaidServiceFee;

    // Calculate selected items totals (considering both item and unit selection)
    const selectedSubtotal = useMemo(() => {
        let sum = 0;
        orderItems.forEach(item => {
            if (item.isPaid) return;

            let selectedQty = 0;
            if (expandedItems.has(item.id)) {
                // Count selected units
                for (let i = 0; i < item.quantity; i++) {
                    const unitKey = `${item.id}-${i}`;
                    if (selectedUnits.has(unitKey) && !paidUnits.has(unitKey)) {
                        selectedQty++;
                    }
                }
            } else {
                // If item is selected as whole
                const paidQty = item.paidQuantity || 0;
                const unpaidQty = item.quantity - paidQty;
                if (selectedItems.has(item.id)) {
                    selectedQty = unpaidQty;
                }
            }

            if (selectedQty > 0) {
                sum += item.price * selectedQty;
            }
        });
        return sum;
    }, [selectedItems, selectedUnits, expandedItems, orderItems, paidUnits]);

    const selectedServiceFee = selectedSubtotal * serviceFeeRate;
    const selectedTotal = selectedSubtotal + selectedServiceFee;

    const remainingTotal = splitAmount ? splitAmount : (hasSelection ? selectedTotal : unpaidTotal);
    const change = Math.max(0, amountPaid - remainingTotal);

    const paymentMethods = [
        { id: "credit", label: "Crédito", icon: <CardIcon size={32} weight="Bold" /> },
        { id: "debit", label: "Débito", icon: <CardIcon size={32} /> },
        { id: "cash", label: "Dinheiro", icon: <Wallet size={32} weight="Bold" /> },
        { id: "pix", label: "Pix", icon: <WalletMoney size={32} weight="Bold" /> },
    ];

    const handleSplit = (amount: number, type: "people" | "items", selectedItemIds?: string[]) => {
        setSplitAmount(amount);
        if (type === "items" && selectedItemIds) {
            setSelectedItems(new Set(selectedItemIds));
        }
        toast.info(`Valor ajustado para divisão por ${type}`);
    };

    const handleToggleItem = (itemId: string) => {
        const item = orderItems.find(i => i.id === itemId);
        if (!item || item.isPaid) return;

        // If expanded, toggle expand instead
        if (expandedItems.has(itemId)) {
            handleToggleExpand(itemId);
            return;
        }

        const newSelected = new Set(selectedItems);
        if (newSelected.has(itemId)) {
            newSelected.delete(itemId);
        } else {
            newSelected.add(itemId);
        }
        setSelectedItems(newSelected);
        setSplitAmount(null);
    };

    const handleSelectAll = () => {
        // Check if all items/units are selected
        let allSelected = true;
        unpaidItems.forEach(item => {
            const selectedQty = getSelectedQuantity(item);
            const unpaidQty = getUnpaidQuantity(item);
            if (selectedQty !== unpaidQty) {
                allSelected = false;
            }
        });

        if (allSelected) {
            // Deselect all
            setSelectedItems(new Set());
            setSelectedUnits(new Set());
        } else {
            // Select all unpaid items/units
            const newSelectedItems = new Set<string>();
            const newSelectedUnits = new Set<string>();

            unpaidItems.forEach(item => {
                if (expandedItems.has(item.id)) {
                    // Select all unpaid units
                    for (let i = 0; i < item.quantity; i++) {
                        const unitKey = `${item.id}-${i}`;
                        if (!paidUnits.has(unitKey)) {
                            newSelectedUnits.add(unitKey);
                        }
                    }
                } else {
                    // Select whole item
                    newSelectedItems.add(item.id);
                }
            });

            setSelectedItems(newSelectedItems);
            setSelectedUnits(newSelectedUnits);
        }
        setSplitAmount(null);
    };

    const handleKeypadPress = (key: string) => {
        // Limite máximo: R$ 999.999,99 (8 dígitos + 2 decimais = 10 dígitos no total)
        const MAX_DIGITS = 10;
        const newValueString = amountPaidString + key;

        // Verificar se não excede o limite de dígitos
        if (newValueString.length > MAX_DIGITS) {
            toast.warning("Valor máximo permitido: R$ 999.999,99");
            return;
        }

        const numericValue = parseInt(newValueString) / 100;
        setAmountPaidString(newValueString);
        setAmountPaid(numericValue);
    };

    const handleKeypadClear = () => {
        setAmountPaidString("");
        setAmountPaid(0);
    };

    const handleKeypadBackspace = () => {
        const newValueString = amountPaidString.slice(0, -1);
        const numericValue = newValueString ? parseInt(newValueString) / 100 : 0;
        setAmountPaidString(newValueString);
        setAmountPaid(numericValue);
    };

    // Handle keyboard input for numeric keypad
    const handleKeypadPressCallback = useCallback((key: string) => {
        const MAX_DIGITS = 10;
        const newValueString = amountPaidString + key;

        if (newValueString.length > MAX_DIGITS) {
            toast.warning("Valor máximo permitido: R$ 999.999,99");
            return;
        }

        const numericValue = parseInt(newValueString) / 100;
        setAmountPaidString(newValueString);
        setAmountPaid(numericValue);
    }, [amountPaidString]);

    const handleKeypadBackspaceCallback = useCallback(() => {
        const newValueString = amountPaidString.slice(0, -1);
        const numericValue = newValueString ? parseInt(newValueString) / 100 : 0;
        setAmountPaidString(newValueString);
        setAmountPaid(numericValue);
    }, [amountPaidString]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Only handle keyboard input when payment is cash
            if (selectedPayment !== "cash") return;

            // Don't handle if user is typing in an input field
            const target = event.target as HTMLElement;
            if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
                return;
            }

            // Handle number keys (0-9)
            if (event.key >= "0" && event.key <= "9") {
                event.preventDefault();
                handleKeypadPressCallback(event.key);
            }
            // Handle double zero (00) - Shift+0
            else if (event.key === "0" && event.shiftKey) {
                event.preventDefault();
                handleKeypadPressCallback("00");
            }
            // Handle backspace
            else if (event.key === "Backspace" || event.key === "Delete") {
                event.preventDefault();
                handleKeypadBackspaceCallback();
            }
            // Handle Escape to clear
            else if (event.key === "Escape") {
                event.preventDefault();
                handleKeypadClear();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [selectedPayment, handleKeypadPressCallback, handleKeypadBackspaceCallback]);

    const handleFinish = async () => {
        if (selectedPayment === "cash" && amountPaid < remainingTotal) {
            toast.error("Valor recebido é menor que o total!");
            return;
        }

        const newPaidUnits = new Set(paidUnits);
        const updatedItems = orderItems.map(item => {
            if (item.isPaid) return item;

            let paidQty = item.paidQuantity || 0;

            if (expandedItems.has(item.id)) {
                // Handle unit-based payment
                for (let i = 0; i < item.quantity; i++) {
                    const unitKey = `${item.id}-${i}`;
                    if (selectedUnits.has(unitKey) && !paidUnits.has(unitKey)) {
                        newPaidUnits.add(unitKey);
                        paidQty++;
                    }
                }
            } else if (selectedItems.has(item.id)) {
                // Handle whole item payment
                const unpaidQty = getUnpaidQuantity(item);
                for (let i = 0; i < unpaidQty; i++) {
                    const unitKey = `${item.id}-${paidQty + i}`;
                    newPaidUnits.add(unitKey);
                }
                paidQty = item.quantity;
            } else if (selectedItems.size === 0 && selectedUnits.size === 0) {
                // Pay all unpaid if nothing selected
                const unpaidQty = getUnpaidQuantity(item);
                for (let i = 0; i < unpaidQty; i++) {
                    const unitKey = `${item.id}-${paidQty + i}`;
                    newPaidUnits.add(unitKey);
                }
                paidQty = item.quantity;
            }

            return {
                ...item,
                paidQuantity: paidQty,
                isPaid: paidQty === item.quantity
            };
        });

        setOrderItems(updatedItems);
        setPaidUnits(newPaidUnits);

        // Clear selection after payment
        setSelectedItems(new Set());
        setSelectedUnits(new Set());
        setSplitAmount(null);
        setAmountPaid(0);
        setAmountPaidString("");

        // Count paid items/units
        const allItemsPaid = updatedItems.every(item => item.isPaid);

        if (allItemsPaid) {
            // Update order status to COMPLETED
            try {
                // Ensure we await this before navigating
                await api.patch(`/orders/${orderId}`, { status: "COMPLETED" });
                toast.success("Todos os itens foram pagos com sucesso!");

                setTimeout(() => {
                    navigate(`/${tenantId}/orders`, {
                        state: {
                            paymentSuccess: true,
                            orderId: orderId
                        }
                    });
                }, 1500);
            } catch (error) {
                console.error("Erro ao atualizar status do pedido:", error);
                toast.error("Erro ao finalizar o pedido. O pagamento foi registrado localmente.");
                // Still navigate? Maybe best to stay and let user retry? 
                // For now, let's keep the user here so they can see the error, but the local state is "paid".
                // Actually, if local state is paid, user might be stuck. 
                // Let's retry navigation after a delay or just warn.
                // Given the requirement, simple error toast is good.
                setTimeout(() => {
                    navigate(`/${tenantId}/orders`, {
                        state: {
                            paymentSuccess: true,
                            orderId: orderId
                        }
                    });
                }, 2000);
            }
        } else {
            const paidUnitsCount = Array.from(newPaidUnits).length - paidUnits.size;
            toast.success(`${paidUnitsCount} ${paidUnitsCount === 1 ? 'unidade foi paga' : 'unidades foram pagas'} com sucesso!`);
        }
    };

    return (
        <div className="flex h-full bg-default-50 dark:bg-default-100">
            {/* Left Column - Order Summary */}
            <div className="flex flex-col w-1/3 bg-background">
                <div className="p-6 flex items-center gap-4">
                    <Button isIconOnly variant="light" onPress={() => navigate(-1)}>
                        <ArrowLeft size={24} />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold">{order?.table ? `Mesa ${order.table}` : "Pedido"}</h1>
                        <p className="text-default-500 text-sm">{order?.customer || "Cliente"}</p>
                    </div>
                    <div className="ml-auto bg-primary/10 px-3 py-1 rounded-full text-primary text-xs font-bold">
                        #{orderId?.slice(-5)}
                    </div>
                </div>

                <Divider />

                <div className="flex px-6 py-3">
                    {unpaidItems.length > 0 && (
                        <div className="flex flex-1 items-center justify-between">
                            <span className="text-sm font-medium text-default-600">
                                Selecionar itens para pagar:
                            </span>
                            <Button
                                size="sm"
                                variant="flat"
                                onPress={handleSelectAll}
                                className="text-xs"
                            >
                                {(() => {
                                    let allSelected = true;
                                    unpaidItems.forEach(item => {
                                        const selectedQty = getSelectedQuantity(item);
                                        const unpaidQty = getUnpaidQuantity(item);
                                        if (selectedQty !== unpaidQty) {
                                            allSelected = false;
                                        }
                                    });
                                    return allSelected ? "Desmarcar Todos" : "Selecionar Todos";
                                })()}
                            </Button>
                        </div>
                    )}
                </div>

                <Divider />

                <ScrollArea className="flex flex-col flex-grow h-0 overflow-y-0">
                    <div className="flex flex-col gap-3 px-6 py-4">
                        {orderItems.map((item) => {
                            const isPaid = item.isPaid || false;
                            const isExpanded = expandedItems.has(item.id.toString());
                            const canExpand = item.quantity > 1 && !isPaid;
                            const selectedQty = getSelectedQuantity(item);
                            const isPartiallyPaid = (item.paidQuantity || 0) > 0 && !isPaid;
                            const isItemSelected = !isExpanded && selectedItems.has(item.id) && !isPaid;
                            const itemTotal = item.price * item.quantity;

                            return (
                                <div key={item.id} className="flex flex-col gap-2">
                                    {/* Main Item Card */}
                                    <Card
                                        className={`
                                            transition-all duration-200
                                            ${isPaid
                                                ? "opacity-60 bg-default-100 dark:bg-default-50"
                                                : isItemSelected || (isExpanded && selectedQty > 0)
                                                    ? "bg-primary/10 border border-primary"
                                                    : "hover:bg-default-50 dark:hover:bg-default-100 border border-default-200"
                                            }
                                        `}
                                    >
                                        <CardBody className="p-4">
                                            <div className="flex items-center gap-4">
                                                {/* Checkbox/Status */}
                                                <div className="flex-shrink-0">
                                                    {isPaid ? (
                                                        <div className="w-6 h-6 flex items-center justify-center rounded-full bg-success/20">
                                                            <CheckCircle size={20} className="text-success" weight="Bold" />
                                                        </div>
                                                    ) : (
                                                        <Checkbox
                                                            isSelected={isItemSelected}
                                                            onValueChange={() => handleToggleItem(item.id)}
                                                            size="md"
                                                            color="primary"
                                                        />
                                                    )}
                                                </div>

                                                {/* Quantity Badge */}
                                                <div className="flex items-center justify-center w-10 h-10 bg-primary/20 text-primary rounded-lg text-sm font-bold flex-shrink-0">
                                                    {item.quantity}x
                                                </div>

                                                {/* Item Info */}
                                                <div className="flex flex-col flex-1 min-w-0 gap-1">
                                                    <span className={`font-semibold text-base ${isPaid ? "line-through text-default-400" : "text-default-900"}`}>
                                                        {item.name}
                                                    </span>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        {isPaid && (
                                                            <span className="text-xs text-success font-semibold bg-success/10 px-2 py-0.5 rounded-full">
                                                                ✓ Pago
                                                            </span>
                                                        )}
                                                        {isPartiallyPaid && (
                                                            <span className="text-xs text-warning font-semibold bg-warning/10 px-2 py-0.5 rounded-full">
                                                                {item.paidQuantity}/{item.quantity} pago{item.paidQuantity! > 1 ? 's' : ''}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Price */}
                                                <div className="flex flex-col items-end flex-shrink-0">
                                                    <span className={`font-bold text-lg ${isPaid ? "line-through text-default-400" : "text-primary"}`}>
                                                        R$ {itemTotal.toFixed(2).replace(".", ",")}
                                                    </span>
                                                    {!isPaid && (
                                                        <span className="text-xs text-default-500">
                                                            R$ {item.price.toFixed(2).replace(".", ",")} un.
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Expand Button */}
                                                {canExpand ? (
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        variant="light"
                                                        onPress={() => handleToggleExpand(item.id)}
                                                        className="flex-shrink-0"
                                                    >
                                                        {isExpanded ? (
                                                            <RoundAltArrowDown size={18} className="text-primary" />
                                                        ) : (
                                                            <RoundAltArrowUp size={18} className="text-default-500" />
                                                        )}
                                                    </Button>
                                                ) : (
                                                    <Button isIconOnly size="sm" variant="light" disabled className="flex-shrink-0 text-default-100">
                                                        <MinusCircle size={18} weight="Outline" />
                                                    </Button>
                                                )}
                                            </div>
                                        </CardBody>
                                    </Card>

                                    {/* Expanded Units */}
                                    {isExpanded && canExpand && (
                                        <div className="ml-4 flex flex-col gap-2 border-l-2 border-primary/30 pl-4">
                                            {Array.from({ length: item.quantity }, (_, index) => {
                                                const unitKey = `${item.id}-${index}`;
                                                const unitIsPaid = paidUnits.has(unitKey);
                                                const unitIsSelected = selectedUnits.has(unitKey);

                                                return (
                                                    <Card
                                                        key={unitKey}
                                                        className={`
                                                            transition-all duration-200
                                                            ${unitIsPaid
                                                                ? "opacity-60 bg-default-100 dark:bg-default-50"
                                                                : unitIsSelected
                                                                    ? "bg-primary/10 border border-primary"
                                                                    : "hover:bg-default-50 dark:hover:bg-default-100 border border-default-200"
                                                            }
                                                        `}
                                                        isPressable={!unitIsPaid}
                                                        onPress={() => !unitIsPaid && handleToggleUnit(item.id, index)}
                                                    >
                                                        <CardBody className="p-3">
                                                            <div className="flex gap-3 items-center">
                                                                <div className="flex-shrink-0">
                                                                    {!unitIsPaid ? (
                                                                        <Checkbox
                                                                            isSelected={unitIsSelected}
                                                                            onValueChange={() => handleToggleUnit(item.id, index)}
                                                                            size="md"
                                                                            color="primary"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                        />
                                                                    ) : (
                                                                        <div className="w-5 h-5 flex items-center justify-center rounded-full bg-success/20">
                                                                            <CheckCircle size={16} className="text-success" weight="Bold" />
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="flex flex-col flex-1 min-w-0">
                                                                    <span className={`text-sm font-medium ${unitIsPaid ? "line-through text-default-400" : "text-default-900"}`}>
                                                                        {item.name} #{index + 1}
                                                                    </span>
                                                                    {unitIsPaid && (
                                                                        <span className="text-xs text-success font-semibold bg-success/10 px-2 py-0.5 rounded-full w-fit mt-1">
                                                                            ✓ Pago
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                <span className={`text-base font-bold flex-shrink-0 ${unitIsPaid ? "line-through text-default-400" : "text-primary"}`}>
                                                                    R$ {item.price.toFixed(2).replace(".", ",")}
                                                                </span>
                                                            </div>
                                                        </CardBody>
                                                    </Card>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>

                {/* <Divider />

                <div className="p-6 bg-default-50 dark:bg-default-100">
                    <div className="flex flex-col gap-2 mb-4">
                        <div className="flex justify-between text-default-500 text-sm">
                            <span>Subtotal {hasSelection ? "(Selecionado)" : unpaidItems.length < orderItems.length ? "(Não Pago)" : ""}</span>
                            <span>R$ {(hasSelection ? selectedSubtotal : unpaidSubtotal).toFixed(2).replace(".", ",")}</span>
                        </div>
                        <div className="flex justify-between text-default-500 text-sm">
                            <span>Taxa de Serviço (10%)</span>
                            <span>R$ {(hasSelection ? selectedServiceFee : unpaidServiceFee).toFixed(2).replace(".", ",")}</span>
                        </div>
                    </div>
                    {orderItems.some(item => item.isPaid) && (
                        <div className="flex flex-col gap-2 mb-4 pt-4">
                            <div className="flex justify-between text-default-400 text-xs">
                                <span>Total Original</span>
                                <span>R$ {order?.subtotal?.toFixed(2).replace(".", ",")}</span>
                            </div>

                        </div>
                    )}
                    <div className="flex justify-between items-center pt-4">
                        <span className="text-lg font-bold">
                            {hasSelection ? "Total Selecionado" : "Total a Pagar"}
                        </span>
                        <span className="text-2xl font-bold text-primary">
                            R$ {remainingTotal.toFixed(2).replace(".", ",")}
                        </span>
                    </div>
                </div> */}
            </div>

            <Divider orientation="vertical" />

            {/* Right Column - Checkout Actions */}
            <div className="flex flex-col flex-1 overflow-auto">
                <div className="w-full flex flex-col h-full">

                    {/* Header Actions */}
                    <div className="flex px-8 py-4 justify-end gap-3 ">
                        <Button variant="flat" startContent={<Printer size={20} />}>
                            Imprimir Parcial
                        </Button>
                        <Button
                            variant="flat"
                            color="secondary"
                            startContent={<BillList size={20} />}
                            onPress={onOpenSplit}
                        >
                            Dividir Conta
                        </Button>
                    </div>

                    <Divider />

                    {isLoading ? (
                        <div className="flex flex-1 items-center justify-center">
                            <Spinner size="lg" label="Carregando pedido..." />
                        </div>
                    ) : (

                        <div className="flex flex-col flex-1 gap-8 px-8 py-4">
                            {/* Total to Pay Display */}
                            <Card className="bg-primary text-primary-foreground min-h-24">
                                <CardBody className="flex flex-row justify-between">
                                    <div className="flex flex-col gap-2">
                                        <span className="text-primary-foreground/80 text-lg">Valor a Pagar</span>
                                        {splitAmount && (
                                            <span className="text-xs bg-white/20 w-fit px-2 py-0.5 rounded">Parcial / Dividido</span>
                                        )}
                                        {hasSelection && (() => {
                                            let totalSelected = 0;
                                            orderItems.forEach(item => {
                                                if (!item.isPaid) {
                                                    totalSelected += getSelectedQuantity(item);
                                                }
                                            });
                                            return totalSelected > 0 ? (
                                                <span className="text-xs bg-white/20 w-fit px-2 py-0.5 rounded">
                                                    {totalSelected} {totalSelected === 1 ? 'unidade selecionada' : 'unidades selecionadas'}
                                                </span>
                                            ) : null;
                                        })()}
                                    </div>
                                    <div className="text-5xl font-bold">
                                        R$ {remainingTotal.toFixed(2).replace(".", ",")}
                                    </div>
                                </CardBody>
                            </Card>

                            <div className="flex flex-1 flex-col gap-4">
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <Wallet size={20} className="text-default-500" />
                                    Método de Pagamento
                                </h2>
                                <div className="flex flex-1 flex-row gap-4">
                                    <div className="flex flex-col gap-8 flex-1 min-h-0">
                                        {/* Payment Methods */}
                                        <div className="flex flex-col gap-4 flex-1 min-w-0">
                                            <div className="grid grid-cols-1 h-full gap-4">
                                                {paymentMethods.map((method) => (
                                                    <Button
                                                        key={method.id}
                                                        onPress={() => setSelectedPayment(method.id)}
                                                        className={`
                                            flex flex-col items-center justify-center gap-3 p-6 rounded-xl border transition-all h-full
                                            ${selectedPayment === method.id
                                                                ? "border-primary bg-primary/5 dark:bg-primary/10 text-primary"
                                                                : "border-transparent bg-white dark:bg-default-50 hover:bg-default-100 dark:hover:bg-default-200 text-default-600 dark:text-default-400 border border-default-200"}
                                        `}
                                                    >
                                                        {method.icon}
                                                        <span className="font-semibold">{method.label}</span>
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Cash Handling & Keypad - Always present but only visible for cash */}
                                    <div className="flex flex-col gap-4 flex-1 min-w-[400px]">
                                        <Card className="flex-1 border border-default-200 shadow-none p-6">
                                            <CardBody className="flex flex-col items-center gap-6 p-0">
                                                {selectedPayment === "cash" ? (
                                                    <>
                                                        <div className="flex flex-col w-full gap-4">
                                                            <Input
                                                                label="Valor Recebido"
                                                                placeholder="0,00"
                                                                size="lg"
                                                                startContent={<span className="text-default-400 font-bold">R$</span>}
                                                                value={amountPaid.toFixed(2).replace(".", ",")}
                                                                isReadOnly
                                                                classNames={{
                                                                    input: "text-right text-2xl font-bold",
                                                                }}
                                                            />
                                                            <div className="flex justify-between items-center bg-white dark:bg-default-50 p-4 rounded-xl border border-default-200 dark:border-default-100 border-transparent">
                                                                <span className="text-default-500 dark:text-default-400 font-medium">Troco</span>
                                                                <span className={`text-2xl font-bold ${change > 0 ? "text-success dark:text-success-400" : "text-default-300 dark:text-default-500"}`}>
                                                                    R$ {change.toFixed(2).replace(".", ",")}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <Keypad
                                                            onPress={handleKeypadPress}
                                                            onClear={handleKeypadClear}
                                                            onBackspace={handleKeypadBackspace}
                                                        />
                                                    </>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                                        <Wallet size={48} className="text-default-300 mb-4" />
                                                        <p className="text-default-400 text-sm">
                                                            Selecione "Dinheiro" para acessar o teclado numérico
                                                        </p>
                                                    </div>
                                                )}
                                            </CardBody>
                                        </Card>
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}
                    <Divider />
                    {/* Finalize Button */}
                    <div className="py-4 px-8">
                        <Button
                            size="lg"
                            color="success"
                            className="w-full text-white font-bold text-lg h-14"
                            startContent={<CheckCircle size={24} weight="Bold" />}
                            onPress={handleFinish}
                            isDisabled={
                                isLoading ||
                                (selectedPayment === "cash" && amountPaid < remainingTotal) ||
                                (!hasSelection && unpaidItems.length === 0)
                            }
                        >
                            {isLoading ? "Carregando..." : hasSelection ? (() => {
                                let totalSelected = 0;
                                orderItems.forEach(item => {
                                    if (!item.isPaid) {
                                        totalSelected += getSelectedQuantity(item);
                                    }
                                });
                                return `Pagar ${totalSelected} ${totalSelected === 1 ? 'Unidade Selecionada' : 'Unidades Selecionadas'}`;
                            })()
                                : unpaidItems.length > 0
                                    ? "Pagar Todos os Itens Restantes"
                                    : "Todos os Itens Já Foram Pagos"
                            }
                        </Button>
                    </div>

                </div>
            </div>

            <SplitBillModal
                isOpen={isSplitOpen}
                onClose={onCloseSplit}
                total={unpaidTotal}
                items={unpaidItems}
                onSplit={handleSplit}
            />
        </div>
    );
}
