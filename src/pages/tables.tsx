import { Button, Card, CardBody, CardFooter, Chip, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner, useDisclosure } from "@heroui/react";
import { AddCircle, Magnifer, TrashBinTrash, Pen } from "@solar-icons/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { api, restaurantId } from "../services/api";

const DEFAULT_RESTAURANT_ID = restaurantId;

interface Table {
    id: string;
    name: string;
    restaurantId: string;
    createdAt?: string;
    updatedAt?: string;
}

export function TablesPage() {
    // State
    const [tables, setTables] = useState<Table[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Create/Edit Modal State
    const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
    const [tableName, setTableName] = useState("");
    const [editingTable, setEditingTable] = useState<Table | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch Tables
    const fetchTables = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/tables`, {
                params: {
                    restaurantId: DEFAULT_RESTAURANT_ID,
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
        setEditingTable(null);
        setTableName("");
        onOpen();
    };

    const handleOpenEdit = (table: Table) => {
        setEditingTable(table);
        setTableName(table.name);
        onOpen();
    };

    const handleSaveTable = async () => {
        if (!tableName.trim()) {
            toast.warning("Por favor, informe o nome da mesa");
            return;
        }

        setIsSaving(true);
        try {
            if (editingTable) {
                // Update
                const response = await api.patch(`/tables/${editingTable.id}`, {
                    name: tableName
                });

                setTables(tables.map(t => t.id === editingTable.id ? response.data : t));
                toast.success("Mesa atualizada com sucesso!");
            } else {
                // Create
                const response = await api.post(`/tables`, {
                    name: tableName,
                    restaurantId: DEFAULT_RESTAURANT_ID
                });

                setTables([...tables, response.data]);
                toast.success("Mesa criada com sucesso!");
            }
            onClose();
            setTableName("");
            setEditingTable(null);
        } catch (error) {
            console.error("Erro ao salvar mesa:", error);
            toast.error("Erro ao salvar mesa");
        } finally {
            setIsSaving(false);
        }
    };

    // Delete Table
    const handleDeleteTable = async (id: string, name: string) => {
        if (!confirm(`Tem certeza que deseja excluir a mesa "${name}"?`)) return;

        try {
            await api.delete(`/tables/${id}`);
            setTables(tables.filter(t => t.id !== id));
            toast.success("Mesa excluída com sucesso");
        } catch (error) {
            console.error("Erro ao excluir mesa:", error);
            toast.error("Erro ao excluir mesa");
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
                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Spinner size="lg" />
                        </div>
                    ) : filteredTables.length === 0 ? (
                        <div className="flex flex-col justify-center items-center h-64 text-default-400">
                            <p className="text-lg">Nenhuma mesa encontrada</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
                                            isIconOnly
                                            size="sm"
                                            variant="light"
                                            onPress={() => handleOpenEdit(table)}
                                        >
                                            <Pen size={18} className="text-default-500" />
                                        </Button>
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            variant="light"
                                            color="danger"
                                            onPress={() => handleDeleteTable(table.id, table.name)}
                                        >
                                            <TrashBinTrash size={18} />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Modal */}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>{editingTable ? "Editar Mesa" : "Nova Mesa"}</ModalHeader>
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
                                    {editingTable ? "Salvar" : "Criar"}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
