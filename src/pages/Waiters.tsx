
import { Button, Chip, Divider, Input, Pagination, Select, SelectItem, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";
import { toast } from "react-toastify";
import { AddCircle, Magnifer, PenNewRound, TrashBinTrash, User } from "@solar-icons/react";
import { useMemo, useState } from "react";

interface Waiter {
    id: number;
    name: string;
    status: "active" | "inactive";
    phone: string;
    createdAt: string;
}

const initialWaiters: Waiter[] = [
    {
        id: 1,
        name: "João Silva",
        status: "active",
        phone: "(11) 99999-9999",
        createdAt: "2024-01-15",
    },
    {
        id: 2,
        name: "Maria Santos",
        status: "active",
        phone: "(11) 98888-8888",
        createdAt: "2024-02-20",
    },
    {
        id: 3,
        name: "Pedro Oliveira",
        status: "inactive",
        phone: "(11) 97777-7777",
        createdAt: "2023-11-05",
    },
    {
        id: 4,
        name: "Ana Costa",
        status: "active",
        phone: "(11) 96666-6666",
        createdAt: "2024-03-10",
    },
    {
        id: 5,
        name: "Lucas Pereira",
        status: "active",
        phone: "(11) 95555-5555",
        createdAt: "2024-01-01",
    },
];

export function WaitersPage() {
    const [waiters, setWaiters] = useState<Waiter[]>(initialWaiters);

    // Filters
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState<string>("");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const handleDelete = (id: number) => {
        setWaiters(prev => prev.filter(waiter => waiter.id !== id));
        toast.success("O garçom foi removido com sucesso!");
    };

    const getStatusColor = (status: Waiter["status"]) => {
        switch (status) {
            case "active":
                return "success";
            case "inactive":
                return "default";
            default:
                return "default";
        }
    };

    const getStatusLabel = (status: Waiter["status"]) => {
        switch (status) {
            case "active":
                return "Ativo";
            case "inactive":
                return "Inativo";
            default:
                return "Desconhecido";
        }
    };

    const filteredWaiters = useMemo(() => {
        return waiters.filter((waiter) => {
            // Filter by status
            if (filterStatus !== "all" && waiter.status !== filterStatus) {
                return false;
            }

            // Search
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return (
                    waiter.name.toLowerCase().includes(query) ||
                    waiter.phone.includes(query)
                );
            }

            return true;
        });
    }, [waiters, filterStatus, searchQuery]);

    const totalPages = Math.ceil(filteredWaiters.length / itemsPerPage);
    const paginatedWaiters = filteredWaiters.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="flex flex-col flex-1 h-full overflow-hidden">
            <div className="flex items-center justify-between p-6">
                <div>
                    <h1 className="text-3xl font-bold">Garçons</h1>
                    <p className="text-sm text-default-500 mt-1">
                        Gerencie a equipe de atendimento do seu estabelecimento
                    </p>
                </div>
                <Button color="primary" startContent={<AddCircle size={20} weight="Outline" />}>
                    Novo Garçom
                </Button>
            </div>

            <Divider />

            <div className="flex flex-col flex-1 overflow-hidden">
                {/* Filtros */}
                <div className="flex items-center gap-4 p-6 border-b border-default-200">
                    <Select
                        placeholder="Status"
                        selectedKeys={filterStatus !== "all" ? [filterStatus] : []}
                        onSelectionChange={(keys) => {
                            const value = Array.from(keys)[0] as string;
                            setFilterStatus(value || "all");
                        }}
                        className="w-40"
                        size="sm"
                    >
                        <SelectItem key="all">Todos</SelectItem>
                        <SelectItem key="active">Ativo</SelectItem>
                        <SelectItem key="inactive">Inativo</SelectItem>
                    </Select>

                    <div className="flex-1" />

                    <Input
                        placeholder="Buscar por nome ou telefone..."
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                        startContent={<Magnifer size={18} weight="Outline" />}
                        className="w-80"
                        size="sm"
                    />
                </div>

                {/* Tabela */}
                <div className="flex flex-1 flex-col">
                    <Table
                        aria-label="Tabela de Garçons"
                        isHeaderSticky
                        classNames={{
                            base: "flex flex-col flex-grow h-0 overflow-y-auto p-6",
                            table: "min-h-0",
                        }}
                    >
                        <TableHeader>
                            <TableColumn>NOME</TableColumn>
                            <TableColumn>STATUS</TableColumn>
                            <TableColumn>TELEFONE</TableColumn>
                            <TableColumn>DATA CADASTRO</TableColumn>
                            <TableColumn align="end"> </TableColumn>
                        </TableHeader>
                        <TableBody emptyContent={"Nenhum garçom encontrado."}>
                            {paginatedWaiters.map((waiter) => (
                                <TableRow key={waiter.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-semibold">{waiter.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            size="sm"
                                            color={getStatusColor(waiter.status)}
                                            variant="flat"
                                        >
                                            {getStatusLabel(waiter.status)}
                                        </Chip>
                                    </TableCell>
                                    <TableCell>
                                        {waiter.phone}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(waiter.createdAt).toLocaleDateString('pt-BR')}
                                    </TableCell>
                                    <TableCell align="right">
                                        <div className="flex items-center gap-2 justify-end">
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                variant="light"
                                                aria-label="Editar"
                                            >
                                                <PenNewRound size={18} weight="Outline" />
                                            </Button>
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                variant="light"
                                                color="danger"
                                                aria-label="Excluir"
                                                onPress={() => handleDelete(waiter.id)}
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
        </div>
    );
}
