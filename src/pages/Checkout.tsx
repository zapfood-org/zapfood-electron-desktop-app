
import { Button, Card, CardBody, Checkbox, Input, useDisclosure } from "@heroui/react";
import { ArrowLeft, BillList, Card as CardIcon, CheckCircle, Printer, Wallet, WalletMoney } from "@solar-icons/react";
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
    // Initialize with all unpaid items selected by default
    const [selectedItems, setSelectedItems] = useState<Set<number>>(
        new Set(mockOrder.items.filter(item => !item.isPaid).map(item => item.id))
    );
    const [selectedPayment, setSelectedPayment] = useState<string>("cash");
    const [amountPaid, setAmountPaid] = useState<number>(0);
    const [amountPaidString, setAmountPaidString] = useState<string>("");
    const [splitAmount, setSplitAmount] = useState<number | null>(null);

    // Calculate totals based on unpaid items
    const unpaidItems = useMemo(() => orderItems.filter(item => !item.isPaid), [orderItems]);
    const unpaidSubtotal = useMemo(() => {
        return unpaidItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }, [unpaidItems]);

    const serviceFeeRate = mockOrder.serviceFee / mockOrder.subtotal; // 10%
    const unpaidServiceFee = unpaidSubtotal * serviceFeeRate;
    const unpaidTotal = unpaidSubtotal + unpaidServiceFee;

    // Calculate selected items totals
    const selectedSubtotal = useMemo(() => {
        let sum = 0;
        selectedItems.forEach(itemId => {
            const item = orderItems.find(i => i.id === itemId && !i.isPaid);
            if (item) {
                sum += item.price * item.quantity;
            }
        });
        return sum;
    }, [selectedItems, orderItems]);

    const selectedServiceFee = selectedSubtotal * serviceFeeRate;
    const selectedTotal = selectedSubtotal + selectedServiceFee;

    const total = mockOrder.subtotal + mockOrder.serviceFee;
    const remainingTotal = splitAmount ? splitAmount : (selectedItems.size > 0 ? selectedTotal : unpaidTotal);
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
        const unpaidIds = unpaidItems.map(item => item.id);
        if (selectedItems.size === unpaidIds.length && unpaidIds.every(id => selectedItems.has(id))) {
            // Deselect all
            setSelectedItems(new Set());
        } else {
            // Select all unpaid
            setSelectedItems(new Set(unpaidIds));
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

        // Mark selected items as paid (or all unpaid items if none selected)
        const itemsToMarkAsPaid = selectedItems.size > 0
            ? Array.from(selectedItems)
            : unpaidItems.map(item => item.id);

        setOrderItems(prev => prev.map(item =>
            itemsToMarkAsPaid.includes(item.id)
                ? { ...item, isPaid: true }
                : item
        ));

        // Clear selection after payment
        setSelectedItems(new Set());
        setSplitAmount(null);
        setAmountPaid(0);
        setAmountPaidString("");

        const itemsPaidCount = itemsToMarkAsPaid.length;
        const allItemsPaid = orderItems.every(item =>
            item.isPaid || itemsToMarkAsPaid.includes(item.id)
        );

        if (allItemsPaid) {
            toast.success("Todos os itens foram pagos com sucesso!");
            // Navigate back to orders page with success state
            setTimeout(() => {
                navigate(`/${tenantId}/orders`, {
                    state: {
                        paymentSuccess: true,
                        orderId: orderId ? parseInt(orderId) : undefined
                    }
                });
            }, 1500);
        } else {
            toast.success(`${itemsPaidCount} ${itemsPaidCount === 1 ? 'item foi pago' : 'itens foram pagos'} com sucesso!`);
        }
    };

    return (
        <div className="flex h-full bg-default-50">
            {/* Left Column - Order Summary */}
            <div className="flex flex-col w-1/3 border-r border-default-200 bg-background">
                <div className="p-6 border-b border-default-200 flex items-center gap-4">
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
                                    {selectedItems.size === unpaidItems.length && unpaidItems.every(item => selectedItems.has(item.id))
                                        ? "Desmarcar Todos"
                                        : "Selecionar Todos"}
                                </Button>
                            </div>
                        )}
                        {orderItems.map((item) => {
                            const isPaid = item.isPaid || false;
                            const isSelected = selectedItems.has(item.id) && !isPaid;
                            const itemTotal = item.price * item.quantity;

                            return (
                                <div
                                    key={item.id}
                                    className={`
                                        flex justify-between items-start group p-3 rounded-lg transition-colors
                                        ${isPaid
                                            ? "bg-default-100 opacity-60"
                                            : isSelected
                                                ? "bg-primary/10 border border-primary"
                                                : "hover:bg-default-50 cursor-pointer border border-transparent"
                                        }
                                    `}
                                    onClick={() => !isPaid && handleToggleItem(item.id)}
                                >
                                    <div className="flex gap-3 flex-1">
                                        {!isPaid && (
                                            <Checkbox
                                                isSelected={isSelected}
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
                                        <div className="flex items-center justify-center w-6 h-6 bg-default-100 rounded text-xs font-bold">
                                            {item.quantity}x
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`font-medium text-sm ${isPaid ? "line-through text-default-400" : ""}`}>
                                                {item.name}
                                            </span>
                                            {isPaid && (
                                                <span className="text-xs text-success font-medium mt-1">✓ Pago</span>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`font-semibold text-sm ${isPaid ? "line-through text-default-400" : ""}`}>
                                        R$ {itemTotal.toFixed(2).replace(".", ",")}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="p-6 border-t border-default-200 bg-default-50">
                    <div className="flex flex-col gap-2 mb-4">
                        <div className="flex justify-between text-default-500 text-sm">
                            <span>Subtotal {selectedItems.size > 0 ? "(Selecionado)" : unpaidItems.length < orderItems.length ? "(Não Pago)" : ""}</span>
                            <span>R$ {(selectedItems.size > 0 ? selectedSubtotal : unpaidSubtotal).toFixed(2).replace(".", ",")}</span>
                        </div>
                        <div className="flex justify-between text-default-500 text-sm">
                            <span>Taxa de Serviço (10%)</span>
                            <span>R$ {(selectedItems.size > 0 ? selectedServiceFee : unpaidServiceFee).toFixed(2).replace(".", ",")}</span>
                        </div>
                    </div>
                    {orderItems.some(item => item.isPaid) && (
                        <div className="flex flex-col gap-2 mb-4 pt-4 border-t border-default-200">
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
                    <div className="flex justify-between items-center pt-4 border-t border-default-200">
                        <span className="text-lg font-bold">
                            {selectedItems.size > 0 ? "Total Selecionado" : "Total a Pagar"}
                        </span>
                        <span className="text-2xl font-bold text-primary">
                            R$ {remainingTotal.toFixed(2).replace(".", ",")}
                        </span>
                    </div>
                </div>
            </div>

            {/* Right Column - Checkout Actions */}
            <div className="flex flex-col flex-1 p-8 overflow-auto">
                <div className="max-w-4xl mx-auto w-full flex flex-col gap-8 h-full">

                    {/* Header Actions */}
                    <div className="flex justify-end gap-3 flex-shrink-0">
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

                    {/* Total to Pay Display */}
                    <Card className="bg-primary text-primary-foreground flex-shrink-0">
                        <CardBody className="flex flex-row items-center justify-between p-8">
                            <div className="flex flex-col gap-2">
                                <span className="text-primary-foreground/80 text-lg">Valor a Pagar</span>
                                {splitAmount && (
                                    <span className="text-xs bg-white/20 w-fit px-2 py-0.5 rounded">Parcial / Dividido</span>
                                )}
                                {selectedItems.size > 0 && (
                                    <span className="text-xs bg-white/20 w-fit px-2 py-0.5 rounded">
                                        {selectedItems.size} {selectedItems.size === 1 ? 'item selecionado' : 'itens selecionados'}
                                    </span>
                                )}
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
                                                ? "border-primary bg-primary/5 text-primary"
                                                : "border-transparent bg-white hover:bg-default-100 text-default-600"}
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
                            <Card className="flex-1 bg-default-50 border-none shadow-none">
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
                                                <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-default-200">
                                                    <span className="text-default-500 font-medium">Troco</span>
                                                    <span className={`text-2xl font-bold ${change > 0 ? "text-success" : "text-default-300"}`}>
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

                    {/* Finalize Button */}
                    <div className="mt-auto pt-4 border-t border-default-200 flex-shrink-0">
                        <Button
                            size="lg"
                            color="success"
                            className="w-full text-white font-bold text-lg h-14"
                            startContent={<CheckCircle size={24} weight="Bold" />}
                            onPress={handleFinish}
                            isDisabled={
                                (selectedPayment === "cash" && amountPaid < remainingTotal) ||
                                (selectedItems.size === 0 && unpaidItems.length === 0)
                            }
                        >
                            {selectedItems.size > 0
                                ? `Pagar ${selectedItems.size} ${selectedItems.size === 1 ? 'Item Selecionado' : 'Itens Selecionados'}`
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
