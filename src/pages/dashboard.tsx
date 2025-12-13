import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import { Box, DollarMinimalistic, Shop, UsersGroupRounded } from "@solar-icons/react";

export function DashboardPage() {
    return (
        <div className="flex flex-col flex-1 h-full overflow-y-auto">
            <div className="p-6">
                <h1 className="text-3xl font-bold">Painel</h1>
                <p className="text-sm text-default-500 mt-1">
                    Visão geral do seu negócio
                </p>
            </div>

            <Divider />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
                <Card>
                    <CardHeader className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Box size={24} weight="Outline" className="text-primary" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-default-500">Pedidos Hoje</span>
                            <span className="text-2xl font-bold">24</span>
                        </div>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-success/10">
                            <DollarMinimalistic size={24} weight="Outline" className="text-success" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-default-500">Receita Hoje</span>
                            <span className="text-2xl font-bold">R$ 1.245,00</span>
                        </div>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-warning/10">
                            <UsersGroupRounded size={24} weight="Outline" className="text-warning" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-default-500">Clientes Ativos</span>
                            <span className="text-2xl font-bold">156</span>
                        </div>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-danger/10">
                            <Shop size={24} weight="Outline" className="text-danger" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-default-500">Restaurantes</span>
                            <span className="text-2xl font-bold">12</span>
                        </div>
                    </CardHeader>
                </Card>
            </div>

            <Divider />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-6">
                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-semibold">Pedidos Recentes</h2>
                    </CardHeader>
                    <CardBody>
                        <p className="text-sm text-default-400">Nenhum pedido recente</p>
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-semibold">Estatísticas</h2>
                    </CardHeader>
                    <CardBody>
                        <p className="text-sm text-default-400">Gráficos e estatísticas serão exibidos aqui</p>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
