"use client";

import { Card, cn } from "@heroui/react";
import React from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface RestaurantSchedule {
    month: string;
    openTime: string;
    closeTime: string;
    isOpen: boolean;
    hoursOpen: number;
}

export interface RestaurantActivityChartProps {
    title?: string;
    schedule: RestaurantSchedule[];
    className?: string;
}

const formatMonth = (month: string) => {
    const map: { [key: string]: string } = {
        Jan: "Jan",
        Feb: "Fev",
        Mar: "Mar",
        Apr: "Abr",
        May: "Mai",
        Jun: "Jun",
        Jul: "Jul",
        Aug: "Ago",
        Sep: "Set",
        Oct: "Out",
        Nov: "Nov",
        Dec: "Dez"
    };
    return map[month] ?? month;
};

const getBarColor = (isOpen: boolean, hours: number) => {
    if (!isOpen) return "hsl(var(--heroui-default-300))";
    if (hours >= 12) return "hsl(var(--heroui-success-500))";
    if (hours >= 8) return "hsl(var(--heroui-primary-500))";
    return "hsl(var(--heroui-warning-500))";
};

export const RestaurantActivityChart = React.forwardRef<HTMLDivElement, RestaurantActivityChartProps>(
    ({ title = "Horários de Funcionamento", schedule, className }, ref) => {
        const chartData = schedule.map((item) => ({
            month: item.month,
            Horas: item.isOpen ? item.hoursOpen : 0,
            openTime: item.openTime,
            closeTime: item.closeTime,
            isOpen: item.isOpen,
            hoursOpen: item.hoursOpen,
        }));

        const totalHours = schedule.reduce((sum, item) => sum + (item.isOpen ? item.hoursOpen : 0), 0);
        const averageHours = schedule.filter(item => item.isOpen).length > 0
            ? Math.round(totalHours / schedule.filter(item => item.isOpen).length)
            : 0;

        return (
            <Card
                ref={ref}
                className={cn("h-[300px] border border-transparent dark:border-default-100", className)}
            >
                <div className="flex flex-col gap-y-2 p-4">
                    <div className="flex items-center justify-between gap-x-2">
                        <dt>
                            <h3 className="text-small font-medium text-default-500">{title}</h3>
                        </dt>
                    </div>
                    <dd className="flex items-baseline gap-x-1">
                        <span className="text-3xl font-semibold text-default-900">{averageHours}h</span>
                        <span className="text-medium font-medium text-default-500">média/dia</span>
                    </dd>
                </div>

                <ResponsiveContainer
                    className="[&_.recharts-surface]:outline-none"
                    height="100%"
                    width="100%"
                >
                    <BarChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            top: 20,
                            right: 14,
                            left: -8,
                            bottom: 5,
                        }}
                    >
                        <XAxis
                            dataKey="month"
                            style={{ fontSize: "var(--heroui-font-size-tiny)" }}
                            tickLine={false}
                            tickFormatter={formatMonth}
                        />
                        <YAxis
                            axisLine={false}
                            style={{ fontSize: "var(--heroui-font-size-tiny)" }}
                            tickLine={false}
                        />
                        <Tooltip
                            content={({ label }) => {
                                const data = chartData.find(d => d.month === label);
                                return (
                                    <div className="flex h-auto min-w-[180px] items-center gap-x-2 rounded-medium bg-background p-3 text-tiny shadow-small border border-default-200">
                                        <div className="flex w-full flex-col gap-y-1">
                                            <span className="font-semibold text-foreground">{formatMonth(label as string)}</span>
                                            {data?.isOpen ? (
                                                <>
                                                    <div className="flex items-center gap-x-2 text-xs">
                                                        <span className="text-default-500">Abre:</span>
                                                        <span className="font-medium text-foreground">{data.openTime}</span>
                                                    </div>
                                                    <div className="flex items-center gap-x-2 text-xs">
                                                        <span className="text-default-500">Fecha:</span>
                                                        <span className="font-medium text-foreground">{data.closeTime}</span>
                                                    </div>
                                                    <div className="flex items-center gap-x-2 text-xs mt-1 pt-1 border-t border-default-200">
                                                        <span className="text-default-500">Horas abertas:</span>
                                                        <span className="font-semibold text-foreground">{data.hoursOpen}h</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <span className="text-xs text-danger">Fechado</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            }}
                            cursor={false}
                        />
                        <Bar
                            animationDuration={450}
                            animationEasing="ease"
                            barSize={24}
                            dataKey="Horas"
                            radius={[4, 4, 0, 0]}
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={getBarColor(entry.isOpen, entry.hoursOpen)}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>

                <div className="flex w-full justify-center gap-4 pb-4 text-tiny text-default-500">
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-success" />
                        <span>12+ horas</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                        <span>8-12 horas</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-warning" />
                        <span>Menos de 8h</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-default-300" />
                        <span>Fechado</span>
                    </div>
                </div>
            </Card>
        );
    }
);

RestaurantActivityChart.displayName = "RestaurantActivityChart";
