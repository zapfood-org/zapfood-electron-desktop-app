import {
  Button,
  Chip,
  Divider,
  Input,
  Pagination,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { Download, Magnifer } from "@solar-icons/react";
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

const initialInvoices: Invoice[] = [
  {
    id: 1,
    number: "INV-2024-001",
    planName: "Starter",
    planId: "starter",
    amount: 99.0,
    issueDate: "2024-01-15",
    dueDate: "2024-02-15",
    paymentDate: "2024-02-10",
    status: "paid",
    paymentMethod: "pix",
    period: "Janeiro 2024",
  },
  {
    id: 2,
    number: "INV-2024-002",
    planName: "Starter",
    planId: "starter",
    amount: 99.0,
    issueDate: "2024-02-15",
    dueDate: "2024-03-15",
    status: "pending",
    period: "Fevereiro 2024",
  },
  {
    id: 3,
    number: "INV-2024-003",
    planName: "Premium",
    planId: "premium",
    amount: 299.0,
    issueDate: "2023-12-15",
    dueDate: "2024-01-15",
    status: "overdue",
    period: "Dezembro 2023",
  },
  {
    id: 4,
    number: "INV-2024-004",
    planName: "Starter",
    planId: "starter",
    amount: 99.0,
    issueDate: "2024-03-15",
    dueDate: "2024-04-15",
    paymentDate: "2024-03-14",
    status: "paid",
    paymentMethod: "credit",
    period: "Março 2024",
  },
  {
    id: 5,
    number: "INV-2024-005",
    planName: "Freemium",
    planId: "freemium",
    amount: 0.0,
    issueDate: "2024-01-01",
    dueDate: "2024-02-01",
    status: "paid",
    period: "Janeiro 2024",
  },
  {
    id: 6,
    number: "INV-2024-006",
    planName: "Premium",
    planId: "premium",
    amount: 299.0,
    issueDate: "2024-01-15",
    dueDate: "2024-02-15",
    status: "cancelled",
    period: "Janeiro 2024",
  },
  {
    id: 7,
    number: "INV-2024-007",
    planName: "Starter",
    planId: "starter",
    amount: 99.0,
    issueDate: "2024-04-15",
    dueDate: "2024-05-15",
    paymentDate: "2024-04-20",
    status: "paid",
    paymentMethod: "debit",
    period: "Abril 2024",
  },
  {
    id: 8,
    number: "INV-2024-008",
    planName: "Starter",
    planId: "starter",
    amount: 99.0,
    issueDate: "2024-05-15",
    dueDate: "2024-06-15",
    status: "pending",
    period: "Maio 2024",
  },
];

export function InvoicesPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const [invoices] = useState<Invoice[]>(initialInvoices);

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

  return (
    <div className="flex flex-col h-full w-full overflow-y-auto">
      <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col gap-6 py-6">
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Filtros */}
          <div className="flex items-center gap-4">
            <Select
              placeholder="Status"
              selectedKeys={filterStatus !== "all" ? [filterStatus] : []}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as string;
                setFilterStatus(value || "all");
              }}
              className="w-40"
            >
              <SelectItem key="all">Todos</SelectItem>
              <SelectItem key="paid">Pago</SelectItem>
              <SelectItem key="pending">Pendente</SelectItem>
              <SelectItem key="overdue">Vencido</SelectItem>
              <SelectItem key="cancelled">Cancelado</SelectItem>
            </Select>

            <Select
              placeholder="Método de Pagamento"
              selectedKeys={
                filterPaymentMethod !== "all" ? [filterPaymentMethod] : []
              }
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as string;
                setFilterPaymentMethod(value || "all");
              }}
              className="w-48"
            >
              <SelectItem key="all">Todos</SelectItem>
              <SelectItem key="pix">PIX</SelectItem>
              <SelectItem key="credit">Cartão Crédito</SelectItem>
              <SelectItem key="debit">Cartão Débito</SelectItem>
            </Select>

            <div className="flex-1" />

            <Input
              placeholder="Buscar fatura..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={<Magnifer size={18} weight="Outline" />}
              className="w-64"
            />
          </div>

          <Divider />

          {/* Tabela */}
          <div className="flex flex-1 flex-col">
            <Table
              aria-label="Tabela de faturas"
              isHeaderSticky
              classNames={{
                base: "flex flex-col flex-grow h-0 overflow-y-auto p-6",
                table: "min-h-0",
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
                <TableColumn> </TableColumn>
              </TableHeader>
              <TableBody emptyContent={"Nenhuma fatura encontrada."}>
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
                    <TableCell align="right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="light"
                          isIconOnly
                          aria-label="Baixar fatura"
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
          </div>

          <Divider />

          {/* Paginação */}
          {totalPages > 0 && (
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
      </div>
    </div>
  );
}
