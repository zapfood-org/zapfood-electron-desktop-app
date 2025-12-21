import { Button, Card, CardBody, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure, Chip, Avatar, Spinner } from "@heroui/react";
import { useStoreStatus } from "../hooks/useStoreStatus";
import { Box, Shop, Logout, Logout3 } from "@solar-icons/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authClient } from "@/lib/auth-client";

interface Organization {
    id: string;
    name: string;
    slug: string;
    logo?: string;
    metadata?: any;
    createdAt?: Date;
}

export function CompaniesPage() {
    const navigate = useNavigate();
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    // Auth Hooks
    const { data: session } = authClient.useSession();
    const { data: organizations, isPending: isLoadingOrgs, refetch: refetchOrgs } = authClient.useListOrganizations();

    // New company form state
    const [newCompany, setNewCompany] = useState({
        name: "",
        slug: "",
        description: "" // Will be stored in metadata
    });
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateCompany = async () => {
        if (!newCompany.name.trim()) {
            toast.error("Nome do restaurante é obrigatório");
            return;
        }

        if (!newCompany.slug.trim()) {
            toast.error("Identificador (Slug) é obrigatório");
            return;
        }

        setIsCreating(true);
        try {
            const { data, error } = await authClient.organization.create({
                name: newCompany.name,
                slug: newCompany.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                metadata: {
                    description: newCompany.description
                }
            });

            if (error) {
                toast.error(error.message || "Erro ao criar organização");
            } else {
                toast.success("Restaurante cadastrado com sucesso!");
                setNewCompany({ name: "", slug: "", description: "" });
                onOpenChange(); // Close modal
                refetchOrgs();
            }
        } catch (e: any) {
            console.error(e);
            toast.error("Erro inesperado ao criar organização");
        } finally {
            setIsCreating(false);
        }
    };

    const handleSelectCompany = async (companyId: string) => {
        try {
            const { error } = await authClient.organization.setActive({
                organizationId: companyId
            });

            if (error) {
                toast.error("Erro ao selecionar organização");
                return;
            }
            navigate(`/${companyId}/dashboard`);
        } catch (e) {
            console.error(e);
            toast.error("Erro ao definir organização ativa");
        }
    };

    const handleLogout = async () => {
        await authClient.signOut();
        navigate("/login");
    };

    return (
        <div className="flex flex-col h-full w-full bg-default-100 dark:bg-default-10 overflow-y-auto">
            <div className="flex-1 p-8 max-w-5xl mx-auto w-full">

                {/* Header with User Info */}
                <div className="flex items-center justify-between mb-8 bg-background p-6 rounded-2xl shadow-sm border border-default-200">
                    <div className="flex items-center gap-4">
                        <Avatar
                            src={session?.user?.image || undefined}
                            name={session?.user?.name || "User"}
                            size="lg"
                            isBordered
                            color="primary"
                        />
                        <div>
                            <h1 className="text-2xl font-bold text-default-900">
                                Olá, {session?.user?.name?.split(' ')[0] || "Visitante"}!
                            </h1>
                            <p className="text-default-500 text-sm">{session?.user?.email}</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            color="danger"
                            variant="flat"
                            startContent={<Logout3 size={20} />}
                            onPress={handleLogout}
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

                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-default-900">Meus Restaurantes</h2>
                        <p className="text-default-500 text-sm">Gerencie seus estabelecimentos</p>
                    </div>
                </div>

                {isLoadingOrgs ? (
                    <div className="flex justify-center p-10">
                        <Spinner size="lg" />
                    </div>
                ) : !organizations || organizations.length === 0 ? (
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
                        {organizations.map((org: any) => (
                            <CompanyCard key={org.id} company={org} onSelect={handleSelectCompany} />
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
                                    onValueChange={(val) => {
                                        // Auto-generate slug from name if slug is empty, sanitize simple regex
                                        const slug = !newCompany.slug ? val.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-') : newCompany.slug;
                                        setNewCompany({ ...newCompany, name: val, slug: newCompany.slug ? newCompany.slug : slug })
                                    }}
                                    startContent={<Shop size={18} className="text-default-400" />}
                                    isRequired
                                />
                                <Input
                                    label="Identificador (Slug)"
                                    placeholder="pizzaria-do-joao"
                                    value={newCompany.slug}
                                    onValueChange={(val) => setNewCompany({ ...newCompany, slug: val })}
                                    isRequired
                                    description="Identificador único para URL (sem espaços ou caracteres especiais)."
                                    startContent={<span className="text-default-400 text-small">zapfood.com/</span>}
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
                                <Button color="primary" onPress={handleCreateCompany} isLoading={isCreating}>
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

function CompanyCard({ company, onSelect }: { company: any; onSelect: (id: string) => void }) {
    // Note: useStoreStatus logic might need update if it depends on local ID. 
    // Assuming it works or returns default for now.
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
                        {company.logo ? (
                            <img src={company.logo} alt={company.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                            <Shop size={24} weight="Bold" />
                        )}
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
                <p className="text-xs text-default-500 mt-1 font-mono">@{company.slug}</p>
                {company.metadata?.description && (
                    <p className="text-sm text-default-400 mt-3 line-clamp-2">
                        {company.metadata.description}
                    </p>
                )}
            </CardBody>
        </Card>
    );
}
