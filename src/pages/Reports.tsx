
import { Button, Card, CardBody, CardHeader, Divider } from "@heroui/react";
import { Delivery, DollarMinimalistic, Download, GraphUp, TagPrice, TeaCup, UsersGroupRounded } from "@solar-icons/react";

export function ReportsPage() {
    return (
        <div className="flex flex-col flex-1 h-full overflow-hidden">
            <div className="flex items-center justify-between p-6">
                <div>
                    <h1 className="text-3xl font-bold">Relatórios</h1>
                    <p className="text-sm text-default-500 mt-1">
                        Análises e relatórios do seu negócio
                    </p>
                </div>
                <Button color="primary" startContent={<Download size={20} weight="Outline" />}>
                    Exportar Relatório
                </Button>
            </div>

            <Divider />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 overflow-y-auto">
                {[
                    { title: "Relatório de Vendas", period: "Últimos 30 dias", icon: GraphUp },
                    { title: "Relatório de Clientes", period: "Últimos 7 dias", icon: UsersGroupRounded },
                    { title: "Relatório de Produtos", period: "Últimos 30 dias", icon: TeaCup },
                    { title: "Relatório Financeiro", period: "Este mês", icon: DollarMinimalistic },
                    { title: "Relatório de Entregas", period: "Últimos 7 dias", icon: Delivery },
                    { title: "Relatório de Promoções", period: "Últimos 30 dias", icon: TagPrice },
                ].map((report, index) => {
                    const IconComponent = report.icon;
                    return (
                        <Card key={index}>
                            <CardHeader>
                                <div className="flex items-center gap-3 w-full">
                                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <IconComponent size={24} weight="Outline" className="text-primary" />
                                    </div>
                                    <div className="flex flex-col flex-1">
                                        <h3 className="text-lg font-semibold">{report.title}</h3>
                                        <p className="text-sm text-default-500">{report.period}</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardBody>
                                <Button size="sm" variant="flat" className="w-full">
                                    Gerar Relatório
                                </Button>
                            </CardBody>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
