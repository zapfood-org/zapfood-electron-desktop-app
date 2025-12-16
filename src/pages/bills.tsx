import { Button, Card, CardBody, CardFooter, Chip, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner, useDisclosure } from "@heroui/react";
import { AddCircle, Magnifer, TrashBinTrash, Ticket, Pen } from "@solar-icons/react";
import { api, restaurantId } from "../services/api";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const DEFAULT_RESTAURANT_ID = restaurantId;

interface Bill {
    id: string;
    name: string;
    restaurantId: string;
    createdAt?: string;
    updatedAt?: string;
}

export function BillsPage() {
    // State
    const [bills, setBills] = useState<Bill[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");


    // Create/Edit Modal State
    const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
    const [billName, setBillName] = useState("");
    const [editingBill, setEditingBill] = useState<Bill | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch Bills
    const fetchBills = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/bills`, {
                params: {
                    restaurantId: DEFAULT_RESTAURANT_ID,
                    page: 1,
                    size: 100 // Fetch all for now
                }
            });
            setBills(response.data.bills || []);
        } catch (error) {
            console.error("Erro ao buscar comandas:", error);
            toast.error("Erro ao carregar comandas");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBills();
    }, []);


    const handleOpenCreate = () => {
        setEditingBill(null);
        setBillName("");
        onOpen();
    };

    const handleOpenEdit = (bill: Bill) => {
        setEditingBill(bill);
        setBillName(bill.name);
        onOpen();
    };

    const handleSaveBill = async () => {
        if (!billName.trim()) {
            toast.warning("Por favor, informe o nome/número da comanda");
            return;
        }

        setIsSaving(true);
        try {
            if (editingBill) {
                // Update
                const response = await api.patch(`/bills/${editingBill.id}`, {
                    name: billName
                });

                setBills(bills.map(c => c.id === editingBill.id ? response.data : c));
                toast.success("Comanda atualizada com sucesso!");
            } else {
                // Create
                const response = await api.post(`/bills`, {
                    name: billName,
                    restaurantId: DEFAULT_RESTAURANT_ID
                });

                setBills([...bills, response.data]);
                toast.success("Comanda criada com sucesso!");
            }
            onClose();
            setBillName("");
            setEditingBill(null);
        } catch (error) {
            console.error("Erro ao salvar comanda:", error);
            toast.error("Erro ao salvar comanda");
        } finally {
            setIsSaving(false);
        }
    };

    // Delete Bill
    const handleDeleteBill = async (id: string, name: string) => {
        if (!confirm(`Tem certeza que deseja excluir a comanda "${name}"?`)) return;

        try {
            await api.delete(`/bills/${id}`);
            setBills(bills.filter(c => c.id !== id));
            toast.success("Comanda excluída com sucesso");
        } catch (error) {
            console.error("Erro ao excluir comanda:", error);
            toast.error("Erro ao excluir comanda");
        }
    };

    // Filter
    const filteredBills = bills.filter(bill =>
        bill.name.toLowerCase().includes(searchQuery.toLowerCase())
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
                    ) : filteredBills.length === 0 ? (
                        <div className="flex flex-col justify-center items-center h-64 text-default-400">
                            <p className="text-lg">Nenhuma comanda encontrada</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {filteredBills.map(bill => (
                                <Card key={bill.id} className="border border-default-200 hover:border-primary-300 transition-colors">
                                    <CardBody className="flex flex-col items-center justify-center p-6 gap-2">
                                        <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mb-2">
                                            <Ticket size={32} weight="Bold" />
                                        </div>
                                        <h3 className="text-xl font-bold text-center">{bill.name}</h3>
                                        <Chip size="sm" variant="flat" color="success">Ativa</Chip>
                                    </CardBody>
                                    <Divider />
                                    <CardFooter className="justify-end gap-2 p-2 bg-default-50">
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            variant="light"
                                            onPress={() => handleOpenEdit(bill)}
                                        >
                                            <Pen size={18} className="text-default-500" />
                                        </Button>
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            variant="light"
                                            color="danger"
                                            onPress={() => handleDeleteBill(bill.id, bill.name)}
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
                            <ModalHeader>{editingBill ? "Editar Comanda" : "Nova Comanda"}</ModalHeader>
                            <ModalBody>
                                <Input
                                    label="Nome/Número da Comanda"
                                    placeholder="Ex: 101"
                                    value={billName}
                                    onValueChange={setBillName}
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveBill();
                                    }}
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>Cancelar</Button>
                                <Button
                                    color="primary"
                                    isLoading={isSaving}
                                    onPress={handleSaveBill}
                                >
                                    {editingBill ? "Salvar" : "Criar"}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
