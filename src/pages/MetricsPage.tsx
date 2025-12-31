import { Divider } from "@heroui/react";
import { ScrollArea } from "../components/ui/scroll-area";

import { Card, CardBody, CardHeader } from "@heroui/react";
import { useEffect, useState } from "react";
import {
  AreaChartGradient,
  type AreaChartGradientPropItem,
} from "../components/charts/AreaChartGradient";
import { BarChartStatCard } from "../components/charts/BarChartStatCard";
import {
  RestaurantActivityChart,
  type RestaurantSchedule,
} from "../components/charts/RestaurantActivityChart";

export function MetricsPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const ordersChartData = [
    { weekday: "Mon", Orders: 20 },
    { weekday: "Tue", Orders: 35 },
    { weekday: "Wed", Orders: 28 },
    { weekday: "Thu", Orders: 45 },
    { weekday: "Fri", Orders: 32 },
    { weekday: "Sat", Orders: 55 },
    { weekday: "Sun", Orders: 40 },
  ];

  const revenueChartData = [
    { weekday: "Mon", Revenue: 1200 },
    { weekday: "Tue", Revenue: 1500 },
    { weekday: "Wed", Revenue: 1100 },
    { weekday: "Thu", Revenue: 1800 },
    { weekday: "Fri", Revenue: 1600 },
    { weekday: "Sat", Revenue: 2200 },
    { weekday: "Sun", Revenue: 1900 },
  ];

  const customersChartData = [
    { weekday: "Mon", Customers: 120 },
    { weekday: "Tue", Customers: 135 },
    { weekday: "Wed", Customers: 128 },
    { weekday: "Thu", Customers: 145 },
    { weekday: "Fri", Customers: 132 },
    { weekday: "Sat", Customers: 155 },
    { weekday: "Sun", Customers: 140 },
  ];

  const restaurantsChartData = [
    { weekday: "Mon", Restaurants: 10 },
    { weekday: "Tue", Restaurants: 11 },
    { weekday: "Wed", Restaurants: 12 },
    { weekday: "Thu", Restaurants: 12 },
    { weekday: "Fri", Restaurants: 12 },
    { weekday: "Sat", Restaurants: 12 },
    { weekday: "Sun", Restaurants: 12 },
  ];

  const mainChartData: AreaChartGradientPropItem[] = [
    {
      key: "total-sales",
      title: "Vendas Totais",
      suffix: "reais",
      value: 147000,
      type: "currency",
      change: "12.8%",
      changeType: "positive",
      chartData: [
        { month: "Jan", value: 98000 },
        { month: "Fev", value: 125000 },
        { month: "Mar", value: 89000 },
        { month: "Abr", value: 156000 },
        { month: "Mai", value: 112000 },
        { month: "Jun", value: 167000 },
        { month: "Jul", value: 138000 },
        { month: "Ago", value: 178000 },
        { month: "Set", value: 129000 },
        { month: "Out", value: 159000 },
        { month: "Nov", value: 147000 },
        { month: "Dez", value: 127000 },
      ],
    },
    {
      key: "total-orders",
      title: "Pedidos",
      suffix: "pedidos",
      value: 6230,
      type: "number",
      change: "-2.1%",
      changeType: "neutral",
      chartData: [
        { month: "Jan", value: 587 },
        { month: "Fev", value: 698 },
        { month: "Mar", value: 542 },
        { month: "Abr", value: 728 },
        { month: "Mai", value: 615 },
        { month: "Jun", value: 689 },
        { month: "Jul", value: 573 },
        { month: "Ago", value: 695 },
        { month: "Set", value: 589 },
        { month: "Out", value: 652 },
        { month: "Nov", value: 623 },
        { month: "Dez", value: 523 },
      ],
    },
    {
      key: "new-customers",
      title: "Novos Clientes",
      suffix: "clientes",
      value: 2312,
      type: "number",
      change: "5.7%",
      changeType: "positive",
      chartData: [
        { month: "Jan", value: 282 },
        { month: "Fev", value: 238 },
        { month: "Mar", value: 269 },
        { month: "Abr", value: 214 },
        { month: "Mai", value: 276 },
        { month: "Jun", value: 228 },
        { month: "Jul", value: 262 },
        { month: "Ago", value: 214 },
        { month: "Set", value: 247 },
        { month: "Out", value: 223 },
        { month: "Nov", value: 231 },
        { month: "Dez", value: 223 },
      ],
    },
    {
      key: "cancellations",
      title: "Cancelamentos",
      value: 2.4,
      suffix: "taxa",
      type: "percentage",
      change: "-0.5%",
      changeType: "positive", // Lower is better
      chartData: [
        { month: "Jan", value: 3.2 },
        { month: "Fev", value: 2.9 },
        { month: "Mar", value: 2.8 },
        { month: "Abr", value: 2.5 },
        { month: "Mai", value: 2.7 },
        { month: "Jun", value: 2.4 },
        { month: "Jul", value: 2.6 },
        { month: "Ago", value: 2.3 },
        { month: "Set", value: 2.2 },
        { month: "Out", value: 2.4 },
        { month: "Nov", value: 2.3 },
        { month: "Dez", value: 2.1 },
      ],
    },
  ];

  const restaurantSchedule: RestaurantSchedule[] = [
    {
      month: "Jan",
      openTime: "11:00",
      closeTime: "22:00",
      isOpen: true,
      hoursOpen: 11,
    },
    {
      month: "Feb",
      openTime: "11:00",
      closeTime: "22:00",
      isOpen: true,
      hoursOpen: 11,
    },
    {
      month: "Mar",
      openTime: "11:00",
      closeTime: "22:00",
      isOpen: true,
      hoursOpen: 11,
    },
    {
      month: "Apr",
      openTime: "11:00",
      closeTime: "23:00",
      isOpen: true,
      hoursOpen: 12,
    },
    {
      month: "May",
      openTime: "11:00",
      closeTime: "23:00",
      isOpen: true,
      hoursOpen: 12,
    },
    {
      month: "Jun",
      openTime: "11:00",
      closeTime: "23:00",
      isOpen: true,
      hoursOpen: 12,
    },
    {
      month: "Jul",
      openTime: "11:00",
      closeTime: "23:00",
      isOpen: true,
      hoursOpen: 12,
    },
    {
      month: "Aug",
      openTime: "11:00",
      closeTime: "23:00",
      isOpen: true,
      hoursOpen: 12,
    },
    {
      month: "Sep",
      openTime: "11:00",
      closeTime: "22:00",
      isOpen: true,
      hoursOpen: 11,
    },
    {
      month: "Oct",
      openTime: "11:00",
      closeTime: "22:00",
      isOpen: true,
      hoursOpen: 11,
    },
    {
      month: "Nov",
      openTime: "11:00",
      closeTime: "22:00",
      isOpen: true,
      hoursOpen: 11,
    },
    {
      month: "Dec",
      openTime: "12:00",
      closeTime: "21:00",
      isOpen: true,
      hoursOpen: 9,
    },
  ];

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="flex flex-col h-full w-full overflow-y-auto">
      <div className="flex-1 flex flex-col">
        <div className="flex flex-col flex-1 overflow-hidden">
          <ScrollArea className="flex flex-col flex-grow h-0 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
              <BarChartStatCard
                title="Pedidos (Semana)"
                value="255"
                unit="total"
                color="primary"
                categories={["Orders"]}
                chartData={ordersChartData}
              />
              <BarChartStatCard
                title="Receita (Semana)"
                value="R$ 11.3k"
                unit="total"
                color="success"
                categories={["Revenue"]}
                chartData={revenueChartData}
              />
              <BarChartStatCard
                title="Clientes Ativos"
                value="156"
                unit="ativos"
                color="warning"
                categories={["Customers"]}
                chartData={customersChartData}
              />
              <BarChartStatCard
                title="Restaurantes"
                value="12"
                unit="total"
                color="danger"
                categories={["Restaurants"]}
                chartData={restaurantsChartData}
              />
            </div>

            <div className="px-6 pb-6">
              <AreaChartGradient
                title="Análise de Desempenho"
                data={mainChartData}
              />
            </div>

            <Divider />

            <div className="px-6 pb-6">
              <RestaurantActivityChart
                title="Atividade do Restaurante"
                schedule={restaurantSchedule}
              />
            </div>

            <Divider />

            <div className="grid grid-cols-1 gap-4 p-6">
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Pedidos Recentes</h2>
                </CardHeader>
                <CardBody>
                  <p className="text-sm text-default-400">
                    Nenhum pedido recente
                  </p>
                </CardBody>
              </Card>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
