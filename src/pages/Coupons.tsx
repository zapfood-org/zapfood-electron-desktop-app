import {
  Button,
  Chip,
  DatePicker,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  NumberInput,
  Pagination,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@heroui/react";
import { CalendarDate } from "@internationalized/date";
import {
  AddCircle,
  Copy,
  Filter,
  Magnifer,
  PenNewRound,
  TrashBinTrash,
} from "@solar-icons/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";

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

export function CouponsPage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
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
  const itemsPerPage = 20;
  const prevFiltersRef = useRef({
    filterType,
    filterDiscountOn,
    filterValidity,
    filterVisible,
    searchQuery,
  });

  const handleCreate = (onClose: () => void) => {
    toast.success("O cupom foi criado com sucesso!");
    setStartDate(null);
    setExpiryDate(null);
    onClose();
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`O código ${code} foi copiado para a área de transferência`);
  };

  const handleDelete = (id: number) => {
    setCoupons((prev) => prev.filter((coupon) => coupon.id !== id));
    toast.success("O cupom foi excluído com sucesso!");
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
        if (
          filterValidity === "valid" &&
          (coupon.expiryDate < today || coupon.startDate > today)
        ) {
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
      if (
        searchQuery &&
        !coupon.code.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [
    coupons,
    filterType,
    filterDiscountOn,
    filterValidity,
    filterVisible,
    searchQuery,
  ]);

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
      setTimeout(() => {
        setCurrentPage(1);
      }, 0);
      prevFiltersRef.current = {
        filterType,
        filterDiscountOn,
        filterValidity,
        filterVisible,
        searchQuery,
      };
    }

    // Ajustar página se estiver fora do range
    if (currentPage > totalPages && totalPages > 0) {
      setTimeout(() => {
        setCurrentPage(1);
      }, 0);
    }
  }, [
    filterType,
    filterDiscountOn,
    filterValidity,
    filterVisible,
    searchQuery,
    currentPage,
    totalPages,
  ]);

  return (
    <div className="flex flex-col h-full w-full overflow-y-auto bg-default-100 dark:bg-default-10">
      <div className="flex-1 flex flex-col">
        <div className="flex flex-col flex-1 overflow-hidden bg-background">
          <div className="flex items-center gap-4 py-3 max-w-7xl mx-auto w-full">
            <Input
              placeholder="Buscar..."
              startContent={<Magnifer size={18} weight="Outline" />}
              className="max-w-xs"
              value={searchQuery}
              onValueChange={setSearchQuery}
            />

            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="bordered"
                  startContent={<Filter size={16} />}
                  className="capitalize"
                >
                  {filterType !== "all"
                    ? filterType === "percent"
                      ? "Percentual"
                      : "Valor Fixo"
                    : "Filtrar Tipo"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Filtrar por tipo"
                selectedKeys={filterType !== "all" ? [filterType] : []}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;
                  setFilterType(value || "all");
                }}
              >
                <DropdownItem key="all">Todos</DropdownItem>
                <DropdownItem key="percent">Percentual</DropdownItem>
                <DropdownItem key="fixed">Valor Fixo</DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="bordered"
                  startContent={<Filter size={16} />}
                  className="capitalize"
                >
                  {filterDiscountOn !== "all"
                    ? filterDiscountOn === "with_min"
                      ? "Com valor mínimo"
                      : "Sem valor mínimo"
                    : "Filtrar Desconto em"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Filtrar por desconto em"
                selectedKeys={
                  filterDiscountOn !== "all" ? [filterDiscountOn] : []
                }
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;
                  setFilterDiscountOn(value || "all");
                }}
              >
                <DropdownItem key="all">Todos</DropdownItem>
                <DropdownItem key="with_min">Com valor mínimo</DropdownItem>
                <DropdownItem key="without_min">Sem valor mínimo</DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="bordered"
                  startContent={<Filter size={16} />}
                  className="capitalize"
                >
                  {filterValidity !== "all"
                    ? filterValidity === "valid"
                      ? "Válidos"
                      : filterValidity === "expired"
                      ? "Expirados"
                      : "Não iniciados"
                    : "Filtrar Validade"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Filtrar por validade"
                selectedKeys={filterValidity !== "all" ? [filterValidity] : []}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;
                  setFilterValidity(value || "all");
                }}
              >
                <DropdownItem key="all">Todos</DropdownItem>
                <DropdownItem key="valid">Válidos</DropdownItem>
                <DropdownItem key="expired">Expirados</DropdownItem>
                <DropdownItem key="not_started">Não iniciados</DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="bordered"
                  startContent={<Filter size={16} />}
                  className="capitalize"
                >
                  {filterVisible !== "all"
                    ? filterVisible === "active"
                      ? "Ativo"
                      : filterVisible === "expired"
                      ? "Expirado"
                      : "Inativo"
                    : "Filtrar Status"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Filtrar por status"
                selectedKeys={filterVisible !== "all" ? [filterVisible] : []}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;
                  setFilterVisible(value || "all");
                }}
              >
                <DropdownItem key="all">Todos</DropdownItem>
                <DropdownItem key="active">Ativo</DropdownItem>
                <DropdownItem key="expired">Expirado</DropdownItem>
                <DropdownItem key="inactive">Inativo</DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <Button
              color="primary"
              startContent={<AddCircle size={20} weight="Outline" />}
              onPress={onOpen}
              className="ml-auto"
            >
              Criar Cupom
            </Button>
          </div>

          <Divider />
          <div className="flex flex-1 flex-col bg-default-100 dark:bg-default-10">
            {filteredCoupons.length === 0 ? (
              <div className="flex flex-col flex-1 items-center justify-center py-12 text-center">
                <p className="text-lg font-medium text-default-500">
                  Nenhum registro encontrado{" "}
                  {searchQuery && `para "${searchQuery}"`}
                </p>
              </div>
            ) : (
              <Table
                aria-label="Tabela de cupons"
                isHeaderSticky
                classNames={{
                  base: "flex flex-col flex-grow h-0 overflow-y-auto py-3",
                  table: "min-h-0 max-w-7xl mx-auto w-full",
                  wrapper:
                    "flex flex-col flex-grow h-0 overflow-y-auto py-3 max-w-7xl mx-auto w-full",
                }}
              >
                <TableHeader>
                  <TableColumn>CÓDIGO</TableColumn>
                  <TableColumn>TIPO</TableColumn>
                  <TableColumn>DESCONTO</TableColumn>
                  <TableColumn>USOS</TableColumn>
                  <TableColumn>VALOR MÍNIMO</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn align="end">AÇÕES</TableColumn>
                </TableHeader>
                <TableBody>
                  {paginatedCoupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell>
                        <span className="font-mono font-semibold">
                          {coupon.code}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Chip size="sm" variant="flat">
                          {coupon.discountType === "percent"
                            ? "Percentual"
                            : "Valor Fixo"}
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
                                width: `${
                                  (coupon.uses / coupon.maxUses) * 100
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {coupon.minOrderValue ? (
                          <span>
                            R${" "}
                            {coupon.minOrderValue.toFixed(2).replace(".", ",")}
                          </span>
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
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            title="Editar cupom"
                          >
                            <PenNewRound size={18} weight="Outline" />
                          </Button>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            title="Copiar código"
                            onPress={() => handleCopyCode(coupon.code)}
                          >
                            <Copy size={18} weight="Outline" />
                          </Button>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="danger"
                            title="Excluir cupom"
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
            )}
          </div>

          <Divider />

          <div className="flex justify-center items-center py-3">
            {totalPages > 1 ? (
              <Pagination
                total={totalPages}
                page={currentPage}
                onChange={setCurrentPage}
                showControls
                showShadow
                color="primary"
              />
            ) : (
              <Pagination
                isCompact
                showControls
                initialPage={1}
                total={1}
                isDisabled
              />
            )}
          </div>
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
                        startContent={
                          <span className="text-default-500">R$</span>
                        }
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
    </div>
  );
}
