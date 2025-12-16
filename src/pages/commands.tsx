import { Button, Card, CardBody, CardFooter, Chip, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner, useDisclosure } from "@heroui/react";
import { AddCircle, Magnifer, TrashBinTrash, Ticket } from "@solar-icons/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

// Configuration
const API_URL = "http://localhost:5000";
const AUTH_TOKEN = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IllYNWFfWS1lemNHSDRXTWU3U0ZjSCJ9.eyJpZCI6IjY5MDExYmEzNTNjNWFhYmI1YzVkZDhkNyIsImlzcyI6Imh0dHBzOi8vZGV2LWdrNWJ6NzVzbW9zZW5xMjQudXMuYXV0aDAuY29tLyIsInN1YiI6Imdvb2dsZS1vYXV0aDJ8MTE3MjUxNzI0NzA2ODUyNzEyNTgwIiwiYXVkIjpbImh0dHBzOi8vemFwZm9vZC5zaG9wIiwiaHR0cHM6Ly9kZXYtZ2s1Yno3NXNtb3NlbnEyNC51cy5hdXRoMC5jb20vdXNlcmluZm8iXSwiaWF0IjoxNzY1ODQ3OTY2LCJleHAiOjE3NjU5MzQzNjYsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwiLCJhenAiOiJrZlZXTGd2OG1SR0V5bWxpWGRueDVFRXJZWmE3b1h2cCJ9.VxXbDq1VxgSAmPvwxaRvYEgcApP4lF6EQKZjYGgtuMgs9CHbwGI6ILKUPfq53g-CLXtgztdoOr0Cgmqk9MqdSFYkqQQhBD7vDTPiKh6qZWywifD85rMeVCbRxoudeH-x06WuxkciYLUp1mVSsRS3n0Z2slqy8xGIyGQk9IoJPLef62DgA-Jtn57coisIXzqYdTxrenZ1KI4tIuu_iu2anklNrkvFVRn7SvZXHzM-aPE8y5DGNKf40nydzlf-zveR1kFvlqhU_CLJrPRKL-1FSURZHLlI_qyT-XGKsHCc488TIv13FjWUL-icetwMpe4LF3FuM7QhN3ELIMdMHRKqDQ";
const DEFAULT_RESTAURANT_ID = "cmj6oymuh0001kv04uygl2c4z";

axios.defaults.headers.common['Authorization'] = `Bearer ${AUTH_TOKEN}`;

interface Command {
    id: string;
    name: string;
    restaurantId: string;
    createdAt?: string;
    updatedAt?: string;
}

export function CommandsPage() {
    // State
    const [commands, setCommands] = useState<Command[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Create Modal State
    const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
    const [newCommandName, setNewCommandName] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    // Fetch Commands
    const fetchCommands = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_URL}/commands`, {
                params: {
                    restaurantId: DEFAULT_RESTAURANT_ID,
                    page: 1,
                    size: 100 // Fetch all for now
                }
            });
            setCommands(response.data.commands || []);
        } catch (error) {
            console.error("Erro ao buscar comandas:", error);
            toast.error("Erro ao carregar comandas");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCommands();
    }, []);

    // Create Command
    const handleCreateCommand = async () => {
        if (!newCommandName.trim()) {
            toast.warning("Por favor, informe o nome/número da comanda");
            return;
        }

        setIsCreating(true);
        try {
            const response = await axios.post(`${API_URL}/commands`, {
                name: newCommandName,
                restaurantId: DEFAULT_RESTAURANT_ID
            });

            setCommands([...commands, response.data]);
            toast.success("Comanda criada com sucesso!");
            setNewCommandName("");
            onClose();
        } catch (error) {
            console.error("Erro ao criar comanda:", error);
            toast.error("Erro ao criar comanda");
        } finally {
            setIsCreating(false);
        }
    };

    // Delete Command
    const handleDeleteCommand = async (id: string, name: string) => {
        if (!confirm(`Tem certeza que deseja excluir a comanda "${name}"?`)) return;

        try {
            await axios.delete(`${API_URL}/commands/${id}`);
            setCommands(commands.filter(c => c.id !== id));
            toast.success("Comanda excluída com sucesso");
        } catch (error) {
            console.error("Erro ao excluir comanda:", error);
            toast.error("Erro ao excluir comanda");
        }
    };

    // Filter
    const filteredCommands = commands.filter(command =>
        command.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col flex-1 bg-default-50">
            <div className="flex flex-col bg-background">
                {/* Header */}
                <div className="flex justify-between items-center p-6">
                    <div>
                        <h1 className="text-3xl font-bold">Comandas</h1>
                        <p className="text-default-500">Gerencie as comandas do seu estabelecimento</p>
                    </div>
                    <Button
                        color="primary"
                        startContent={<AddCircle size={20} />}
                        onPress={onOpen}
                    >
                        Nova Comanda
                    </Button>
                </div>

                <Divider />

                {/* Search */}
                <div className="grid grid-cols-12 gap-4 p-6">
                    <Input
                        placeholder="Buscar comandas..."
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
                    ) : filteredCommands.length === 0 ? (
                        <div className="flex flex-col justify-center items-center h-64 text-default-400">
                            <p className="text-lg">Nenhuma comanda encontrada</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {filteredCommands.map(command => (
                                <Card key={command.id} className="border border-default-200 hover:border-primary-300 transition-colors">
                                    <CardBody className="flex flex-col items-center justify-center p-6 gap-2">
                                        <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mb-2">
                                            <Ticket size={32} weight="Bold" />
                                        </div>
                                        <h3 className="text-xl font-bold text-center">{command.name}</h3>
                                        <Chip size="sm" variant="flat" color="success">Ativa</Chip>
                                    </CardBody>
                                    <Divider />
                                    <CardFooter className="justify-end gap-2 p-2 bg-default-50">
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            variant="light"
                                            color="danger"
                                            onPress={() => handleDeleteCommand(command.id, command.name)}
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
                            <ModalHeader>Nova Comanda</ModalHeader>
                            <ModalBody>
                                <Input
                                    label="Nome/Número da Comanda"
                                    placeholder="Ex: 101"
                                    value={newCommandName}
                                    onValueChange={setNewCommandName}
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleCreateCommand();
                                    }}
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>Cancelar</Button>
                                <Button
                                    color="primary"
                                    isLoading={isCreating}
                                    onPress={handleCreateCommand}
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
