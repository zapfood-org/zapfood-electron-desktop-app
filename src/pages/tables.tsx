import { Button, Card, CardBody, CardFooter, Chip, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner, useDisclosure } from "@heroui/react";
import { AddCircle, Magnifer, TrashBinTrash } from "@solar-icons/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

// Configuration (Should be centralized ideally)
const API_URL = "http://localhost:5000";
// Using the same token/restaurantId as observed in other files
const AUTH_TOKEN = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IllYNWFfWS1lemNHSDRXTWU3U0ZjSCJ9.eyJpZCI6IjY5MDExYmEzNTNjNWFhYmI1YzVkZDhkNyIsImlzcyI6Imh0dHBzOi8vZGV2LWdrNWJ6NzVzbW9zZW5xMjQudXMuYXV0aDAuY29tLyIsInN1YiI6Imdvb2dsZS1vYXV0aDJ8MTE3MjUxNzI0NzA2ODUyNzEyNTgwIiwiYXVkIjpbImh0dHBzOi8vemFwZm9vZC5zaG9wIiwiaHR0cHM6Ly9kZXYtZ2s1Yno3NXNtb3NlbnEyNC51cy5hdXRoMC5jb20vdXNlcmluZm8iXSwiaWF0IjoxNzY1ODQ3OTY2LCJleHAiOjE3NjU5MzQzNjYsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwiLCJhenAiOiJrZlZXTGd2OG1SR0V5bWxpWGRueDVFRXJZWmE3b1h2cCJ9.VxXbDq1VxgSAmPvwxaRvYEgcApP4lF6EQKZjYGgtuMgs9CHbwGI6ILKUPfq53g-CLXtgztdoOr0Cgmqk9MqdSFYkqQQhBD7vDTPiKh6qZWywifD85rMeVCbRxoudeH-x06WuxkciYLUp1mVSsRS3n0Z2slqy8xGIyGQk9IoJPLef62DgA-Jtn57coisIXzqYdTxrenZ1KI4tIuu_iu2anklNrkvFVRn7SvZXHzM-aPE8y5DGNKf40nydzlf-zveR1kFvlqhU_CLJrPRKL-1FSURZHLlI_qyT-XGKsHCc488TIv13FjWUL-icetwMpe4LF3FuM7QhN3ELIMdMHRKqDQ";
const DEFAULT_RESTAURANT_ID = "cmj6oymuh0001kv04uygl2c4z";

axios.defaults.headers.common['Authorization'] = `Bearer ${AUTH_TOKEN}`;

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

    // Create Modal State
    const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
    const [newTableName, setNewTableName] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    // Fetch Tables
    const fetchTables = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_URL}/tables`, {
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

    // Create Table
    const handleCreateTable = async () => {
        if (!newTableName.trim()) {
            toast.warning("Por favor, informe o nome da mesa");
            return;
        }

        setIsCreating(true);
        try {
            const response = await axios.post(`${API_URL}/tables`, {
                name: newTableName,
                restaurantId: DEFAULT_RESTAURANT_ID
            });

            setTables([...tables, response.data]);
            toast.success("Mesa criada com sucesso!");
            setNewTableName("");
            onClose();
        } catch (error) {
            console.error("Erro ao criar mesa:", error);
            toast.error("Erro ao criar mesa");
        } finally {
            setIsCreating(false);
        }
    };

    // Delete Table
    const handleDeleteTable = async (id: string, name: string) => {
        if (!confirm(`Tem certeza que deseja excluir a mesa "${name}"?`)) return;

        try {
            await axios.delete(`${API_URL}/tables/${id}`);
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
                        <p className="text-default-500">Gerencie as mesas do seu estabelecimento</p>
                    </div>
                    <Button
                        color="primary"
                        startContent={<AddCircle size={20} />}
                        onPress={onOpen}
                    >
                        Nova Mesa
                    </Button>
                </div>

                <Divider />

                {/* Search */}
                <div className="grid grid-cols-12 gap-4 p-6">
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
                            <ModalHeader>Nova Mesa</ModalHeader>
                            <ModalBody>
                                <Input
                                    label="Nome da Mesa"
                                    placeholder="Ex: Mesa 01"
                                    value={newTableName}
                                    onValueChange={setNewTableName}
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleCreateTable();
                                    }}
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>Cancelar</Button>
                                <Button
                                    color="primary"
                                    isLoading={isCreating}
                                    onPress={handleCreateTable}
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
