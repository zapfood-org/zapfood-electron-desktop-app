
import { Button, Card, CardBody, Input, useDisclosure } from "@heroui/react";
import { ArrowLeft, Card as CardIcon, Wallet, WalletMoney, Printer, BillList, CheckCircle } from "@solar-icons/react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { SplitBillModal } from "../components/checkout/SplitBillModal";

// Mock data - in real app would fetch based on ID
const mockOrder = {
    id: 123,
    table: "05",
    customer: "João Silva",
    items: [
        { id: 1, name: "Hambúrguer Artesanal", quantity: 2, price: 32.90, notes: "Sem cebola em um" },
        { id: 2, name: "Batata Frita Grande", quantity: 1, price: 24.90 },
        { id: 3, name: "Coca-Cola Zero", quantity: 2, price: 6.50 },
        { id: 4, name: "Milkshake Morango", quantity: 1, price: 18.90 },
    ],
    subtotal: 122.60,
    serviceFee: 12.26
};

export function CheckoutPage() {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const { isOpen: isSplitOpen, onOpen: onOpenSplit, onClose: onCloseSplit } = useDisclosure();

    const [selectedPayment, setSelectedPayment] = useState<string>("credit");
    // const [amountPaid, setAmountPaid] = useState<number>(0);
    const [splitAmount, setSplitAmount] = useState<number | null>(null);

    const total = mockOrder.subtotal + mockOrder.serviceFee;
    const remainingTotal = splitAmount ? splitAmount : total;

    const paymentMethods = [
        { id: "credit", label: "Crédito", icon: <CardIcon size={32} weight="Bold" /> },
        { id: "debit", label: "Débito", icon: <CardIcon size={32} /> },
        { id: "cash", label: "Dinheiro", icon: <Wallet size={32} weight="Bold" /> },
        { id: "pix", label: "Pix", icon: <WalletMoney size={32} weight="Bold" /> },
    ];

    const handleSplit = (amount: number, type: "people" | "items") => {
        setSplitAmount(amount);
        toast.info(`Valor ajustado para divisão por ${type}`);
    };

    const handleFinish = () => {
        toast.success("Pagamento realizado com sucesso!");
        navigate(`/${useParams().tenantId}/orders`);
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
                        {mockOrder.items.map((item) => (
                            <div key={item.id} className="flex justify-between items-start group">
                                <div className="flex gap-3">
                                    <div className="flex items-center justify-center w-6 h-6 bg-default-100 rounded text-xs font-bold">
                                        {item.quantity}x
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-sm">{item.name}</span>
                                        {item.notes && <span className="text-xs text-default-400">{item.notes}</span>}
                                    </div>
                                </div>
                                <span className="font-semibold text-sm">
                                    R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 border-t border-default-200 bg-default-50">
                    <div className="flex flex-col gap-2 mb-4">
                        <div className="flex justify-between text-default-500 text-sm">
                            <span>Subtotal</span>
                            <span>R$ {mockOrder.subtotal.toFixed(2).replace(".", ",")}</span>
                        </div>
                        <div className="flex justify-between text-default-500 text-sm">
                            <span>Taxa de Serviço (10%)</span>
                            <span>R$ {mockOrder.serviceFee.toFixed(2).replace(".", ",")}</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-default-200">
                        <span className="text-lg font-bold">Total</span>
                        <span className="text-2xl font-bold text-primary">
                            R$ {total.toFixed(2).replace(".", ",")}
                        </span>
                    </div>
                </div>
            </div>

            {/* Right Column - Checkout Actions */}
            <div className="flex flex-col flex-1 p-8 overflow-auto">
                <div className="max-w-3xl mx-auto w-full flex flex-col gap-8">

                    {/* Header Actions */}
                    <div className="flex justify-end gap-3">
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
                    <Card className="bg-primary text-primary-foreground">
                        <CardBody className="flex flex-row items-center justify-between p-8">
                            <div className="flex flex-col gap-1">
                                <span className="text-primary-foreground/80 text-lg">Valor a Pagar</span>
                                {splitAmount && (
                                    <span className="text-xs bg-white/20 w-fit px-2 py-0.5 rounded">Parcial / Dividido</span>
                                )}
                            </div>
                            <div className="text-5xl font-bold">
                                R$ {remainingTotal.toFixed(2).replace(".", ",")}
                            </div>
                        </CardBody>
                    </Card>

                    {/* Payment Methods */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Wallet size={20} className="text-default-500" />
                            Método de Pagamento
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {paymentMethods.map((method) => (
                                <button
                                    key={method.id}
                                    onClick={() => setSelectedPayment(method.id)}
                                    className={`
                                        flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 transition-all
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

                    {/* Cash Handling (if Cash selected) */}
                    {selectedPayment === "cash" && (
                        <Card className="animate-in fade-in slide-in-from-top-4">
                            <CardBody className="flex flex-row gap-6 items-end p-6">
                                <Input
                                    label="Valor Recebido"
                                    placeholder="0,00"
                                    size="lg"
                                    startContent={<span className="text-default-400 font-bold">R$</span>}
                                    type="number"
                                />
                                <div className="flex flex-col gap-1 min-w-[150px]">
                                    <span className="text-sm text-default-500">Troco</span>
                                    <span className="text-2xl font-bold text-success">R$ 0,00</span>
                                </div>
                            </CardBody>
                        </Card>
                    )}

                    <div className="flex-1" />

                    {/* Finalize Button */}
                    <Button
                        size="lg"
                        color="success"
                        className="w-full text-white font-bold text-lg h-14"
                        startContent={<CheckCircle size={24} weight="Bold" />}
                        onPress={handleFinish}
                    >
                        Finalizar Pagamento
                    </Button>

                </div>
            </div>

            <SplitBillModal
                isOpen={isSplitOpen}
                onClose={onCloseSplit}
                total={total}
                onSplit={handleSplit}
            />
        </div>
    );
}
