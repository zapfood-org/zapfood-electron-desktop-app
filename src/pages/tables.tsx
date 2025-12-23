import { ScrollArea } from "@/components/ui/scroll-area";
import { authClient } from "@/lib/auth-client";
import { Button, Card, CardBody, CardFooter, Chip, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner, useDisclosure } from "@heroui/react";
import { AddCircle, BillList, Magnifer } from "@solar-icons/react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "../services/api";

export interface Table {
    id: string;
    name: string;
    restaurantId: string;
    createdAt?: string;
    updatedAt?: string;
}

export function TablesPage() {
    const { data: activeOrg } = authClient.useActiveOrganization();
    const restaurantId = activeOrg?.id;

    // State
    const [tables, setTables] = useState<Table[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Create Modal State
    const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
    const [tableName, setTableName] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const navigate = useNavigate();
    const { tenantId } = useParams();

    const handleViewBills = (table: Table) => {
        navigate(`/${tenantId}/tables/${table.id}`);
    };

    // Fetch Tables
    const fetchTables = async () => {
        if (!restaurantId) return;
        setIsLoading(true);
        try {
            const response = await api.get(`/tables`, {
                params: {
                    restaurantId: restaurantId,
                    page: 1,
                    size: 100 // Fetch all for now
                }
            });
            setTables(response.data.tables || []);
        } catch (error) {
            console.error("Erro ao buscar mesas:", error);
            toast.error("Erro ao carregar mesas");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTables();
    }, []);


    const handleOpenCreate = () => {
        setTableName("");
        onOpen();
    };

    const handleSaveTable = async () => {
        if (!tableName.trim()) {
            toast.warning("Por favor, informe o nome da mesa");
            return;
        }

        setIsSaving(true);
        try {
            const response = await api.post(`/tables`, {
                name: tableName,
                restaurantId: restaurantId
            });

            setTables([...tables, response.data]);
            toast.success("Mesa criada com sucesso!");
            onClose();
            setTableName("");
        } catch (error) {
            console.error("Erro ao salvar mesa:", error);
            toast.error("Erro ao salvar mesa");
        } finally {
            setIsSaving(false);
        }
    };

    // Filter
    const filteredTables = tables.filter(table =>
        table.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col flex-1 bg-default-50">
            <div className="flex flex-col bg-background">
                {/* Header */}
                <div className="flex justify-between items-center p-6">
                    <div>
                        <h1 className="text-3xl font-bold">Mesas</h1>
                    </div>
                    <Button
                        color="primary"
                        startContent={<AddCircle size={20} />}
                        onPress={handleOpenCreate}
                    >
                        Nova Mesa
                    </Button>
                </div>

                <Divider />

                {/* Search */}
                <div className="grid grid-cols-12 gap-4 px-6 py-3">
                    <Input
                        placeholder="Buscar mesas..."
                        startContent={<Magnifer size={20} className="text-default-400" />}
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                        className="col-span-12 md:col-span-6 lg:col-span-3"
                    />
                </div>
            </div>

            <Divider />

            {/* Content */}
            <div className="flex flex-col flex-1 gap-6 overflow-hidden">

                {/* List */}
                <ScrollArea className="flex flex-col flex-grow h-0 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Spinner size="lg" />
                        </div>
                    ) : filteredTables.length === 0 ? (
                        <div className="flex flex-col justify-center items-center h-64 text-default-400">
                            <p className="text-lg">Nenhuma mesa encontrada</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-6">
                            {filteredTables.map(table => (
                                <Card key={table.id} className="border border-default-200 hover:border-primary-300 transition-colors cursor-pointer">
                                    <CardBody className="flex flex-col items-center justify-center p-6 gap-2">
                                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                                            <span className="text-2xl font-bold">{table.name.replace(/\D/g, '') || '#'}</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-center">{table.name}</h3>
                                        {/* Optional: Add status if existing in future */}
                                        <Chip size="sm" variant="flat" color="success">Disponível</Chip>
                                    </CardBody>
                                    <Divider />
                                    <CardFooter className="justify-end gap-2 p-2 bg-default-50">
                                        <Button
                                            size="sm"
                                            variant="flat"
                                            color="primary"
                                            startContent={<BillList size={18} />}
                                            onPress={() => handleViewBills(table)}
                                        >
                                            Ver Comandas
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </div>

            {/* Create Modal */}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>Nova Mesa</ModalHeader>
                            <ModalBody>
                                <Input
                                    label="Nome da Mesa"
                                    placeholder="Ex: Mesa 01"
                                    value={tableName}
                                    onValueChange={setTableName}
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveTable();
                                    }}
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>Cancelar</Button>
                                <Button
                                    color="primary"
                                    isLoading={isSaving}
                                    onPress={handleSaveTable}
                                >
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
