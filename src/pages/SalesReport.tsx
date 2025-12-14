import { Button, Card, CardHeader, Checkbox, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Select, SelectItem } from "@heroui/react";
import { Download, GraphUp } from "@solar-icons/react";
import { useMemo, useState } from "react";
import { AreaChartGradient, type AreaChartGradientPropItem } from "../components/charts/AreaChartGradient";
import { BarChartStatCard } from "../components/charts/BarChartStatCard";

type PaymentMethod = "pix" | "cash" | "debit" | "credit";

interface SaleData {
    weekday: string;
    Vendas: number;
    Receita: number;
    Ticket: number;
    paymentMethod: "pix" | "cash" | "debit" | "credit";
}

const allSalesData: SaleData[] = [
    { weekday: "Mon", Vendas: 45, Receita: 3200, Ticket: 71.11, paymentMethod: "pix" },
    { weekday: "Mon", Vendas: 20, Receita: 1500, Ticket: 75.00, paymentMethod: "cash" },
    { weekday: "Mon", Vendas: 15, Receita: 1100, Ticket: 73.33, paymentMethod: "debit" },
    { weekday: "Mon", Vendas: 10, Receita: 800, Ticket: 80.00, paymentMethod: "credit" },
    { weekday: "Tue", Vendas: 52, Receita: 3800, Ticket: 73.08, paymentMethod: "pix" },
    { weekday: "Tue", Vendas: 25, Receita: 1900, Ticket: 76.00, paymentMethod: "cash" },
    { weekday: "Tue", Vendas: 18, Receita: 1350, Ticket: 75.00, paymentMethod: "debit" },
    { weekday: "Tue", Vendas: 12, Receita: 950, Ticket: 79.17, paymentMethod: "credit" },
    { weekday: "Wed", Vendas: 48, Receita: 3500, Ticket: 72.92, paymentMethod: "pix" },
    { weekday: "Wed", Vendas: 22, Receita: 1650, Ticket: 75.00, paymentMethod: "cash" },
    { weekday: "Wed", Vendas: 16, Receita: 1200, Ticket: 75.00, paymentMethod: "debit" },
    { weekday: "Wed", Vendas: 11, Receita: 850, Ticket: 77.27, paymentMethod: "credit" },
    { weekday: "Thu", Vendas: 61, Receita: 4200, Ticket: 68.85, paymentMethod: "pix" },
    { weekday: "Thu", Vendas: 28, Receita: 2100, Ticket: 75.00, paymentMethod: "cash" },
    { weekday: "Thu", Vendas: 20, Receita: 1500, Ticket: 75.00, paymentMethod: "debit" },
    { weekday: "Thu", Vendas: 13, Receita: 1000, Ticket: 76.92, paymentMethod: "credit" },
    { weekday: "Fri", Vendas: 55, Receita: 3900, Ticket: 70.91, paymentMethod: "pix" },
    { weekday: "Fri", Vendas: 26, Receita: 1950, Ticket: 75.00, paymentMethod: "cash" },
    { weekday: "Fri", Vendas: 19, Receita: 1425, Ticket: 75.00, paymentMethod: "debit" },
    { weekday: "Fri", Vendas: 12, Receita: 950, Ticket: 79.17, paymentMethod: "credit" },
    { weekday: "Sat", Vendas: 78, Receita: 5500, Ticket: 70.51, paymentMethod: "pix" },
    { weekday: "Sat", Vendas: 35, Receita: 2625, Ticket: 75.00, paymentMethod: "cash" },
    { weekday: "Sat", Vendas: 25, Receita: 1875, Ticket: 75.00, paymentMethod: "debit" },
    { weekday: "Sat", Vendas: 18, Receita: 1400, Ticket: 77.78, paymentMethod: "credit" },
    { weekday: "Sun", Vendas: 65, Receita: 4800, Ticket: 73.85, paymentMethod: "pix" },
    { weekday: "Sun", Vendas: 30, Receita: 2250, Ticket: 75.00, paymentMethod: "cash" },
    { weekday: "Sun", Vendas: 22, Receita: 1650, Ticket: 75.00, paymentMethod: "debit" },
    { weekday: "Sun", Vendas: 15, Receita: 1150, Ticket: 76.67, paymentMethod: "credit" },
];

export function SalesReportPage() {
    const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<Set<PaymentMethod>>(
        new Set(["pix", "cash", "debit", "credit"])
    );

    const handleSelectAll = () => {
        setSelectedPaymentMethods(new Set(["pix", "cash", "debit", "credit"]));
    };

    const handleDeselectAll = () => {
        setSelectedPaymentMethods(new Set());
    };

    const filteredData = useMemo(() => {
        if (selectedPaymentMethods.size === 0) {
            return [];
        }
        return allSalesData.filter(sale => selectedPaymentMethods.has(sale.paymentMethod));
    }, [selectedPaymentMethods]);

    const aggregatedData = useMemo(() => {
        const grouped: { [key: string]: { Vendas: number; Receita: number; count: number } } = {};

        filteredData.forEach(sale => {
            if (!grouped[sale.weekday]) {
                grouped[sale.weekday] = { Vendas: 0, Receita: 0, count: 0 };
            }
            grouped[sale.weekday].Vendas += sale.Vendas;
            grouped[sale.weekday].Receita += sale.Receita;
            grouped[sale.weekday].count += 1;
        });

        return Object.keys(grouped).map(weekday => ({
            weekday,
            Vendas: grouped[weekday].Vendas,
            Receita: grouped[weekday].Receita,
            Ticket: grouped[weekday].Receita / grouped[weekday].Vendas || 0,
        }));
    }, [filteredData]);

    const salesChartData = useMemo(() => {
        return aggregatedData.map(item => ({ weekday: item.weekday, Vendas: item.Vendas }));
    }, [aggregatedData]);

    const revenueChartData = useMemo(() => {
        return aggregatedData.map(item => ({ weekday: item.weekday, Receita: item.Receita }));
    }, [aggregatedData]);

    const averageTicketChartData = useMemo(() => {
        return aggregatedData.map(item => ({ weekday: item.weekday, Ticket: item.Ticket }));
    }, [aggregatedData]);

    const totalSales = useMemo(() => {
        return aggregatedData.reduce((sum, item) => sum + item.Vendas, 0);
    }, [aggregatedData]);

    const totalRevenue = useMemo(() => {
        return aggregatedData.reduce((sum, item) => sum + item.Receita, 0);
    }, [aggregatedData]);

    const averageTicket = useMemo(() => {
        return totalSales > 0 ? totalRevenue / totalSales : 0;
    }, [totalSales, totalRevenue]);

    const maxRevenue = useMemo(() => {
        return Math.max(...aggregatedData.map(item => item.Receita), 0);
    }, [aggregatedData]);

    const mainChartData: AreaChartGradientPropItem[] = useMemo(() => {
        const monthlyData = [
            { month: "Jan", value: totalRevenue * 0.7 },
            { month: "Fev", value: totalRevenue * 0.75 },
            { month: "Mar", value: totalRevenue * 0.72 },
            { month: "Abr", value: totalRevenue * 0.85 },
            { month: "Mai", value: totalRevenue * 0.80 },
            { month: "Jun", value: totalRevenue },
        ];

        return [
            {
                key: "total-sales",
                title: "Vendas Totais",
                value: totalSales,
                suffix: "",
                type: "number",
                change: "+12.5%",
                changeType: "positive",
                chartData: monthlyData.map(m => ({ month: m.month, value: m.value / averageTicket })),
            },
            {
                key: "total-revenue",
                title: "Receita Total",
                value: totalRevenue,
                suffix: "",
                type: "currency",
                change: "+15.2%",
                changeType: "positive",
                chartData: monthlyData,
            },
            {
                key: "average-ticket",
                title: "Ticket Médio",
                value: averageTicket,
                suffix: "",
                type: "currency",
                change: "+2.3%",
                changeType: "positive",
                chartData: monthlyData.map(m => ({ month: m.month, value: averageTicket })),
            },
        ];
    }, [totalSales, totalRevenue, averageTicket]);

    const formatCurrency = (value: number) => {
        return `R$ ${value.toFixed(2).replace(".", ",")}`;
    };

    return (
        <div className="flex flex-col flex-1 h-full overflow-hidden">
            <div className="flex items-center justify-between p-6">
                <div>
                    <h1 className="text-3xl font-bold">Relatório de Vendas</h1>
                    <p className="text-sm text-default-500 mt-1">
                        Análise detalhada das vendas e receitas
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Select
                        defaultSelectedKeys={["last-30-days"]}
                        className="min-w-[180px]"
                        size="md"
                    >
                        <SelectItem key="last-7-days">Últimos 7 dias</SelectItem>
                        <SelectItem key="last-30-days">Últimos 30 dias</SelectItem>
                        <SelectItem key="last-3-months">Últimos 3 meses</SelectItem>
                        <SelectItem key="last-6-months">Últimos 6 meses</SelectItem>
                        <SelectItem key="this-year">Este ano</SelectItem>
                    </Select>
                    <Dropdown>
                        <DropdownTrigger>
                            <Button
                                variant="bordered"
                                className="min-w-[220px] justify-between"
                                size="md"
                            >
                                <span className="text-sm">
                                    {selectedPaymentMethods.size === 0
                                        ? "Nenhum selecionado"
                                        : selectedPaymentMethods.size === 4
                                            ? "Todos os métodos"
                                            : `${selectedPaymentMethods.size} método${selectedPaymentMethods.size > 1 ? "s" : ""} selecionado${selectedPaymentMethods.size > 1 ? "s" : ""}`
                                    }
                                </span>
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                            aria-label="Métodos de pagamento"
                            closeOnSelect={false}
                            classNames={{
                                base: "min-w-[220px]",
                            }}
                        >
                            <DropdownItem
                                key="pix"
                                textValue="PIX"
                                onPress={() => {
                                    const newSelected = new Set(selectedPaymentMethods);
                                    if (newSelected.has("pix")) {
                                        newSelected.delete("pix");
                                    } else {
                                        newSelected.add("pix");
                                    }
                                    setSelectedPaymentMethods(newSelected);
                                }}
                            >
                                <div className="flex items-center gap-2 w-full">
                                    <Checkbox
                                        isSelected={selectedPaymentMethods.has("pix")}
                                        onValueChange={() => {
                                            const newSelected = new Set(selectedPaymentMethods);
                                            if (newSelected.has("pix")) {
                                                newSelected.delete("pix");
                                            } else {
                                                newSelected.add("pix");
                                            }
                                            setSelectedPaymentMethods(newSelected);
                                        }}
                                        classNames={{ label: "hidden" }}
                                    />
                                    <span>PIX</span>
                                </div>
                            </DropdownItem>
                            <DropdownItem
                                key="cash"
                                textValue="Dinheiro"
                                onPress={() => {
                                    const newSelected = new Set(selectedPaymentMethods);
                                    if (newSelected.has("cash")) {
                                        newSelected.delete("cash");
                                    } else {
                                        newSelected.add("cash");
                                    }
                                    setSelectedPaymentMethods(newSelected);
                                }}
                            >
                                <div className="flex items-center gap-2 w-full">
                                    <Checkbox
                                        isSelected={selectedPaymentMethods.has("cash")}
                                        onValueChange={() => {
                                            const newSelected = new Set(selectedPaymentMethods);
                                            if (newSelected.has("cash")) {
                                                newSelected.delete("cash");
                                            } else {
                                                newSelected.add("cash");
                                            }
                                            setSelectedPaymentMethods(newSelected);
                                        }}
                                        classNames={{ label: "hidden" }}
                                    />
                                    <span>Dinheiro</span>
                                </div>
                            </DropdownItem>
                            <DropdownItem
                                key="debit"
                                textValue="Cartão Débito"
                                onPress={() => {
                                    const newSelected = new Set(selectedPaymentMethods);
                                    if (newSelected.has("debit")) {
                                        newSelected.delete("debit");
                                    } else {
                                        newSelected.add("debit");
                                    }
                                    setSelectedPaymentMethods(newSelected);
                                }}
                            >
                                <div className="flex items-center gap-2 w-full">
                                    <Checkbox
                                        isSelected={selectedPaymentMethods.has("debit")}
                                        onValueChange={() => {
                                            const newSelected = new Set(selectedPaymentMethods);
                                            if (newSelected.has("debit")) {
                                                newSelected.delete("debit");
                                            } else {
                                                newSelected.add("debit");
                                            }
                                            setSelectedPaymentMethods(newSelected);
                                        }}
                                        classNames={{ label: "hidden" }}
                                    />
                                    <span>Cartão Débito</span>
                                </div>
                            </DropdownItem>
                            <DropdownItem
                                key="credit"
                                textValue="Cartão Crédito"
                                onPress={() => {
                                    const newSelected = new Set(selectedPaymentMethods);
                                    if (newSelected.has("credit")) {
                                        newSelected.delete("credit");
                                    } else {
                                        newSelected.add("credit");
                                    }
                                    setSelectedPaymentMethods(newSelected);
                                }}
                            >
                                <div className="flex items-center gap-2 w-full">
                                    <Checkbox
                                        isSelected={selectedPaymentMethods.has("credit")}
                                        onValueChange={() => {
                                            const newSelected = new Set(selectedPaymentMethods);
                                            if (newSelected.has("credit")) {
                                                newSelected.delete("credit");
                                            } else {
                                                newSelected.add("credit");
                                            }
                                            setSelectedPaymentMethods(newSelected);
                                        }}
                                        classNames={{ label: "hidden" }}
                                    />
                                    <span>Cartão Crédito</span>
                                </div>
                            </DropdownItem>

                            <DropdownItem
                                key="select-all"
                                textValue="Selecionar Todos"
                                onPress={handleSelectAll}
                                className="text-primary"
                            >
                                Selecionar Todos
                            </DropdownItem>
                            <DropdownItem
                                key="deselect-all"
                                textValue="Limpar Seleção"
                                onPress={handleDeselectAll}
                                className="text-danger"
                            >
                                Limpar Seleção
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                    <Button
                        color="primary"
                        startContent={<Download size={20} weight="Outline" />}
                    >
                        Exportar
                    </Button>
                </div>
            </div>


            <div className="flex-1 overflow-y-auto p-6">
                <div className="flex flex-col gap-6">
                    {/* Gráfico Principal */}
                    <AreaChartGradient title="Visão Geral de Vendas" data={mainChartData} />

                    {/* Cards de Estatísticas */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <BarChartStatCard
                            title="Vendas por Dia"
                            value={totalSales.toString()}
                            unit="vendas"
                            color="primary"
                            categories={["Vendas"]}
                            chartData={salesChartData}
                        />
                        <BarChartStatCard
                            title="Receita por Dia"
                            value={formatCurrency(totalRevenue)}
                            unit=""
                            color="success"
                            categories={["Receita"]}
                            chartData={revenueChartData}
                        />
                        <BarChartStatCard
                            title="Ticket Médio"
                            value={formatCurrency(averageTicket)}
                            unit=""
                            color="warning"
                            categories={["Ticket"]}
                            chartData={averageTicketChartData}
                        />
                    </div>

                    {/* Resumo de Estatísticas */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <GraphUp size={24} weight="Outline" className="text-primary" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm text-default-500">Total de Vendas</span>
                                    <span className="text-2xl font-bold">{totalSales}</span>
                                </div>
                            </CardHeader>
                        </Card>

                        <Card>
                            <CardHeader className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-success/10">
                                    <GraphUp size={24} weight="Outline" className="text-success" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm text-default-500">Receita Total</span>
                                    <span className="text-2xl font-bold">{formatCurrency(totalRevenue)}</span>
                                </div>
                            </CardHeader>
                        </Card>

                        <Card>
                            <CardHeader className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-warning/10">
                                    <GraphUp size={24} weight="Outline" className="text-warning" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm text-default-500">Ticket Médio</span>
                                    <span className="text-2xl font-bold">{formatCurrency(averageTicket)}</span>
                                </div>
                            </CardHeader>
                        </Card>

                        <Card>
                            <CardHeader className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-danger/10">
                                    <GraphUp size={24} weight="Outline" className="text-danger" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm text-default-500">Maior Venda</span>
                                    <span className="text-2xl font-bold">{formatCurrency(maxRevenue)}</span>
                                </div>
                            </CardHeader>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
