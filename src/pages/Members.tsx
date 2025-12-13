
import { addToast, Avatar, Button, Card, CardBody, Chip, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Pagination, Select, SelectItem, Tab, Tabs, useDisclosure } from "@heroui/react";
import { AddCircle, Archive, Calendar, Letter, Magnifer, Phone, Restart, Settings, UsersGroupRounded } from "@solar-icons/react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ScrollArea } from "../components/ui/scroll-area";

interface Member {
    id: string;
    name: string;
    email: string;
    role: "admin" | "manager" | "staff" | "viewer";
    status: "active" | "archived";
    phone?: string;
    createdAt: string;
    lastAccess?: string;
}

const mockMembers: Member[] = [
    {
        id: "1",
        name: "João Silva",
        email: "joao.silva@exemplo.com",
        role: "admin",
        status: "active",
        phone: "(11) 98765-4321",
        createdAt: "2024-01-15",
        lastAccess: "2024-12-20",
    },
    {
        id: "2",
        name: "Maria Santos",
        email: "maria.santos@exemplo.com",
        role: "manager",
        status: "active",
        phone: "(11) 98765-4322",
        createdAt: "2024-02-10",
        lastAccess: "2024-12-19",
    },
    {
        id: "3",
        name: "Pedro Costa",
        email: "pedro.costa@exemplo.com",
        role: "staff",
        status: "active",
        phone: "(11) 98765-4323",
        createdAt: "2024-03-20",
        lastAccess: "2024-12-18",
    },
    {
        id: "4",
        name: "Ana Oliveira",
        email: "ana.oliveira@exemplo.com",
        role: "viewer",
        status: "archived",
        phone: "(11) 98765-4324",
        createdAt: "2024-04-05",
        lastAccess: "2024-11-15",
    },
    {
        id: "5",
        name: "Carlos Mendes",
        email: "carlos.mendes@exemplo.com",
        role: "staff",
        status: "active",
        phone: "(11) 98765-4325",
        createdAt: "2024-05-12",
        lastAccess: "2024-12-17",
    },
    {
        id: "6",
        name: "Fernanda Lima",
        email: "fernanda.lima@exemplo.com",
        role: "manager",
        status: "archived",
        phone: "(11) 98765-4326",
        createdAt: "2023-11-20",
        lastAccess: "2024-10-10",
    },
    {
        id: "7",
        name: "Roberto Alves",
        email: "roberto.alves@exemplo.com",
        role: "staff",
        status: "active",
        phone: "(11) 98765-4327",
        createdAt: "2024-06-08",
        lastAccess: "2024-12-16",
    },
    {
        id: "8",
        name: "Juliana Ferreira",
        email: "juliana.ferreira@exemplo.com",
        role: "viewer",
        status: "archived",
        phone: "(11) 98765-4328",
        createdAt: "2023-09-15",
        lastAccess: "2024-08-20",
    },
];

const roleLabels: { [key: string]: string } = {
    admin: "Administrador",
    manager: "Gerente",
    staff: "Equipe",
    viewer: "Visualizador",
};

const roleColors: { [key: string]: "default" | "primary" | "secondary" | "success" | "warning" | "danger" } = {
    admin: "danger",
    manager: "warning",
    staff: "primary",
    viewer: "default",
};

export function MembersPage() {
    const { tenantId } = useParams();
    const navigate = useNavigate();
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [members, setMembers] = useState<Member[]>(mockMembers);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        role: "staff" as Member["role"],
        status: "active" as Member["status"],
    });
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState<"active" | "archived">("active");
    const [size] = useState<"10" | "20" | "50" | "100">("10");

    const handleOpen = (member?: Member) => {
        if (member) {
            setSelectedMember(member);
            setFormData({
                name: member.name,
                email: member.email,
                phone: member.phone || "",
                role: member.role,
                status: member.status,
            });
        } else {
            setSelectedMember(null);
            setFormData({
                name: "",
                email: "",
                phone: "",
                role: "staff",
                status: "active",
            });
        }
        onOpen();
    };

    const handleClose = () => {
        setSelectedMember(null);
        setFormData({
            name: "",
            email: "",
            phone: "",
            role: "staff",
            status: "active",
        });
        onOpenChange();
    };

    const handleSave = () => {
        if (!formData.name.trim() || !formData.email.trim()) {
            addToast({
                title: "Erro",
                description: "Nome e e-mail são obrigatórios",
                color: "danger",
            });
            return;
        }

        if (selectedMember) {
            setMembers(
                members.map((m) =>
                    m.id === selectedMember.id
                        ? {
                            ...m,
                            ...formData,
                            id: selectedMember.id,
                            createdAt: selectedMember.createdAt,
                        }
                        : m
                )
            );
            addToast({
                title: "Colaborador atualizado",
                description: "O colaborador foi atualizado com sucesso!",
                color: "success",
            });
        } else {
            const newMember: Member = {
                id: Date.now().toString(),
                ...formData,
                createdAt: new Date().toISOString().split("T")[0],
            };
            setMembers([...members, newMember]);
            addToast({
                title: "Colaborador adicionado",
                description: "O colaborador foi adicionado com sucesso!",
                color: "success",
            });
        }

        handleClose();
    };

    const handleArchive = (id: string) => {
        setMembers(
            members.map((m) => (m.id === id ? { ...m, status: "archived" as Member["status"] } : m))
        );
        addToast({
            title: "Colaborador arquivado",
            description: "O colaborador foi arquivado com sucesso!",
            color: "success",
        });
    };

    const handleUnarchive = (id: string) => {
        setMembers(
            members.map((m) => (m.id === id ? { ...m, status: "active" as Member["status"] } : m))
        );
        addToast({
            title: "Colaborador desarquivado",
            description: "O colaborador foi desarquivado com sucesso!",
            color: "success",
        });
    };

    const filteredMembers = members.filter((member) => {
        const searchLower = search.toLowerCase();
        const matchesSearch =
            member.name.toLowerCase().includes(searchLower) ||
            member.email.toLowerCase().includes(searchLower) ||
            member.phone?.toLowerCase().includes(searchLower);

        const matchesTab = member.status === activeTab;

        return matchesSearch && matchesTab;
    });

    const handleSetSearchParams = (key: string, value: string) => {
        // In a real app we might update the URL or just local state
        // For this demo, we'll just log it or update local state if needed
        console.log(`Setting ${key} to ${value}`);
    };

    return (
        <div className="flex flex-col flex-1 h-full overflow-hidden">
            <div className="flex items-center justify-between p-6">
                <div>
                    <h1 className="text-3xl font-bold">Colaboradores</h1>
                    <p className="text-sm text-default-500 mt-1">
                        Gerencie os colaboradores e permissões de acesso ao sistema
                    </p>
                </div>
                <Button color="primary" startContent={<AddCircle size={20} weight="Outline" />} onPress={() => handleOpen()}>
                    Adicionar Colaborador
                </Button>
            </div>

            <Divider />

            <div className="flex items-center gap-4 px-6 py-3">
                <Input
                    placeholder="Buscar colaborador..."
                    startContent={<Magnifer size={18} weight="Outline" />}
                    className="max-w-xs"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <Tabs
                    aria-label="Filtrar colaboradores"
                    selectedKey={activeTab}
                    onSelectionChange={(key) => setActiveTab(key as "active" | "archived")}
                >
                    <Tab key="active" title="Ativos" />
                    <Tab key="archived" title="Arquivados" />
                </Tabs>

                <Select
                    label="Mostrar"
                    selectedKeys={[size as string]}
                    onSelectionChange={(keys) => handleSetSearchParams("size", Array.from(keys)[0] as string)}
                    className="max-w-40 ml-auto"
                    size="sm"
                >
                    <SelectItem key="10">10</SelectItem>
                    <SelectItem key="20">20</SelectItem>
                    <SelectItem key="50">50</SelectItem>
                    <SelectItem key="100">100</SelectItem>
                </Select>
            </div>

            <Divider />

            <ScrollArea className="flex flex-col grow h-0 overflow-y-auto">
                <div className="flex flex-col gap-4 p-6">
                    {filteredMembers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <UsersGroupRounded size={64} weight="Outline" className="text-default-300 mb-4" />
                            <p className="text-lg font-medium text-default-500">
                                Nenhum colaborador {activeTab === "active" ? "ativo" : "arquivado"} encontrado
                            </p>
                            <p className="text-sm text-default-400 mt-1">
                                {activeTab === "active"
                                    ? "Adicione um novo colaborador ou ajuste os filtros de busca"
                                    : "Não há colaboradores arquivados no momento"}
                            </p>
                        </div>
                    ) : (
                        filteredMembers.map((member) => (
                            <Card
                                key={member.id}
                                className="hover:bg-default-50 transition-colors"
                            >
                                <CardBody>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            <Avatar
                                                name={member.name}
                                                size="lg"
                                                className="bg-primary text-primary-foreground"
                                            />
                                            <div className="flex flex-col flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-lg">{member.name}</span>
                                                    <Chip size="sm" color={roleColors[member.role]} variant="flat">
                                                        {roleLabels[member.role]}
                                                    </Chip>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-sm text-default-500">
                                                        <Letter size={16} weight="Outline" />
                                                        <span>{member.email}</span>
                                                    </div>
                                                    {member.phone && (
                                                        <div className="flex items-center gap-2 text-sm text-default-500">
                                                            <Phone size={16} weight="Outline" />
                                                            <span>{member.phone}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2 text-xs text-default-400 mt-1">
                                                        <Calendar size={14} weight="Outline" />
                                                        <span>
                                                            Último acesso:{" "}
                                                            {member.lastAccess
                                                                ? new Date(member.lastAccess).toLocaleDateString("pt-BR")
                                                                : "Nunca"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Chip
                                                size="sm"
                                                color={member.status === "active" ? "success" : "default"}
                                                variant="flat"
                                            >
                                                {member.status === "active" ? "Ativo" : "Arquivado"}
                                            </Chip>
                                            <div onClick={(e) => e.stopPropagation()}>
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    variant="light"
                                                    onPress={() => navigate(`/${tenantId}/members/${member.id}/config`)}
                                                    title="Configurar"
                                                >
                                                    <Settings size={20} weight="Outline" />
                                                </Button>
                                            </div>
                                            {member.status === "active" ? (
                                                <div onClick={(e) => e.stopPropagation()}>
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        variant="light"
                                                        color="warning"
                                                        onPress={() => handleArchive(member.id)}
                                                        title="Arquivar"
                                                    >
                                                        <Archive size={20} weight="Outline" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div onClick={(e) => e.stopPropagation()}>
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        variant="light"
                                                        color="success"
                                                        onPress={() => handleUnarchive(member.id)}
                                                        title="Desarquivar"
                                                    >
                                                        <Restart size={20} weight="Outline" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        ))
                    )}
                </div>
            </ScrollArea>

            <Divider />

            <div className="flex justify-center px-6 py-3">
                <Pagination isCompact showControls initialPage={1} total={10} />
            </div>

            <Modal
                isOpen={isOpen}
                onOpenChange={handleClose}
                backdrop="blur"
                size="2xl"
                scrollBehavior="inside"
            >
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold">
                            {selectedMember ? "Editar Colaborador" : "Adicionar Colaborador"}
                        </h2>
                        <p className="text-sm text-default-500 font-normal">
                            {selectedMember
                                ? "Atualize as informações do colaborador"
                                : "Cadastre um novo colaborador no sistema"}
                        </p>
                    </ModalHeader>
                    <ModalBody>
                        <div className="flex flex-col gap-4">
                            <Input
                                label="Nome Completo"
                                placeholder="Digite o nome"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                isRequired
                            />
                            <Input
                                label="E-mail"
                                type="email"
                                placeholder="colaborador@exemplo.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                isRequired
                            />
                            <Input
                                label="Telefone"
                                placeholder="(11) 98765-4321"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <Select
                                    label="Cargo"
                                    selectedKeys={[formData.role]}
                                    onSelectionChange={(keys) => {
                                        const selected = Array.from(keys)[0] as string;
                                        setFormData({ ...formData, role: selected as Member["role"] });
                                    }}
                                    isRequired
                                >
                                    <SelectItem key="admin">Administrador</SelectItem>
                                    <SelectItem key="manager">Gerente</SelectItem>
                                    <SelectItem key="staff">Equipe</SelectItem>
                                    <SelectItem key="viewer">Visualizador</SelectItem>
                                </Select>
                                <Select
                                    label="Status"
                                    selectedKeys={[formData.status]}
                                    onSelectionChange={(keys) => {
                                        const selected = Array.from(keys)[0] as string;
                                        setFormData({ ...formData, status: selected as Member["status"] });
                                    }}
                                >
                                    <SelectItem key="active">Ativo</SelectItem>
                                    <SelectItem key="archived">Arquivado</SelectItem>
                                </Select>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={handleClose}>
                            Cancelar
                        </Button>
                        <Button color="primary" onPress={handleSave}>
                            {selectedMember ? "Atualizar" : "Adicionar"} Colaborador
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}
