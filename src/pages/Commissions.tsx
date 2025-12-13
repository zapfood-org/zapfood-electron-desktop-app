
import { Avatar, Card, CardBody, CardHeader, Chip, Divider } from "@heroui/react";
import { WalletMoney } from "@solar-icons/react";

export function CommissionsPage() {
    return (
        <div className="flex flex-col flex-1 h-full overflow-hidden">
            <div className="p-6">
                <h1 className="text-3xl font-bold">Comissões</h1>
                <p className="text-sm text-default-500 mt-1">
                    Gerencie comissões de restaurantes e entregadores
                </p>
            </div>

            <Divider />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 overflow-y-auto">
                <Card>
                    <CardHeader className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <WalletMoney size={24} weight="Outline" className="text-primary" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-default-500">Total Pendente</span>
                            <span className="text-2xl font-bold">R$ 8.450,00</span>
                        </div>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-success/10">
                            <WalletMoney size={24} weight="Outline" className="text-success" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-default-500">Total Pago</span>
                            <span className="text-2xl font-bold">R$ 32.100,00</span>
                        </div>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-warning/10">
                            <WalletMoney size={24} weight="Outline" className="text-warning" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-default-500">Este Mês</span>
                            <span className="text-2xl font-bold">R$ 5.230,00</span>
                        </div>
                    </CardHeader>
                </Card>
            </div>

            <Divider />

            <div className="grid grid-cols-1 gap-4 p-6 overflow-y-auto">
                {[
                    { name: "Restaurante A", type: "restaurante", amount: 1250.00, status: "pendente" },
                    { name: "Entregador João", type: "entregador", amount: 450.00, status: "pago" },
                    { name: "Restaurante B", type: "restaurante", amount: 890.00, status: "pendente" },
                ].map((item, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                    <Avatar
                                        size="md"
                                        name={item.name}
                                        className="bg-primary text-primary-foreground"
                                    />
                                    <div className="flex flex-col">
                                        <h3 className="text-lg font-semibold">{item.name}</h3>
                                        <p className="text-sm text-default-500">{item.type}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className="text-lg font-bold">R$ {item.amount.toFixed(2)}</span>
                                    <Chip
                                        size="sm"
                                        color={item.status === "pago" ? "success" : "warning"}
                                        variant="flat"
                                    >
                                        {item.status}
                                    </Chip>
                                </div>
                            </div>
                        </CardHeader>
                        <CardBody>
                            <p className="text-sm text-default-400">Detalhes da comissão serão exibidos aqui</p>
                        </CardBody>
                    </Card>
                ))}
            </div>
        </div>
    );
}
