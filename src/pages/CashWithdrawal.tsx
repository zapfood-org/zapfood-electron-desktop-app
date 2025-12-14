import { Button, Card, CardBody, CardHeader, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, useDisclosure } from "@heroui/react";
import { AddCircle, WalletMoney } from "@solar-icons/react";
import moment from "moment";
import { useState } from "react";

interface CashWithdrawal {
    id: string;
    amount: number;
    reason: string;
    date: string;
    user: string;
}

const mockWithdrawals: CashWithdrawal[] = [
    {
        id: "1",
        amount: 150.00,
        reason: "Troco para o caixa",
        date: moment().subtract(2, "hours").toISOString(),
        user: "João Silva"
    },
    {
        id: "2",
        amount: 50.00,
        reason: "Compra de material",
        date: moment().subtract(5, "hours").toISOString(),
        user: "Maria Santos"
    },
    {
        id: "3",
        amount: 200.00,
        reason: "Pagamento de fornecedor",
        date: moment().subtract(1, "day").toISOString(),
        user: "Pedro Costa"
    },
];

export function CashWithdrawalPage() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [withdrawals, setWithdrawals] = useState<CashWithdrawal[]>(mockWithdrawals);
    const [amount, setAmount] = useState("");
    const [reason, setReason] = useState("");
    const [totalToday, setTotalToday] = useState(0);

    const handleCreateWithdrawal = () => {
        if (!amount || !reason || parseFloat(amount) <= 0) {
            return;
        }

        const newWithdrawal: CashWithdrawal = {
            id: Date.now().toString(),
            amount: parseFloat(amount),
            reason: reason,
            date: moment().toISOString(),
            user: "Usuário Atual"
        };

        setWithdrawals([newWithdrawal, ...withdrawals]);
        setTotalToday(totalToday + parseFloat(amount));
        setAmount("");
        setReason("");
        onClose();
    };

    const formatCurrency = (value: number) => {
        return `R$ ${value.toFixed(2).replace(".", ",")}`;
    };

    const formatDate = (date: string) => {
        return moment(date).format("DD/MM/YYYY HH:mm");
    };

    const todayTotal = withdrawals
        .filter(w => moment(w.date).isSame(moment(), "day"))
        .reduce((sum, w) => sum + w.amount, 0);

    return (
        <div className="flex flex-col flex-1 h-full overflow-hidden">
            <div className="flex items-center justify-between p-6">
                <div>
                    <h1 className="text-3xl font-bold">Sangria</h1>
                    <p className="text-sm text-default-500 mt-1">
                        Registro de sangrias do caixa
                    </p>
                </div>
                <Button 
                    color="primary" 
                    startContent={<AddCircle size={20} weight="Outline" />}
                    onPress={onOpen}
                >
                    Nova Sangria
                </Button>
            </div>

            <Divider />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
                <Card>
                    <CardHeader className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <WalletMoney size={24} weight="Outline" className="text-primary" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-default-500">Total Hoje</span>
                            <span className="text-2xl font-bold">{formatCurrency(todayTotal)}</span>
                        </div>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-warning/10">
                            <WalletMoney size={24} weight="Outline" className="text-warning" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-default-500">Total do Mês</span>
                            <span className="text-2xl font-bold">
                                {formatCurrency(
                                    withdrawals
                                        .filter(w => moment(w.date).isSame(moment(), "month"))
                                        .reduce((sum, w) => sum + w.amount, 0)
                                )}
                            </span>
                        </div>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-success/10">
                            <WalletMoney size={24} weight="Outline" className="text-success" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-default-500">Total de Registros</span>
                            <span className="text-2xl font-bold">{withdrawals.length}</span>
                        </div>
                    </CardHeader>
                </Card>
            </div>

            <Divider />

            <div className="flex-1 overflow-y-auto p-6">
                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-semibold">Histórico de Sangrias</h2>
                    </CardHeader>
                    <CardBody>
                        <Table aria-label="Tabela de sangrias">
                            <TableHeader>
                                <TableColumn>DATA/HORA</TableColumn>
                                <TableColumn>VALOR</TableColumn>
                                <TableColumn>MOTIVO</TableColumn>
                                <TableColumn>USUÁRIO</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {withdrawals.map((withdrawal) => (
                                    <TableRow key={withdrawal.id}>
                                        <TableCell>{formatDate(withdrawal.date)}</TableCell>
                                        <TableCell className="font-semibold">
                                            {formatCurrency(withdrawal.amount)}
                                        </TableCell>
                                        <TableCell>{withdrawal.reason}</TableCell>
                                        <TableCell>{withdrawal.user}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardBody>
                </Card>
            </div>

            <Modal isOpen={isOpen} onClose={onClose} size="lg">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <h2 className="text-2xl font-bold">Nova Sangria</h2>
                                <p className="text-sm text-default-500 font-normal">
                                    Registre uma nova sangria do caixa
                                </p>
                            </ModalHeader>
                            <ModalBody>
                                <div className="flex flex-col gap-4">
                                    <Input
                                        label="Valor"
                                        placeholder="0,00"
                                        type="number"
                                        value={amount}
                                        onValueChange={setAmount}
                                        startContent={
                                            <span className="text-default-500">R$</span>
                                        }
                                        description="Digite o valor da sangria"
                                        isRequired
                                    />
                                    <Input
                                        label="Motivo"
                                        placeholder="Ex: Troco para o caixa"
                                        value={reason}
                                        onValueChange={setReason}
                                        description="Descreva o motivo da sangria"
                                        isRequired
                                    />
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>
                                    Cancelar
                                </Button>
                                <Button 
                                    color="primary" 
                                    onPress={handleCreateWithdrawal}
                                    isDisabled={!amount || !reason || parseFloat(amount) <= 0}
                                >
                                    Registrar Sangria
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
