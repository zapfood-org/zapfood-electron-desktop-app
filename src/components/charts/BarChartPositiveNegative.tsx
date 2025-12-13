"use client";

import type { ButtonProps, CardProps } from "@heroui/react";

import React from "react";
import { BarChart, Bar, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import {
    Card,
    Button,
    Select,
    SelectItem,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    cn,
} from "@heroui/react";
import { MenuDots } from "@solar-icons/react";

export type BarChartPositiveNegativeData = {
    month: string;
    [key: string]: string | number;
};

export type BarChartPositiveNegativeProps = {
    title: string;
    value: string;
    unit?: string;
    color: ButtonProps["color"];
    categories: string[];
    chartData: BarChartPositiveNegativeData[];
} & Omit<CardProps, "children">;


const formatMonth = (month: string) => {
    const monthNumber =
        {
            Jan: 0,
            Feb: 1,
            Mar: 2,
            Apr: 3,
            May: 4,
            Jun: 5,
            Jul: 6,
            Aug: 7,
            Sep: 8,
            Oct: 9,
            Nov: 10,
            Dec: 11,
        }[month] ?? 0;

    return new Intl.DateTimeFormat("en-US", { month: "long" }).format(new Date(2024, monthNumber, 1));
};

export const BarChartPositiveNegative = React.forwardRef<HTMLDivElement, BarChartPositiveNegativeProps>(
    ({ className, title, value, unit, categories, color, chartData, ...props }, ref) => {
        return (
            <Card
                ref={ref}
                className={cn("h-[300px] border border-transparent dark:border-default-100", className)}
                {...props}
            >
                <div className="flex flex-col gap-y-2 px-4 pb-2 pt-4">
                    <div className="flex items-center justify-between gap-x-2">
                        <dt>
                            <h3 className="text-small font-medium text-default-500">{title}</h3>
                        </dt>
                        <div className="flex items-center justify-end gap-x-2">
                            <Select
                                aria-label="Time Range"
                                classNames={{
                                    trigger: "min-w-[100px] min-h-7 h-7",
                                    value: "text-tiny !text-default-500",
                                    selectorIcon: "text-default-500",
                                    popoverContent: "min-w-[120px]",
                                }}
                                defaultSelectedKeys={["per-day"]}
                                listboxProps={{
                                    itemClasses: {
                                        title: "text-tiny",
                                    },
                                }}
                                placeholder="Per Day"
                                size="sm"
                            >
                                <SelectItem key="per-day">Per Day</SelectItem>
                                <SelectItem key="per-week">Per Week</SelectItem>
                                <SelectItem key="per-month">Per Month</SelectItem>
                            </Select>
                            <Dropdown
                                classNames={{
                                    content: "min-w-[120px]",
                                }}
                                placement="bottom-end"
                            >
                                <DropdownTrigger>
                                    <Button isIconOnly radius="full" size="sm" variant="light">
                                        <MenuDots height={16} width={16} />
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                    itemClasses={{
                                        title: "text-tiny",
                                    }}
                                    variant="flat"
                                >
                                    <DropdownItem key="view-details">View Details</DropdownItem>
                                    <DropdownItem key="export-data">Export Data</DropdownItem>
                                    <DropdownItem key="set-alert">Set Alert</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        </div>
                    </div>
                    <dd className="flex items-baseline gap-x-1">
                        <span className="text-3xl font-semibold text-default-900">{value}</span>
                        <span className="text-medium font-medium text-default-500">{unit}</span>
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
                            top: 10,
                            right: 24,
                            left: 20,
                            bottom: 24,
                        }}
                        stackOffset="sign"
                    >
                        <Tooltip
                            content={({ payload }) => {
                                const month = payload?.[0]?.payload?.month;

                                return (
                                    <div className="flex h-auto min-w-[120px] items-center gap-x-2 rounded-medium bg-background p-2 text-tiny shadow-small">
                                        <div className="flex w-full flex-col gap-y-1">
                                            <span className="font-medium text-foreground">{formatMonth(month)}</span>
                                            {payload?.map((p, index) => {
                                                const name = p.name;
                                                const value = p.value;
                                                const category = categories.find((c) => c.toLowerCase() === name) ?? name;

                                                return (
                                                    <div
                                                        key={`${index}-${name}`}
                                                        className="flex w-full items-center gap-x-2"
                                                    >
                                                        <div
                                                            className="h-2 w-2 flex-none rounded-full"
                                                            style={{
                                                                backgroundColor:
                                                                    index === 0
                                                                        ? color === "default"
                                                                            ? "hsl(var(--heroui-foreground))"
                                                                            : `hsl(var(--heroui-${color}))`
                                                                        : "hsl(var(--heroui-default-200))",
                                                            }}
                                                        />
                                                        <div className="flex w-full items-center justify-between gap-x-2 pr-1 text-xs text-default-700">
                                                            <span className="text-default-500">{category}</span>
                                                            <span className="font-mono font-medium text-default-700">
                                                                {value}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            }}
                            cursor={false}
                        />
                        {[-1000, 0, 1000].map((value) => (
                            <ReferenceLine
                                key={value}
                                stroke="hsl(var(--heroui-default-200))"
                                strokeDasharray="3 3"
                                y={value}
                            />
                        ))}
                        {categories.map((category, index) => (
                            <Bar
                                key={category}
                                animationDuration={450}
                                animationEasing="ease"
                                barSize={8}
                                dataKey={category}
                                fill={
                                    index === 0
                                        ? cn({
                                            "hsl(var(--heroui-foreground))": color === "default",
                                            "hsl(var(--heroui-success))": color === "success",
                                            "hsl(var(--heroui-warning))": color === "warning",
                                            "hsl(var(--heroui-danger))": color === "danger",
                                            "hsl(var(--heroui-primary))": color === "primary",
                                            "hsl(var(--heroui-secondary))": color === "secondary",
                                        })
                                        : "hsl(var(--heroui-default-200))"
                                }
                                radius={[8, 8, 0, 0]}
                                stackId="stack"
                            />
                        ))}
                    </BarChart>
                </ResponsiveContainer>

                <div className="flex w-full justify-center gap-4 pb-4 text-tiny text-default-500">
                    {categories.map((category, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <span
                                className="h-2 w-2 rounded-full"
                                style={{
                                    backgroundColor: `hsl(var(--heroui-${index === 0 ? (color === "default" ? "foreground" : color) : "default-200"
                                        }))`,
                                }}
                            />
                            <span className="capitalize">{category}</span>
                        </div>
                    ))}
                </div>
            </Card>
        );
    },
);

BarChartPositiveNegative.displayName = "BarChartPositiveNegative";
