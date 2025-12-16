import { Button, Card, CardBody, CardFooter, Chip, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner, useDisclosure } from "@heroui/react";
import { AddCircle, Magnifer, TrashBinTrash, Ticket, Pen } from "@solar-icons/react";
import { api, restaurantId } from "../services/api";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const DEFAULT_RESTAURANT_ID = restaurantId;

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


    // Create/Edit Modal State
    const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
    const [commandName, setCommandName] = useState("");
    const [editingCommand, setEditingCommand] = useState<Command | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch Commands
    const fetchCommands = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/commands`, {
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


    const handleOpenCreate = () => {
        setEditingCommand(null);
        setCommandName("");
        onOpen();
    };

    const handleOpenEdit = (command: Command) => {
        setEditingCommand(command);
        setCommandName(command.name);
        onOpen();
    };

    const handleSaveCommand = async () => {
        if (!commandName.trim()) {
            toast.warning("Por favor, informe o nome/número da comanda");
            return;
        }

        setIsSaving(true);
        try {
            if (editingCommand) {
                // Update
                const response = await api.patch(`/commands/${editingCommand.id}`, {
                    name: commandName
                });

                setCommands(commands.map(c => c.id === editingCommand.id ? response.data : c));
                toast.success("Comanda atualizada com sucesso!");
            } else {
                // Create
                const response = await api.post(`/commands`, {
                    name: commandName,
                    restaurantId: DEFAULT_RESTAURANT_ID
                });

                setCommands([...commands, response.data]);
                toast.success("Comanda criada com sucesso!");
            }
            onClose();
            setCommandName("");
            setEditingCommand(null);
        } catch (error) {
            console.error("Erro ao salvar comanda:", error);
            toast.error("Erro ao salvar comanda");
        } finally {
            setIsSaving(false);
        }
    };

    // Delete Command
    const handleDeleteCommand = async (id: string, name: string) => {
        if (!confirm(`Tem certeza que deseja excluir a comanda "${name}"?`)) return;

        try {
            await api.delete(`/commands/${id}`);
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
                    </div>
                    <Button
                        color="primary"
                        startContent={<AddCircle size={20} />}
                        onPress={handleOpenCreate}
                    >
                        Nova Comanda
                    </Button>
                </div>

                <Divider />

                {/* Search */}
                <div className="grid grid-cols-12 gap-4 px-6 py-3">
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
                                            onPress={() => handleOpenEdit(command)}
                                        >
                                            <Pen size={18} className="text-default-500" />
                                        </Button>
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
                            <ModalHeader>{editingCommand ? "Editar Comanda" : "Nova Comanda"}</ModalHeader>
                            <ModalBody>
                                <Input
                                    label="Nome/Número da Comanda"
                                    placeholder="Ex: 101"
                                    value={commandName}
                                    onValueChange={setCommandName}
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveCommand();
                                    }}
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>Cancelar</Button>
                                <Button
                                    color="primary"
                                    isLoading={isSaving}
                                    onPress={handleSaveCommand}
                                >
                                    {editingCommand ? "Salvar" : "Criar"}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
