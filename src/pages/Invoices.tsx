import {
  Button,
  Chip,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { Download, Filter, Magnifer } from "@solar-icons/react";
import moment from "moment";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

export interface Invoice {
  id: number;
  number: string;
  planName: string;
  planId: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  paymentDate?: string;
  status: "pending" | "paid" | "overdue" | "cancelled";
  paymentMethod?: "pix" | "credit" | "debit";
  period: string;
}

export function InvoicesPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const [invoices] = useState<Invoice[]>([]);

  // Filtros
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const prevFiltersRef = useRef({
    filterStatus,
    filterPaymentMethod,
    searchQuery,
  });

  const handleViewDetails = (invoiceId: number) => {
    navigate(`/${tenantId}/invoices/${invoiceId}`);
  };

  const handleDownload = (invoice: Invoice) => {
    toast.success(`Download da fatura ${invoice.number} iniciado`);
  };

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace(".", ",")}`;
  };

  const formatDate = (date: string) => {
    return moment(date).format("DD/MM/YYYY");
  };

  const getStatusColor = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return "success";
      case "pending":
        return "warning";
      case "overdue":
        return "danger";
      case "cancelled":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return "Pago";
      case "pending":
        return "Pendente";
      case "overdue":
        return "Vencido";
      case "cancelled":
        return "Cancelado";
      default:
        return "Desconhecido";
    }
  };

  const getPaymentMethodLabel = (method?: Invoice["paymentMethod"]) => {
    if (!method) return "-";
    switch (method) {
      case "pix":
        return "PIX";
      case "credit":
        return "Cartão Crédito";
      case "debit":
        return "Cartão Débito";
      default:
        return "-";
    }
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      // Filtro por status
      if (filterStatus !== "all" && invoice.status !== filterStatus) {
        return false;
      }

      // Filtro por método de pagamento
      if (
        filterPaymentMethod !== "all" &&
        invoice.paymentMethod !== filterPaymentMethod
      ) {
        return false;
      }

      // Filtro por busca
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          invoice.number.toLowerCase().includes(query) ||
          invoice.planName.toLowerCase().includes(query) ||
          invoice.period.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [invoices, filterStatus, filterPaymentMethod, searchQuery]);

  // Paginação das faturas filtradas
  const paginatedInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredInvoices.slice(startIndex, endIndex);
  }, [filteredInvoices, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  // Resetar página quando os filtros mudarem
  useEffect(() => {
    const filtersChanged =
      prevFiltersRef.current.filterStatus !== filterStatus ||
      prevFiltersRef.current.filterPaymentMethod !== filterPaymentMethod ||
      prevFiltersRef.current.searchQuery !== searchQuery;

    if (filtersChanged) {
      setTimeout(() => {
        setCurrentPage(1);
      }, 0);
      prevFiltersRef.current = {
        filterStatus,
        filterPaymentMethod,
        searchQuery,
      };
    }

    // Ajustar página se estiver fora do range
    if (currentPage > totalPages && totalPages > 0) {
      setTimeout(() => {
        setCurrentPage(1);
      }, 0);
    }
  }, [filterStatus, filterPaymentMethod, searchQuery, currentPage, totalPages]);

  const getStatusLabelForFilter = (status: string) => {
    switch (status) {
      case "paid":
        return "Pago";
      case "pending":
        return "Pendente";
      case "overdue":
        return "Vencido";
      case "cancelled":
        return "Cancelado";
      default:
        return "Filtrar Status";
    }
  };

  const getPaymentMethodLabelForFilter = (method: string) => {
    switch (method) {
      case "pix":
        return "PIX";
      case "credit":
        return "Cartão Crédito";
      case "debit":
        return "Cartão Débito";
      default:
        return "Filtrar Método";
    }
  };

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
                  {filterStatus !== "all"
                    ? getStatusLabelForFilter(filterStatus)
                    : "Filtrar Status"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Filtrar por status"
                selectedKeys={filterStatus !== "all" ? [filterStatus] : []}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;
                  setFilterStatus(value || "all");
                }}
              >
                <DropdownItem key="all">Todos</DropdownItem>
                <DropdownItem key="paid">Pago</DropdownItem>
                <DropdownItem key="pending">Pendente</DropdownItem>
                <DropdownItem key="overdue">Vencido</DropdownItem>
                <DropdownItem key="cancelled">Cancelado</DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="bordered"
                  startContent={<Filter size={16} />}
                  className="capitalize"
                >
                  {filterPaymentMethod !== "all"
                    ? getPaymentMethodLabelForFilter(filterPaymentMethod)
                    : "Filtrar Método"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Filtrar por método de pagamento"
                selectedKeys={
                  filterPaymentMethod !== "all" ? [filterPaymentMethod] : []
                }
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;
                  setFilterPaymentMethod(value || "all");
                }}
              >
                <DropdownItem key="all">Todos</DropdownItem>
                <DropdownItem key="pix">PIX</DropdownItem>
                <DropdownItem key="credit">Cartão Crédito</DropdownItem>
                <DropdownItem key="debit">Cartão Débito</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>

          <Divider />
          <div className="flex flex-1 flex-col bg-default-100 dark:bg-default-10">
            {filteredInvoices.length === 0 ? (
              <div className="flex flex-col flex-1 items-center justify-center py-12 text-center">
                <p className="text-lg font-medium text-default-500">
                  Nenhum registro encontrado{" "}
                  {searchQuery && `para "${searchQuery}"`}
                </p>
              </div>
            ) : (
              <Table
                aria-label="Tabela de faturas"
                isHeaderSticky
                classNames={{
                  base: "flex flex-col flex-grow h-0 overflow-y-auto py-3",
                  table: "min-h-0 max-w-7xl mx-auto w-full",
                  wrapper:
                    "flex flex-col flex-grow h-0 overflow-y-auto py-3 max-w-7xl mx-auto w-full",
                }}
              >
                <TableHeader>
                  <TableColumn>NÚMERO</TableColumn>
                  <TableColumn>PLANO</TableColumn>
                  <TableColumn>PERÍODO</TableColumn>
                  <TableColumn>VALOR</TableColumn>
                  <TableColumn>EMISSÃO</TableColumn>
                  <TableColumn>VENCIMENTO</TableColumn>
                  <TableColumn>PAGAMENTO</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn align="end">AÇÕES</TableColumn>
                </TableHeader>
                <TableBody>
                  {paginatedInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <span className="font-mono font-semibold">
                          {invoice.number}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{invoice.planName}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{invoice.period}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-primary">
                          {formatCurrency(invoice.amount)}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                      <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {invoice.paymentDate && (
                            <span className="text-sm">
                              {formatDate(invoice.paymentDate)}
                            </span>
                          )}
                          <span className="text-xs text-default-500">
                            {getPaymentMethodLabel(invoice.paymentMethod)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="sm"
                          color={getStatusColor(invoice.status)}
                          variant="flat"
                        >
                          {getStatusLabel(invoice.status)}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            title="Baixar fatura"
                            onPress={() => handleDownload(invoice)}
                          >
                            <Download size={18} weight="Outline" />
                          </Button>
                          <Button
                            size="sm"
                            variant="flat"
                            color="primary"
                            onPress={() => handleViewDetails(invoice.id)}
                          >
                            Ver Detalhes
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
      </div>
    </div>
  );
}
