
import { Card, CardHeader, CardBody, Divider } from "@heroui/react";
import { DollarMinimalistic, WalletMoney } from "@solar-icons/react";

export function FinancialPage() {
    return (
        <div className="flex flex-col flex-1 h-full overflow-hidden">
            <div className="p-6">
                <h1 className="text-3xl font-bold">Financeiro</h1>
                <p className="text-sm text-default-500 mt-1">
                    Controle financeiro e transações
                </p>
            </div>

            <Divider />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6 overflow-y-auto">
                <Card>
                    <CardHeader className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-success/10">
                            <DollarMinimalistic size={24} weight="Outline" className="text-success" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-default-500">Receita Total</span>
                            <span className="text-2xl font-bold">R$ 45.230,00</span>
                        </div>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-danger/10">
                            <DollarMinimalistic size={24} weight="Outline" className="text-danger" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-default-500">Despesas</span>
                            <span className="text-2xl font-bold">R$ 12.450,00</span>
                        </div>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <DollarMinimalistic size={24} weight="Outline" className="text-primary" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-default-500">Lucro</span>
                            <span className="text-2xl font-bold">R$ 32.780,00</span>
                        </div>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-warning/10">
                            <WalletMoney size={24} weight="Outline" className="text-warning" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-default-500">Pendente</span>
                            <span className="text-2xl font-bold">R$ 3.200,00</span>
                        </div>
                    </CardHeader>
                </Card>
            </div>

            <Divider />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-semibold">Transações Recentes</h2>
                    </CardHeader>
                    <CardBody>
                        <p className="text-sm text-default-400">Nenhuma transação recente</p>
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-semibold">Gráfico de Receitas</h2>
                    </CardHeader>
                    <CardBody>
                        <p className="text-sm text-default-400">Gráfico será exibido aqui</p>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
