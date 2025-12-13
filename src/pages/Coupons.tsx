
import { addToast, Button, Chip, DatePicker, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, NumberInput, Pagination, Select, SelectItem, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, useDisclosure } from "@heroui/react";
import { CalendarDate } from "@internationalized/date";
import { AddCircle, Copy, Magnifer, PenNewRound, TrashBinTrash } from "@solar-icons/react";
import { useEffect, useMemo, useRef, useState } from "react";

interface Coupon {
    id: number;
    code: string;
    discountType: "percent" | "fixed";
    discountValue: number;
    uses: number;
    maxUses: number;
    minOrderValue?: number;
    startDate: string;
    expiryDate: string;
    status: "active" | "expired" | "inactive";
}

const initialCoupons: Coupon[] = [
    {
        id: 1,
        code: "DESC10",
        discountType: "percent",
        discountValue: 10,
        uses: 45,
        maxUses: 100,
        minOrderValue: 50,
        startDate: "2024-01-01",
        expiryDate: "2024-12-31",
        status: "active",
    },
    {
        id: 2,
        code: "FRETE20",
        discountType: "fixed",
        discountValue: 20,
        uses: 12,
        maxUses: 50,
        minOrderValue: 100,
        startDate: "2024-01-01",
        expiryDate: "2024-06-30",
        status: "active",
    },
    {
        id: 3,
        code: "BEMVINDO",
        discountType: "percent",
        discountValue: 15,
        uses: 89,
        maxUses: 200,
        startDate: "2024-01-01",
        expiryDate: "2024-12-31",
        status: "active",
    },
    {
        id: 4,
        code: "PROMO2023",
        discountType: "percent",
        discountValue: 25,
        uses: 200,
        maxUses: 200,
        startDate: "2023-01-01",
        expiryDate: "2023-12-31",
        status: "expired",
    },
    {
        id: 5,
        code: "BLACKFRIDAY",
        discountType: "percent",
        discountValue: 30,
        uses: 150,
        maxUses: 500,
        minOrderValue: 100,
        startDate: "2024-11-01",
        expiryDate: "2024-11-30",
        status: "active",
    },
    {
        id: 6,
        code: "NATAL2024",
        discountType: "percent",
        discountValue: 20,
        uses: 78,
        maxUses: 300,
        startDate: "2024-12-01",
        expiryDate: "2024-12-25",
        status: "active",
    },
    {
        id: 7,
        code: "FRETEGRATIS",
        discountType: "fixed",
        discountValue: 15,
        uses: 234,
        maxUses: 1000,
        minOrderValue: 80,
        startDate: "2024-01-01",
        expiryDate: "2024-12-31",
        status: "active",
    },
    {
        id: 8,
        code: "PRIMEIRA",
        discountType: "percent",
        discountValue: 25,
        uses: 45,
        maxUses: 100,
        startDate: "2024-01-01",
        expiryDate: "2024-12-31",
        status: "active",
    },
    {
        id: 9,
        code: "FIDELIDADE",
        discountType: "percent",
        discountValue: 15,
        uses: 89,
        maxUses: 200,
        minOrderValue: 60,
        startDate: "2024-01-01",
        expiryDate: "2024-12-31",
        status: "active",
    },
    {
        id: 10,
        code: "ANIVERSARIO",
        discountType: "percent",
        discountValue: 20,
        uses: 12,
        maxUses: 50,
        startDate: "2024-06-01",
        expiryDate: "2024-06-30",
        status: "active",
    },
    {
        id: 11,
        code: "SUMMER2024",
        discountType: "percent",
        discountValue: 18,
        uses: 156,
        maxUses: 400,
        startDate: "2024-12-01",
        expiryDate: "2025-02-28",
        status: "active",
    },
    {
        id: 12,
        code: "DESC5",
        discountType: "percent",
        discountValue: 5,
        uses: 567,
        maxUses: 1000,
        startDate: "2024-01-01",
        expiryDate: "2024-12-31",
        status: "active",
    },
    {
        id: 13,
        code: "VIP50",
        discountType: "percent",
        discountValue: 50,
        uses: 8,
        maxUses: 20,
        minOrderValue: 200,
        startDate: "2024-01-01",
        expiryDate: "2024-12-31",
        status: "active",
    },
    {
        id: 14,
        code: "QUARTA",
        discountType: "percent",
        discountValue: 12,
        uses: 234,
        maxUses: 500,
        startDate: "2024-01-01",
        expiryDate: "2024-12-31",
        status: "active",
    },
    {
        id: 15,
        code: "FRETE15",
        discountType: "fixed",
        discountValue: 15,
        uses: 345,
        maxUses: 800,
        minOrderValue: 70,
        startDate: "2024-01-01",
        expiryDate: "2024-12-31",
        status: "active",
    },
    {
        id: 16,
        code: "MEGA30",
        discountType: "percent",
        discountValue: 30,
        uses: 67,
        maxUses: 150,
        minOrderValue: 120,
        startDate: "2024-01-01",
        expiryDate: "2024-12-31",
        status: "active",
    },
    {
        id: 17,
        code: "PROMO2022",
        discountType: "percent",
        discountValue: 20,
        uses: 500,
        maxUses: 500,
        startDate: "2022-01-01",
        expiryDate: "2022-12-31",
        status: "expired",
    },
    {
        id: 18,
        code: "INATIVO1",
        discountType: "percent",
        discountValue: 10,
        uses: 0,
        maxUses: 100,
        startDate: "2024-01-01",
        expiryDate: "2024-12-31",
        status: "inactive",
    },
    {
        id: 19,
        code: "DESC25",
        discountType: "percent",
        discountValue: 25,
        uses: 123,
        maxUses: 300,
        minOrderValue: 90,
        startDate: "2024-01-01",
        expiryDate: "2024-12-31",
        status: "active",
    },
    {
        id: 20,
        code: "FRETE25",
        discountType: "fixed",
        discountValue: 25,
        uses: 45,
        maxUses: 200,
        minOrderValue: 150,
        startDate: "2024-01-01",
        expiryDate: "2024-12-31",
        status: "active",
    },
    {
        id: 21,
        code: "SEMANA",
        discountType: "percent",
        discountValue: 8,
        uses: 789,
        maxUses: 2000,
        startDate: "2024-01-01",
        expiryDate: "2024-12-31",
        status: "active",
    },
    {
        id: 22,
        code: "FIMDESEMANA",
        discountType: "percent",
        discountValue: 12,
        uses: 456,
        maxUses: 1000,
        startDate: "2024-01-01",
        expiryDate: "2024-12-31",
        status: "active",
    },
    {
        id: 23,
        code: "LANCAMENTO",
        discountType: "percent",
        discountValue: 35,
        uses: 23,
        maxUses: 100,
        minOrderValue: 100,
        startDate: "2024-01-01",
        expiryDate: "2024-12-31",
        status: "active",
    },
    {
        id: 24,
        code: "ESPECIAL40",
        discountType: "percent",
        discountValue: 40,
        uses: 5,
        maxUses: 50,
        minOrderValue: 250,
        startDate: "2024-01-01",
        expiryDate: "2024-12-31",
        status: "active",
    },
];

export function CouponsPage() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
    const [startDate, setStartDate] = useState<CalendarDate | null>(null);
    const [expiryDate, setExpiryDate] = useState<CalendarDate | null>(null);

    // Filtros
    const [filterType, setFilterType] = useState<string>("all");
    const [filterDiscountOn, setFilterDiscountOn] = useState<string>("all");
    const [filterValidity, setFilterValidity] = useState<string>("all");
    const [filterVisible, setFilterVisible] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState<string>("");

    // Paginação
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const prevFiltersRef = useRef({ filterType, filterDiscountOn, filterValidity, filterVisible, searchQuery });

    const handleCreate = (onClose: () => void) => {
        addToast({
            title: "Cupom criado",
            description: "O cupom foi criado com sucesso!",
            color: "success",
        });
        setStartDate(null);
        setExpiryDate(null);
        onClose();
    };

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        addToast({
            title: "Código copiado",
            description: `O código ${code} foi copiado para a área de transferência`,
            color: "success",
        });
    };

    const handleDelete = (id: number) => {
        setCoupons(prev => prev.filter(coupon => coupon.id !== id));
        addToast({
            title: "Cupom excluído",
            description: "O cupom foi excluído com sucesso!",
            color: "success",
        });
    };

    const formatDiscount = (coupon: Coupon) => {
        if (coupon.discountType === "percent") {
            return `${coupon.discountValue}%`;
        }
        return `R$ ${coupon.discountValue.toFixed(2).replace(".", ",")}`;
    };

    const getStatusColor = (status: Coupon["status"]) => {
        switch (status) {
            case "active":
                return "success";
            case "expired":
                return "danger";
            case "inactive":
                return "default";
            default:
                return "default";
        }
    };

    const getStatusLabel = (status: Coupon["status"]) => {
        switch (status) {
            case "active":
                return "Ativo";
            case "expired":
                return "Expirado";
            case "inactive":
                return "Inativo";
            default:
                return "Desconhecido";
        }
    };

    const filteredCoupons = useMemo(() => {
        return coupons.filter((coupon) => {
            // Filtro por tipo
            if (filterType !== "all" && coupon.discountType !== filterType) {
                return false;
            }

            // Filtro por desconto em (valor mínimo)
            if (filterDiscountOn !== "all") {
                if (filterDiscountOn === "with_min" && !coupon.minOrderValue) {
                    return false;
                }
                if (filterDiscountOn === "without_min" && coupon.minOrderValue) {
                    return false;
                }
            }

            // Filtro por validade
            if (filterValidity !== "all") {
                const today = new Date().toISOString().split("T")[0];
                if (filterValidity === "valid" && (coupon.expiryDate < today || coupon.startDate > today)) {
                    return false;
                }
                if (filterValidity === "expired" && coupon.expiryDate >= today) {
                    return false;
                }
                if (filterValidity === "not_started" && coupon.startDate > today) {
                    return false;
                }
            }

            // Filtro por visível (status)
            if (filterVisible !== "all" && coupon.status !== filterVisible) {
                return false;
            }

            // Filtro por busca
            if (searchQuery && !coupon.code.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }

            return true;
        });
    }, [coupons, filterType, filterDiscountOn, filterValidity, filterVisible, searchQuery]);

    // Paginação dos cupons filtrados
    const paginatedCoupons = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredCoupons.slice(startIndex, endIndex);
    }, [filteredCoupons, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredCoupons.length / itemsPerPage);

    // Resetar página quando os filtros mudarem
    useEffect(() => {
        const filtersChanged =
            prevFiltersRef.current.filterType !== filterType ||
            prevFiltersRef.current.filterDiscountOn !== filterDiscountOn ||
            prevFiltersRef.current.filterValidity !== filterValidity ||
            prevFiltersRef.current.filterVisible !== filterVisible ||
            prevFiltersRef.current.searchQuery !== searchQuery;

        if (filtersChanged) {
            setCurrentPage(1);
            prevFiltersRef.current = { filterType, filterDiscountOn, filterValidity, filterVisible, searchQuery };
        }

        // Ajustar página se estiver fora do range
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(1);
        }
    }, [filterType, filterDiscountOn, filterValidity, filterVisible, searchQuery, currentPage, totalPages]);

    return (
        <div className="flex flex-col flex-1 h-full overflow-hidden">
            <div className="flex items-center justify-between p-6">
                <div>
                    <h1 className="text-3xl font-bold">Cupons</h1>
                    <p className="text-sm text-default-500 mt-1">
                        Gerencie cupons de desconto
                    </p>
                </div>
                <Button color="primary" startContent={<AddCircle size={20} weight="Outline" />} onPress={onOpen}>
                    Criar Cupom
                </Button>
            </div>

            <Divider />

            <div className="flex flex-col flex-1 overflow-hidden">
                {/* Filtros */}
                <div className="flex items-center gap-4 p-6 border-b border-default-200">
                    <Select
                        placeholder="Tipo"
                        selectedKeys={filterType !== "all" ? [filterType] : []}
                        onSelectionChange={(keys) => {
                            const value = Array.from(keys)[0] as string;
                            setFilterType(value || "all");
                        }}
                        className="w-40"
                        size="sm"
                    >
                        <SelectItem key="all">Todos</SelectItem>
                        <SelectItem key="percent">Percentual</SelectItem>
                        <SelectItem key="fixed">Valor Fixo</SelectItem>
                    </Select>

                    <Select
                        placeholder="Desconto em"
                        selectedKeys={filterDiscountOn !== "all" ? [filterDiscountOn] : []}
                        onSelectionChange={(keys) => {
                            const value = Array.from(keys)[0] as string;
                            setFilterDiscountOn(value || "all");
                        }}
                        className="w-40"
                        size="sm"
                    >
                        <SelectItem key="all">Todos</SelectItem>
                        <SelectItem key="with_min">Com valor mínimo</SelectItem>
                        <SelectItem key="without_min">Sem valor mínimo</SelectItem>
                    </Select>

                    <Select
                        placeholder="Validade"
                        selectedKeys={filterValidity !== "all" ? [filterValidity] : []}
                        onSelectionChange={(keys) => {
                            const value = Array.from(keys)[0] as string;
                            setFilterValidity(value || "all");
                        }}
                        className="w-40"
                        size="sm"
                    >
                        <SelectItem key="all">Todos</SelectItem>
                        <SelectItem key="valid">Válidos</SelectItem>
                        <SelectItem key="expired">Expirados</SelectItem>
                        <SelectItem key="not_started">Não iniciados</SelectItem>
                    </Select>

                    <Select
                        placeholder="Visível"
                        selectedKeys={filterVisible !== "all" ? [filterVisible] : []}
                        onSelectionChange={(keys) => {
                            const value = Array.from(keys)[0] as string;
                            setFilterVisible(value || "all");
                        }}
                        className="w-40"
                        size="sm"
                    >
                        <SelectItem key="all">Todos</SelectItem>
                        <SelectItem key="active">Ativo</SelectItem>
                        <SelectItem key="expired">Expirado</SelectItem>
                        <SelectItem key="inactive">Inativo</SelectItem>
                    </Select>

                    <div className="flex-1" />

                    <Input
                        placeholder="Buscar cupom"
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                        startContent={<Magnifer size={18} weight="Outline" />}
                        className="w-64"
                        size="sm"
                    />
                </div>

                {/* Tabela */}
                <div className="flex-1 overflow-y-auto p-6">
                    <Table aria-label="Tabela de cupons" removeWrapper>
                        <TableHeader>
                            <TableColumn>CÓDIGO</TableColumn>
                            <TableColumn>TIPO</TableColumn>
                            <TableColumn>DESCONTO</TableColumn>
                            <TableColumn>USOS</TableColumn>
                            <TableColumn>VALOR MÍNIMO</TableColumn>
                            <TableColumn>STATUS</TableColumn>
                            <TableColumn>AÇÕES</TableColumn>
                        </TableHeader>
                        <TableBody>
                            {paginatedCoupons.map((coupon) => (
                                <TableRow key={coupon.id}>
                                    <TableCell>
                                        <span className="font-mono font-semibold">{coupon.code}</span>
                                    </TableCell>
                                    <TableCell>
                                        <Chip size="sm" variant="flat">
                                            {coupon.discountType === "percent" ? "Percentual" : "Valor Fixo"}
                                        </Chip>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-semibold text-primary">
                                            {formatDiscount(coupon)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">
                                                {coupon.uses} / {coupon.maxUses}
                                            </span>
                                            <div className="w-full bg-default-200 rounded-full h-1.5 mt-1">
                                                <div
                                                    className="bg-primary h-1.5 rounded-full"
                                                    style={{
                                                        width: `${(coupon.uses / coupon.maxUses) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {coupon.minOrderValue ? (
                                            <span>R$ {coupon.minOrderValue.toFixed(2).replace(".", ",")}</span>
                                        ) : (
                                            <span className="text-default-400">Sem mínimo</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            size="sm"
                                            color={getStatusColor(coupon.status)}
                                            variant="flat"
                                        >
                                            {getStatusLabel(coupon.status)}
                                        </Chip>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="light"
                                                isIconOnly
                                                aria-label="Editar cupom"
                                            >
                                                <PenNewRound size={18} weight="Outline" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="light"
                                                isIconOnly
                                                aria-label="Copiar código"
                                                onPress={() => handleCopyCode(coupon.code)}
                                            >
                                                <Copy size={18} weight="Outline" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="light"
                                                color="danger"
                                                isIconOnly
                                                aria-label="Excluir cupom"
                                                onPress={() => handleDelete(coupon.id)}
                                            >
                                                <TrashBinTrash size={18} weight="Outline" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <Divider />
                
                {/* Paginação */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center py-4">
                        <Pagination
                            total={totalPages}
                            page={currentPage}
                            onChange={setCurrentPage}
                            showControls
                            showShadow
                            color="primary"
                        />
                    </div>
                )}
            </div>

            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                backdrop="blur"
                size="2xl"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <h2 className="text-2xl font-bold">Criar Cupom</h2>
                                <p className="text-sm text-default-500 font-normal">
                                    Configure um novo cupom de desconto
                                </p>
                            </ModalHeader>
                            <ModalBody>
                                <div className="flex flex-col gap-4">
                                    <Input
                                        label="Código do Cupom"
                                        placeholder="Ex: DESC10, FRETE20"
                                        isRequired
                                        description="Código que o cliente usará para aplicar o desconto"
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Select
                                            label="Tipo de Desconto"
                                            placeholder="Selecione"
                                            isRequired
                                        >
                                            <SelectItem key="percent">Percentual (%)</SelectItem>
                                            <SelectItem key="fixed">Valor Fixo (R$)</SelectItem>
                                        </Select>
                                        <NumberInput
                                            label="Valor do Desconto"
                                            placeholder="0"
                                            minValue={0}
                                            step={0.01}
                                            isRequired
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <NumberInput
                                            label="Usos Máximos"
                                            placeholder="100"
                                            minValue={1}
                                            step={1}
                                            isRequired
                                        />
                                        <NumberInput
                                            label="Valor Mínimo do Pedido"
                                            placeholder="0.00"
                                            minValue={0}
                                            step={0.01}
                                            startContent={<span className="text-default-500">R$</span>}
                                            formatOptions={{
                                                style: "currency",
                                                currency: "BRL",
                                            }}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <DatePicker
                                            label="Data de Início"
                                            value={startDate}
                                            onChange={setStartDate}
                                            firstDayOfWeek="mon"
                                            isRequired
                                        />
                                        <DatePicker
                                            label="Data de Expiração"
                                            value={expiryDate}
                                            onChange={setExpiryDate}
                                            minValue={startDate || undefined}
                                            firstDayOfWeek="mon"
                                            isRequired
                                        />
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>
                                    Cancelar
                                </Button>
                                <Button color="primary" onPress={() => handleCreate(onClose)}>
                                    Criar
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
