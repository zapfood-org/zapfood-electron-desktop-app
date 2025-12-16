
import { Button, Card, CardBody, Chip, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Radio, RadioGroup, useDisclosure } from "@heroui/react";
import { ArrowLeft, Card as CardIcon, CheckCircle, Download, Wallet, WalletMoney } from "@solar-icons/react";
import moment from "moment";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import type { Invoice } from "./Invoices";

// Mock data - em produção viria da API
const mockInvoices: Invoice[] = [
    {
        id: 1,
        number: "INV-2024-001",
        planName: "Starter",
        planId: "starter",
        amount: 99.00,
        issueDate: "2024-01-15",
        dueDate: "2024-02-15",
        paymentDate: "2024-02-10",
        status: "paid",
        paymentMethod: "pix",
        period: "Janeiro 2024",
    },
    {
        id: 2,
        number: "INV-2024-002",
        planName: "Starter",
        planId: "starter",
        amount: 99.00,
        issueDate: "2024-02-15",
        dueDate: "2024-03-15",
        status: "pending",
        period: "Fevereiro 2024",
    },
    {
        id: 3,
        number: "INV-2024-003",
        planName: "Premium",
        planId: "premium",
        amount: 299.00,
        issueDate: "2023-12-15",
        dueDate: "2024-01-15",
        status: "overdue",
        period: "Dezembro 2023",
    },
];

export function InvoiceDetailsPage() {
    const { tenantId, invoiceId } = useParams<{ tenantId: string; invoiceId: string }>();
    const navigate = useNavigate();
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [paymentMethod, setPaymentMethod] = useState<string>("pix");
    const [isProcessing, setIsProcessing] = useState(false);

    // Buscar fatura - em produção viria da API
    const invoice = mockInvoices.find((inv) => inv.id === Number(invoiceId));

    if (!invoice) {
        return (
            <div className="flex flex-col flex-1 h-full overflow-hidden">
                <div className="flex items-center justify-between p-6">
                    <div>
                        <h1 className="text-3xl font-bold">Fatura não encontrada</h1>
                        <p className="text-sm text-default-500 mt-1">
                            A fatura solicitada não existe
                        </p>
                    </div>
                </div>
                <Divider />
                <div className="flex-1 flex items-center justify-center">
                    <Button
                        color="primary"
                        startContent={<ArrowLeft size={20} weight="Outline" />}
                        onPress={() => navigate(`/${tenantId}/invoices`)}
                    >
                        Voltar para Faturas
                    </Button>
                </div>
            </div>
        );
    }

    const formatCurrency = (value: number) => {
        return `R$ ${value.toFixed(2).replace(".", ",")}`;
    };

    const formatDate = (date: string) => {
        return moment(date).format("DD/MM/YYYY");
    };

    const getStatusColor = (status: Invoice["status"]) => {
        switch (status) {
            case "paid":
                return "success";
            case "pending":
                return "warning";
            case "overdue":
                return "danger";
            case "cancelled":
                return "default";
            default:
                return "default";
        }
    };

    const getStatusLabel = (status: Invoice["status"]) => {
        switch (status) {
            case "paid":
                return "Pago";
            case "pending":
                return "Pendente";
            case "overdue":
                return "Vencido";
            case "cancelled":
                return "Cancelado";
            default:
                return "Desconhecido";
        }
    };

    const getPaymentMethodLabel = (method?: Invoice["paymentMethod"]) => {
        if (!method) return "-";
        switch (method) {
            case "pix":
                return "PIX";
            case "credit":
                return "Cartão Crédito";
            case "debit":
                return "Cartão Débito";
            default:
                return "-";
        }
    };

    const handlePay = async () => {
        setIsProcessing(true);
        
        // Simular processamento de pagamento
        setTimeout(() => {
            setIsProcessing(false);
            onOpenChange();
            toast.success("Pagamento processado com sucesso!");
            navigate(`/${tenantId}/invoices`);
        }, 2000);
    };

    const handleDownload = () => {
        toast.success(`Download da fatura ${invoice.number} iniciado`);
    };

    const isPaid = invoice.status === "paid";
    const canPay = invoice.status === "pending" || invoice.status === "overdue";

    const getPaymentIcon = () => {
        switch (paymentMethod) {
            case "pix":
                return <WalletMoney size={20} weight="Outline" />;
            case "credit":
                return <CardIcon size={20} weight="Outline" />;
            case "debit":
                return <Wallet size={20} weight="Outline" />;
            default:
                return <WalletMoney size={20} weight="Outline" />;
        }
    };

    const paymentIcon = useMemo(() => getPaymentIcon(), [paymentMethod]);

    return (
        <div className="flex flex-col flex-1 h-full overflow-hidden">
            <div className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                    <Button
                        isIconOnly
                        variant="light"
                        onPress={() => navigate(`/${tenantId}/invoices`)}
                        aria-label="Voltar"
                    >
                        <ArrowLeft size={24} weight="Outline" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Detalhes da Fatura</h1>
                        <p className="text-sm text-default-500 mt-1">
                            Fatura {invoice.number}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="bordered"
                        startContent={<Download size={20} weight="Outline" />}
                        onPress={handleDownload}
                    >
                        Baixar PDF
                    </Button>
                    {canPay && (
                        <Button
                            color="primary"
                            startContent={<WalletMoney size={20} weight="Outline" />}
                            onPress={onOpen}
                        >
                            Pagar Fatura
                        </Button>
                    )}
                </div>
            </div>

            <Divider />

            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto">
                    {/* Informações da Fatura */}
                    <Card>
                        <CardBody className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">{invoice.number}</h2>
                                    <p className="text-sm text-default-500">
                                        Fatura do plano {invoice.planName} - {invoice.period}
                                    </p>
                                </div>
                                <Chip
                                    size="lg"
                                    color={getStatusColor(invoice.status)}
                                    variant="flat"
                                    className="font-semibold"
                                >
                                    {getStatusLabel(invoice.status)}
                                </Chip>
                            </div>

                            <Divider className="my-6" />

                            {/* Detalhes */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <p className="text-sm text-default-500 mb-1">Plano</p>
                                    <p className="text-lg font-semibold">{invoice.planName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-default-500 mb-1">Período</p>
                                    <p className="text-lg font-semibold">{invoice.period}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-default-500 mb-1">Data de Emissão</p>
                                    <p className="text-lg font-semibold">{formatDate(invoice.issueDate)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-default-500 mb-1">Data de Vencimento</p>
                                    <p className="text-lg font-semibold">{formatDate(invoice.dueDate)}</p>
                                </div>
                                {invoice.paymentDate && (
                                    <div>
                                        <p className="text-sm text-default-500 mb-1">Data de Pagamento</p>
                                        <p className="text-lg font-semibold">{formatDate(invoice.paymentDate)}</p>
                                    </div>
                                )}
                                {invoice.paymentMethod && (
                                    <div>
                                        <p className="text-sm text-default-500 mb-1">Método de Pagamento</p>
                                        <p className="text-lg font-semibold">{getPaymentMethodLabel(invoice.paymentMethod)}</p>
                                    </div>
                                )}
                            </div>

                            <Divider className="my-6" />

                            {/* Valor */}
                            <div className="flex items-center justify-between">
                                <p className="text-xl font-semibold">Total</p>
                                <p className="text-3xl font-bold text-primary">{formatCurrency(invoice.amount)}</p>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Informações de Pagamento (se pendente ou vencida) */}
                    {canPay && (
                        <Card className="mt-6">
                            <CardBody className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <WalletMoney size={24} weight="Outline" className="text-primary" />
                                    <h3 className="text-xl font-bold">Informações para Pagamento</h3>
                                </div>
                                <p className="text-sm text-default-500 mb-4">
                                    Esta fatura está {invoice.status === "overdue" ? "vencida" : "pendente"}. 
                                    Clique no botão "Pagar Fatura" acima para processar o pagamento.
                                </p>
                                {invoice.status === "overdue" && (
                                    <Chip color="danger" variant="flat" className="mt-2">
                                        Atenção: Esta fatura está vencida desde {formatDate(invoice.dueDate)}
                                    </Chip>
                                )}
                            </CardBody>
                        </Card>
                    )}

                    {/* Recibo (se pago) */}
                    {isPaid && (
                        <Card className="mt-6">
                            <CardBody className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <CheckCircle size={24} weight="Outline" className="text-success" />
                                    <h3 className="text-xl font-bold">Pagamento Confirmado</h3>
                                </div>
                                <p className="text-sm text-default-500">
                                    Esta fatura foi paga em {formatDate(invoice.paymentDate!)} através de {getPaymentMethodLabel(invoice.paymentMethod)}.
                                </p>
                            </CardBody>
                        </Card>
                    )}
                </div>
            </div>

            {/* Modal de Pagamento */}
            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                backdrop="blur"
                size="2xl"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <h2 className="text-2xl font-bold">Pagar Fatura</h2>
                                <p className="text-sm text-default-500 font-normal">
                                    {invoice.number} - {formatCurrency(invoice.amount)}
                                </p>
                            </ModalHeader>
                            <ModalBody>
                                <div className="flex flex-col gap-6">
                                    <div>
                                        <p className="text-sm font-semibold mb-3">Selecione o método de pagamento</p>
                                        <RadioGroup
                                            value={paymentMethod}
                                            onValueChange={setPaymentMethod}
                                        >
                                            <Radio value="pix">PIX</Radio>
                                            <Radio value="credit">Cartão de Crédito</Radio>
                                            <Radio value="debit">Cartão de Débito</Radio>
                                        </RadioGroup>
                                    </div>

                                    {paymentMethod === "credit" && (
                                        <div className="flex flex-col gap-4">
                                            <Input
                                                label="Número do Cartão"
                                                placeholder="0000 0000 0000 0000"
                                                maxLength={19}
                                            />
                                            <div className="grid grid-cols-2 gap-4">
                                                <Input
                                                    label="Validade"
                                                    placeholder="MM/AA"
                                                    maxLength={5}
                                                />
                                                <Input
                                                    label="CVV"
                                                    placeholder="000"
                                                    maxLength={3}
                                                    type="password"
                                                />
                                            </div>
                                            <Input
                                                label="Nome no Cartão"
                                                placeholder="NOME COMPLETO"
                                            />
                                        </div>
                                    )}

                                    {paymentMethod === "debit" && (
                                        <div className="flex flex-col gap-4">
                                            <Input
                                                label="Número do Cartão"
                                                placeholder="0000 0000 0000 0000"
                                                maxLength={19}
                                            />
                                            <Input
                                                label="Senha"
                                                placeholder="Digite sua senha"
                                                type="password"
                                            />
                                        </div>
                                    )}

                                    {paymentMethod === "pix" && (
                                        <div className="p-4 bg-default-100 dark:bg-default-50 rounded-lg border border-default-200">
                                            <p className="text-sm font-semibold mb-2 text-default-700 dark:text-default-300">Pagamento via PIX</p>
                                            <p className="text-sm text-default-600 dark:text-default-400">
                                                Após confirmar, você será redirecionado para gerar o QR Code ou copiar o código PIX.
                                            </p>
                                        </div>
                                    )}

                                    <Divider />

                                    <div className="flex items-center justify-between p-4 bg-default-100 dark:bg-default-50 rounded-lg">
                                        <span className="text-lg font-semibold">Total a pagar:</span>
                                        <span className="text-2xl font-bold text-primary">{formatCurrency(invoice.amount)}</span>
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose} isDisabled={isProcessing}>
                                    Cancelar
                                </Button>
                                <Button
                                    color="primary"
                                    onPress={handlePay}
                                    isLoading={isProcessing}
                                    startContent={!isProcessing && paymentIcon}
                                >
                                    {isProcessing ? "Processando..." : "Confirmar Pagamento"}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}