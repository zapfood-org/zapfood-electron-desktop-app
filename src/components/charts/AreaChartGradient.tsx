"use client";

import {
    Button,
    Card,
    Chip,
    cn,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Spacer,
    Tab,
    Tabs,
    type CardProps,
} from "@heroui/react";
import { ArrowRight, ArrowRightDown, ArrowRightUp, MenuDots } from "@solar-icons/react";
import React from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";

export type AreaChartGradientData = {
    month: string;
    value: number;
};

export type AreaChartGradientPropItem = {
    key: string;
    title: string;
    value: number;
    suffix: string;
    type: string;
    change: string;
    changeType: "positive" | "negative" | "neutral";
    chartData: AreaChartGradientData[];
};

export type AreaChartGradientProps = {
    title: string;
    data: AreaChartGradientPropItem[];
} & Omit<CardProps, "children">;


// Helper functions
const formatValue = (value: number, type: string | undefined) => {
    if (type === "currency") {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    }
    if (type === "number") {
        if (value >= 1000000) {
            return (value / 1000000).toFixed(1) + "M";
        } else if (value >= 1000) {
            return (value / 1000).toFixed(1) + "k";
        }

        return value.toLocaleString('pt-BR');
    }
    if (type === "percentage") return `${value}%`;

    return value;
};


export const AreaChartGradient = React.forwardRef<HTMLDivElement, AreaChartGradientProps>(
    ({ className, title, data, ...props }, ref) => {
        const [activeChart, setActiveChart] = React.useState<string>(data[0].key);

        const activeChartData = React.useMemo(() => {
            const chart = data.find((d) => d.key === activeChart);

            return {
                chartData: chart?.chartData ?? [],
                color:
                    chart?.changeType === "positive"
                        ? "success"
                        : chart?.changeType === "negative"
                            ? "danger"
                            : "default",
                suffix: chart?.suffix,
                type: chart?.type,
            };
        }, [activeChart, data]);

        const { chartData, color, suffix, type } = activeChartData;

        return (
            <Card ref={ref} as="dl" className={cn("border border-transparent dark:border-default-100", className)} {...props}>
                <section className="flex flex-col flex-nowrap">
                    <div className="flex flex-col justify-between gap-y-2 p-6">
                        <div className="flex flex-col gap-y-2">
                            <div className="flex flex-col gap-y-0">
                                <dt className="text-medium font-medium text-foreground">{title}</dt>
                            </div>
                            <Spacer y={2} />
                            <Tabs size="sm">
                                <Tab key="6-months" title="6 Meses" />
                                <Tab key="3-months" title="3 Meses" />
                                <Tab key="30-days" title="30 Dias" />
                                <Tab key="7-days" title="7 Dias" />
                                <Tab key="24-hours" title="24 Horas" />
                            </Tabs>
                            <div className="mt-2 flex w-full items-center">
                                <div className="-my-3 flex w-full max-w-[800px] items-center gap-x-3 overflow-x-auto py-3">
                                    {data.map(({ key, change, changeType, type, value, title }) => (
                                        <button
                                            key={key}
                                            className={cn(
                                                "flex w-full flex-col gap-2 rounded-medium p-3 transition-colors",
                                                {
                                                    "bg-default-100": activeChart === key,
                                                },
                                            )}
                                            onClick={() => setActiveChart(key)}
                                        >
                                            <span
                                                className={cn("text-small font-medium text-default-500 transition-colors", {
                                                    "text-primary": activeChart === key,
                                                })}
                                            >
                                                {title}
                                            </span>
                                            <div className="flex items-center gap-x-3">
                                                <span className="text-3xl font-bold text-foreground">
                                                    {formatValue(value, type)}
                                                </span>
                                                <Chip
                                                    classNames={{
                                                        content: "font-medium",
                                                    }}
                                                    color={
                                                        changeType === "positive"
                                                            ? "success"
                                                            : changeType === "negative"
                                                                ? "danger"
                                                                : "default"
                                                    }
                                                    radius="sm"
                                                    size="sm"
                                                    startContent={
                                                        changeType === "positive" ? (
                                                            <ArrowRightUp height={16} width={16} />
                                                        ) : changeType === "negative" ? (
                                                            <ArrowRightDown height={16} width={16} />
                                                        ) : (
                                                            <ArrowRight height={16} width={16} />
                                                        )
                                                    }
                                                    variant="flat"
                                                >
                                                    <span>{change}</span>
                                                </Chip>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <ResponsiveContainer
                        className="min-h-[300px] [&_.recharts-surface]:outline-none"
                        height="100%"
                        width="100%"
                    >
                        <AreaChart
                            accessibilityLayer
                            data={chartData}
                            height={300}
                            margin={{
                                left: 0,
                                right: 0,
                            }}
                            width={500}
                        >
                            <defs>
                                <linearGradient id="colorGradient" x1="0" x2="0" y1="0" y2="1">
                                    <stop
                                        offset="10%"
                                        stopColor={`hsl(var(--heroui-${color}-500))`}
                                        stopOpacity={0.3}
                                    />
                                    <stop
                                        offset="100%"
                                        stopColor={`hsl(var(--heroui-${color}-100))`}
                                        stopOpacity={0.1}
                                    />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                horizontalCoordinatesGenerator={() => [200, 150, 100, 50]}
                                stroke="hsl(var(--heroui-default-200))"
                                strokeDasharray="3 3"
                                vertical={false}
                            />
                            <XAxis
                                axisLine={false}
                                dataKey="month"
                                style={{ fontSize: "var(--heroui-font-size-tiny)", transform: "translateX(-40px)" }}
                                tickLine={false}
                            />
                            <Tooltip
                                content={({ label, payload }) => (
                                    <div className="flex h-auto min-w-[120px] items-center gap-x-2 rounded-medium bg-foreground p-2 text-tiny shadow-small">
                                        <div className="flex w-full flex-col gap-y-0">
                                            {payload?.map((p, index) => {
                                                const name = p.name;
                                                const value = p.value;

                                                return (
                                                    <div key={`${index}-${name}`} className="flex w-full items-center gap-x-2">
                                                        <div className="flex w-full items-center gap-x-1 text-small text-background">
                                                            <span>{formatValue(value as number, type)}</span>
                                                            <span>{suffix}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            <span className="text-small font-medium text-foreground-400">
                                                {label}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                cursor={{
                                    strokeWidth: 0,
                                }}
                            />
                            <Area
                                activeDot={{
                                    stroke: `hsl(var(--heroui-${color}))`,
                                    strokeWidth: 2,
                                    fill: "hsl(var(--heroui-background))",
                                    r: 5,
                                }}
                                animationDuration={1000}
                                animationEasing="ease"
                                dataKey="value"
                                fill="url(#colorGradient)"
                                stroke={`hsl(var(--heroui-${color}))`}
                                strokeWidth={2}
                                type="monotone"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                    <Dropdown
                        classNames={{
                            content: "min-w-[120px]",
                        }}
                        placement="bottom-end"
                    >
                        <DropdownTrigger>
                            <Button
                                isIconOnly
                                className="absolute right-2 top-2 w-auto rounded-full"
                                size="sm"
                                variant="light"
                            >
                                <MenuDots height={16} width={16} />
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                            itemClasses={{
                                title: "text-tiny",
                            }}
                            variant="flat"
                        >
                            <DropdownItem key="view-details">Ver Detalhes</DropdownItem>
                            <DropdownItem key="export-data">Exportar Dados</DropdownItem>
                            <DropdownItem key="set-alert">Configurar Alerta</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </section>
            </Card>
        );
    });

AreaChartGradient.displayName = "AreaChartGradient";
