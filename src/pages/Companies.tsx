import { Button, Card, CardBody, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure, Chip } from "@heroui/react";
import { useStoreStatus } from "../hooks/useStoreStatus";
import { Box, Shop, Logout } from "@solar-icons/react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

interface Company {
    id: string;
    name: string;
    cnpj: string;
    description: string;
}

export function CompaniesPage() {
    const navigate = useNavigate();
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [companies, setCompanies] = useState<Company[]>([]);

    // New company form state
    const [newCompany, setNewCompany] = useState({
        name: "",
        cnpj: "",
        description: ""
    });

    useEffect(() => {
        // Load companies from localStorage on mount
        const savedCompanies = localStorage.getItem("zapfood_companies");
        if (savedCompanies) {
            setCompanies(JSON.parse(savedCompanies));
        }
    }, []);

    const handleCreateCompany = () => {
        if (!newCompany.name.trim()) {
            toast.error("Nome do restaurante é obrigatório");
            return;
        }

        if (!newCompany.cnpj.trim()) {
            toast.error("CNPJ é obrigatório");
            return;
        }

        const company: Company = {
            id: crypto.randomUUID(), // Simple ID generation
            name: newCompany.name,
            cnpj: newCompany.cnpj,
            description: newCompany.description
        };

        const updatedCompanies = [...companies, company];
        setCompanies(updatedCompanies);
        localStorage.setItem("zapfood_companies", JSON.stringify(updatedCompanies));

        toast.success("Restaurante cadastrado com sucesso!");
        setNewCompany({ name: "", cnpj: "", description: "" });
        onOpenChange(); // Close modal
    };

    const handleSelectCompany = (companyId: string) => {
        navigate(`/${companyId}/dashboard`);
    };

    return (
        <div className="flex flex-col h-full w-full bg-default-100 dark:bg-default-10 overflow-y-auto">
            <div className="flex-1 p-8 max-w-5xl mx-auto w-full">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-default-900">Meus Restaurantes</h1>
                        <p className="text-default-500 mt-1">Gerencie seus restaurantes e estabelecimentos</p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            color="danger"
                            variant="flat"
                            startContent={<Logout size={20} />}
                            onPress={() => navigate("/login")}
                        >
                            Sair
                        </Button>
                        <Button
                            color="primary"
                            startContent={<Box size={20} />}
                            onPress={onOpen}
                        >
                            Novo Restaurante
                        </Button>
                    </div>
                </div>

                {companies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-default-300">
                        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center mb-4">
                            <Shop size={32} className="text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold text-default-700">Nenhum restaurante encontrado</h3>
                        <p className="text-default-500 mt-2 text-center max-w-md">
                            Você ainda não possui nenhum restaurante cadastrado. Clique no botão "Novo Restaurante" para começar.
                        </p>
                        <Button
                            color="primary"
                            variant="flat"
                            className="mt-6"
                            onPress={onOpen}
                        >
                            Cadastrar meu primeiro restaurante
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {companies.map((company) => (
                            <CompanyCard key={company.id} company={company} onSelect={handleSelectCompany} />
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de Cadastro */}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Cadastrar Novo Restaurante</ModalHeader>
                            <ModalBody>
                                <Input
                                    label="Nome do Restaurante"
                                    placeholder="Ex: Pizzaria do João"
                                    value={newCompany.name}
                                    onValueChange={(val) => setNewCompany({ ...newCompany, name: val })}
                                    startContent={<Shop size={18} className="text-default-400" />}
                                    isRequired
                                />
                                <Input
                                    label="CNPJ"
                                    placeholder="00.000.000/0000-00"
                                    value={newCompany.cnpj}
                                    onValueChange={(val) => setNewCompany({ ...newCompany, cnpj: val })}
                                    isRequired
                                />
                                <Input
                                    label="Descrição"
                                    placeholder="Uma breve descrição do seu negócio"
                                    value={newCompany.description}
                                    onValueChange={(val) => setNewCompany({ ...newCompany, description: val })}
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cancelar
                                </Button>
                                <Button color="primary" onPress={handleCreateCompany}>
                                    Cadastrar
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}

function CompanyCard({ company, onSelect }: { company: Company; onSelect: (id: string) => void }) {
    const { isOpen } = useStoreStatus(company.id);

    return (
        <Card
            isPressable
            onPress={() => onSelect(company.id)}
            className="hover:scale-[1.02] transition-transform duration-200"
        >
            <CardBody className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                        <Shop size={24} weight="Bold" />
                    </div>
                    <Chip
                        size="sm"
                        color={isOpen ? "success" : "danger"}
                        variant="dot"
                        className="border-0"
                    >
                        {isOpen ? "Aberto" : "Fechado"}
                    </Chip>
                </div>
                <h3 className="text-lg font-bold text-default-900">{company.name}</h3>
                {company.cnpj && (
                    <p className="text-xs text-default-500 mt-1 font-mono">{company.cnpj}</p>
                )}
                {company.description && (
                    <p className="text-sm text-default-400 mt-3 line-clamp-2">
                        {company.description}
                    </p>
                )}
            </CardBody>
        </Card>
    );
}
