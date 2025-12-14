
import { Button, Card, CardBody, Checkbox, Divider, Input, useDisclosure } from "@heroui/react";
import { ArrowLeft, BillList, Card as CardIcon, CheckCircle, Printer, Wallet, WalletMoney } from "@solar-icons/react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Keypad } from "../components/checkout/Keypad";
import { SplitBillModal } from "../components/checkout/SplitBillModal";

interface OrderItem {
    id: number;
    name: string;
    quantity: number;
    price: number;
    isPaid?: boolean;
    paidQuantity?: number; // Quantidade já paga
}


// Mock data - in real app would fetch based on ID
const mockOrder = {
    id: 123,
    table: "05",
    customer: "João Silva",
    items: [
        { id: 1, name: "Hambúrguer Artesanal", quantity: 2, price: 32.90, isPaid: false },
        { id: 2, name: "Batata Frita Grande", quantity: 1, price: 24.90, isPaid: false },
        { id: 3, name: "Coca-Cola Zero", quantity: 2, price: 6.50, isPaid: false },
        { id: 4, name: "Milkshake Morango", quantity: 1, price: 18.90, isPaid: false },
    ],
    subtotal: 122.60,
    serviceFee: 12.26
};

export function CheckoutPage() {
    const navigate = useNavigate();
    const { orderId, tenantId } = useParams();
    const { isOpen: isSplitOpen, onOpen: onOpenSplit, onClose: onCloseSplit } = useDisclosure();

    const [orderItems, setOrderItems] = useState<OrderItem[]>(mockOrder.items);
    // Estado para itens expandidos (mostrando unidades individuais)
    const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
    // Estado para unidades individuais selecionadas: "itemId-unitIndex"
    const [selectedUnits, setSelectedUnits] = useState<Set<string>>(new Set());
    // Estado para unidades individuais pagas: "itemId-unitIndex"
    const [paidUnits, setPaidUnits] = useState<Set<string>>(new Set());
    // Initialize with all unpaid items selected by default
    const [selectedItems, setSelectedItems] = useState<Set<number>>(
        new Set(mockOrder.items.filter(item => !item.isPaid).map(item => item.id))
    );
    const [selectedPayment, setSelectedPayment] = useState<string>("cash");
    const [amountPaid, setAmountPaid] = useState<number>(0);
    const [amountPaidString, setAmountPaidString] = useState<string>("");
    const [splitAmount, setSplitAmount] = useState<number | null>(null);

    // Toggle expand/collapse item
    const handleToggleExpand = (itemId: number) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(itemId)) {
            newExpanded.delete(itemId);
        } else {
            newExpanded.add(itemId);
        }
        setExpandedItems(newExpanded);
    };

    // Toggle selection of individual unit
    const handleToggleUnit = (itemId: number, unitIndex: number) => {
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

    const serviceFeeRate = mockOrder.serviceFee / mockOrder.subtotal; // 10%
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

    const total = mockOrder.subtotal + mockOrder.serviceFee;
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
            const ids = selectedItemIds.map(id => parseInt(id));
            setSelectedItems(new Set(ids));
        }
        toast.info(`Valor ajustado para divisão por ${type}`);
    };

    const handleToggleItem = (itemId: number) => {
        const item = orderItems.find(i => i.id === itemId);
        if (!item || item.isPaid) return;

        // If expanded, don't toggle item selection, just expand/collapse
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
        setSplitAmount(null); // Reset split amount when manually selecting items
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
            const newSelectedItems = new Set<number>();
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

    const handleFinish = () => {
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
            toast.success("Todos os itens foram pagos com sucesso!");
            setTimeout(() => {
                navigate(`/${tenantId}/orders`, {
                    state: {
                        paymentSuccess: true,
                        orderId: orderId ? parseInt(orderId) : undefined
                    }
                });
            }, 1500);
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
                        <h1 className="text-xl font-bold">Mesa {mockOrder.table}</h1>
                        <p className="text-default-500 text-sm">{mockOrder.customer}</p>
                    </div>
                    <div className="ml-auto bg-primary/10 px-3 py-1 rounded-full text-primary text-xs font-bold">
                        #{orderId?.padStart(4, '0')}
                    </div>
                </div>
                <Divider />

                <div className="flex-1 overflow-auto p-6">
                    <div className="flex flex-col gap-4">
                        {unpaidItems.length > 0 && (
                            <div className="flex items-center justify-between mb-2">
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
                        {orderItems.map((item) => {
                            const isPaid = item.isPaid || false;
                            const isExpanded = expandedItems.has(item.id);
                            const canExpand = item.quantity > 1 && !isPaid;
                            const selectedQty = getSelectedQuantity(item);
                            const isPartiallyPaid = (item.paidQuantity || 0) > 0 && !isPaid;
                            
                            // For non-expanded items, check if whole item is selected
                            const isItemSelected = !isExpanded && selectedItems.has(item.id) && !isPaid;
                            const itemTotal = item.price * item.quantity;

                            return (
                                <div key={item.id} className="flex flex-col gap-1">
                                    {/* Main Item Row */}
                                    <div
                                        className={`
                                            flex justify-between items-start group p-3 rounded-lg transition-colors
                                            ${isPaid
                                                ? "bg-default-100 dark:bg-default-50 opacity-60"
                                                : isItemSelected || (isExpanded && selectedQty > 0)
                                                    ? "bg-primary/10 dark:bg-primary/20 border border-primary"
                                                    : "hover:bg-default-50 dark:hover:bg-default-100 cursor-pointer border border-transparent"
                                            }
                                        `}
                                        onClick={() => !isPaid && !canExpand && handleToggleItem(item.id)}
                                    >
                                        <div className="flex gap-3 flex-1">
                                            {!isPaid && !isExpanded && (
                                                <Checkbox
                                                    isSelected={isItemSelected}
                                                    onValueChange={() => handleToggleItem(item.id)}
                                                    classNames={{ label: "hidden" }}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            )}
                                            {isPaid && (
                                                <div className="w-5 flex items-center justify-center">
                                                    <CheckCircle size={18} className="text-success" />
                                                </div>
                                            )}
                                            {isExpanded && (
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    variant="light"
                                                    onPress={() => handleToggleExpand(item.id)}
                                                    className="min-w-5 h-5"
                                                >
                                                    <ChevronUp size={16} />
                                                </Button>
                                            )}
                                            {!isExpanded && canExpand && (
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    variant="light"
                                                    onPress={() => handleToggleExpand(item.id)}
                                                    className="min-w-5 h-5"
                                                >
                                                    <ChevronDown size={16} />
                                                </Button>
                                            )}
                                            <div className="flex items-center justify-center w-6 h-6 bg-default-100 dark:bg-default-200 rounded text-xs font-bold text-default-900 dark:text-default-50">
                                                {item.quantity}x
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`font-medium text-sm ${isPaid ? "line-through text-default-400" : ""}`}>
                                                    {item.name}
                                                </span>
                                                {isPaid && (
                                                    <span className="text-xs text-success font-medium mt-1">✓ Pago</span>
                                                )}
                                                {isPartiallyPaid && (
                                                    <span className="text-xs text-warning font-medium mt-1">
                                                        {item.paidQuantity}/{item.quantity} pago{item.paidQuantity! > 1 ? 's' : ''}
                                                    </span>
                                                )}
                                                {isExpanded && selectedQty > 0 && (
                                                    <span className="text-xs text-primary font-medium mt-1">
                                                        {selectedQty} selecionado{selectedQty > 1 ? 's' : ''}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <span className={`font-semibold text-sm ${isPaid ? "line-through text-default-400" : ""}`}>
                                            R$ {itemTotal.toFixed(2).replace(".", ",")}
                                        </span>
                                    </div>

                                    {/* Expanded Units */}
                                    {isExpanded && !isPaid && (
                                        <div className="ml-8 flex flex-col gap-1">
                                            {Array.from({ length: item.quantity }, (_, index) => {
                                                const unitKey = `${item.id}-${index}`;
                                                const unitIsPaid = paidUnits.has(unitKey);
                                                const unitIsSelected = selectedUnits.has(unitKey);
                                                
                                                return (
                                                    <div
                                                        key={unitKey}
                                                        className={`
                                                            flex justify-between items-center p-2 rounded-md transition-colors
                                                            ${unitIsPaid
                                                                ? "bg-default-100 dark:bg-default-50 opacity-60"
                                                                : unitIsSelected
                                                                    ? "bg-primary/10 dark:bg-primary/20 border border-primary"
                                                                    : "hover:bg-default-50 dark:hover:bg-default-100 cursor-pointer border border-transparent"
                                                            }
                                                        `}
                                                        onClick={() => !unitIsPaid && handleToggleUnit(item.id, index)}
                                                    >
                                                        <div className="flex gap-2 items-center flex-1">
                                                            {!unitIsPaid && (
                                                                <Checkbox
                                                                    isSelected={unitIsSelected}
                                                                    onValueChange={() => handleToggleUnit(item.id, index)}
                                                                    classNames={{ label: "hidden" }}
                                                                    size="sm"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                />
                                                            )}
                                                            {unitIsPaid && (
                                                                <CheckCircle size={16} className="text-success" />
                                                            )}
                                                            <span className={`text-sm ${unitIsPaid ? "line-through text-default-400" : ""}`}>
                                                                {item.name} #{index + 1}
                                                            </span>
                                                            {unitIsPaid && (
                                                                <span className="text-xs text-success font-medium">✓ Pago</span>
                                                            )}
                                                        </div>
                                                        <span className={`text-sm font-semibold ${unitIsPaid ? "line-through text-default-400" : ""}`}>
                                                            R$ {item.price.toFixed(2).replace(".", ",")}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <Divider />

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
                                <span>R$ {total.toFixed(2).replace(".", ",")}</span>
                            </div>
                            <div className="flex justify-between text-success text-sm font-medium">
                                <span>Já Pago</span>
                                <span>R$ {(total - unpaidTotal).toFixed(2).replace(".", ",")}</span>
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
                </div>
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

                        <div className="flex flex-row gap-8 flex-1 min-h-0">
                            {/* Payment Methods */}
                            <div className="flex flex-col gap-4 flex-1 min-w-0">
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <Wallet size={20} className="text-default-500" />
                                    Método de Pagamento
                                </h2>
                                <div className="grid grid-cols-2 gap-4">
                                    {paymentMethods.map((method) => (
                                        <button
                                            key={method.id}
                                            onClick={() => setSelectedPayment(method.id)}
                                            className={`
                                            flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 transition-all h-32
                                            ${selectedPayment === method.id
                                                    ? "border-primary bg-primary/5 dark:bg-primary/10 text-primary"
                                                    : "border-transparent bg-white dark:bg-default-50 hover:bg-default-100 dark:hover:bg-default-200 text-default-600 dark:text-default-400"}
                                        `}
                                        >
                                            {method.icon}
                                            <span className="font-semibold">{method.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Cash Handling & Keypad - Always present but only visible for cash */}
                            <div className="flex flex-col gap-4 flex-1 min-w-[400px]">
                                <Card className="flex-1 bg-default-50 dark:bg-default-100 border-none shadow-none">
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
                                                    <div className="flex justify-between items-center bg-white dark:bg-default-50 p-4 rounded-xl border border-default-200 dark:border-default-100">
                                                        <span className="text-default-500 dark:text-default-400 font-medium">Troco</span>
                                                        <span className={`text-2xl font-bold ${change > 0 ? "text-success dark:text-success-400" : "text-default-300 dark:text-default-500"}`}>
                                                            R$ {change.toFixed(2).replace(".", ",")}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-default-400 text-center">
                                                        Digite os números ou use o teclado abaixo. ESC para limpar, Backspace para apagar.
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
                                (selectedPayment === "cash" && amountPaid < remainingTotal) ||
                                (!hasSelection && unpaidItems.length === 0)
                            }
                        >
                            {hasSelection ? (() => {
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
