
import { Avatar, Button, Card, CardBody, Chip, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Pagination, Select, SelectItem, Tab, Tabs, useDisclosure } from "@heroui/react";
import { toast } from "react-toastify";
import { AddCircle, Archive, Calendar, ChatRoundDots, Copy, Letter, Magnifer, Phone, Restart, Settings, TrashBinMinimalistic, UsersGroupRounded } from "@solar-icons/react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ScrollArea } from "../components/ui/scroll-area";

interface Member {
    id: string;
    name: string;
    email: string;
    role: "admin" | "manager" | "staff" | "viewer";
    status: "active" | "archived" | "invited";
    phone?: string;
    inviteLink?: string;
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
    {
        id: "9",
        name: "Novo Usuário",
        email: "novo.usuario@exemplo.com",
        role: "viewer",
        status: "invited",
        createdAt: "2024-12-21",
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
    const [selectedTab, setSelectedTab] = useState<"members" | "invites">("members");
    const [memberStatusFilter, setMemberStatusFilter] = useState<"active" | "archived">("active");
    const [size] = useState<"10" | "20" | "50" | "100">("10");

    // Invite Modal State
    const { isOpen: isInviteSuccessOpen, onOpen: onInviteSuccessOpen, onOpenChange: onInviteSuccessOpenChange } = useDisclosure();
    const [createdInvite, setCreatedInvite] = useState<{ link: string; phone?: string } | null>(null);

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
        if ((!formData.name.trim() || !formData.email.trim()) && formData.status !== "invited") {
            toast.error("Nome e e-mail são obrigatórios");
            return;
        }

        if (formData.status === "invited" && !formData.phone.trim()) {
            toast.error("Telefone é obrigatório para envio de convites");
            return;
        }

        // Logic to simulate invite
        if (!selectedMember && formData.status === "invited") {
            const uuid = crypto.randomUUID();
            const baseUrl = formData.role === "manager" ? "https://manager.zapfood.shop" : "https://waiter.zapfood.shop";
            const inviteLink = `${baseUrl}/${uuid}`;

            const newMember: Member = {
                id: Date.now().toString(),
                ...formData,
                inviteLink,
                createdAt: new Date().toISOString().split("T")[0],
            };
            setMembers([...members, newMember]);

            setCreatedInvite({
                link: inviteLink,
                phone: formData.phone
            });
            handleClose();
            onInviteSuccessOpen();
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
            toast.success("O colaborador foi atualizado com sucesso!");
        } else {
            const newMember: Member = {
                id: Date.now().toString(),
                ...formData,
                createdAt: new Date().toISOString().split("T")[0],
            };
            setMembers([...members, newMember]);
            toast.success("O colaborador foi adicionado com sucesso!");
        }

        handleClose();
    };

    const handleArchive = (id: string) => {
        setMembers(
            members.map((m) => (m.id === id ? { ...m, status: "archived" as Member["status"] } : m))
        );
        toast.success("O colaborador foi arquivado com sucesso!");
    };

    const handleUnarchive = (id: string) => {
        setMembers(
            members.map((m) => (m.id === id ? { ...m, status: "active" as Member["status"] } : m))
        );
        toast.success("O colaborador foi desarquivado com sucesso!");
    };

    const handleRevoke = (id: string) => {
        setMembers(members.filter((m) => m.id !== id));
        toast.success("Convite revogado com sucesso!");
    };

    const filteredMembers = members.filter((member) => {
        const searchLower = search.toLowerCase();
        const matchesSearch =
            member.name.toLowerCase().includes(searchLower) ||
            member.email.toLowerCase().includes(searchLower) ||
            member.phone?.toLowerCase().includes(searchLower);

        if (selectedTab === "members") {
            return matchesSearch && member.status === memberStatusFilter;
        } else {
            return matchesSearch && member.status === "invited";
        }
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
                </div>
                <div className="flex gap-2">
                    <Button color="primary" startContent={<AddCircle size={20} weight="Outline" />} onPress={() => handleOpen()}>
                        Novo Membro
                    </Button>
                    <Button variant="flat" color="primary" startContent={<Letter size={20} weight="Outline" />} onPress={() => {
                        setFormData({
                            name: "",
                            email: "",
                            phone: "",
                            role: "staff",
                            status: "invited",
                        });
                        onOpen();
                    }}>
                        Criar Convite
                    </Button>
                </div>
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
                    selectedKey={selectedTab}
                    onSelectionChange={(key) => setSelectedTab(key as "members" | "invites")}
                >
                    <Tab key="members" title="Membros" />
                    <Tab key="invites" title="Convites" />
                </Tabs>

                {selectedTab === "members" && (
                    <Select
                        selectedKeys={[memberStatusFilter]}
                        onSelectionChange={(keys) => setMemberStatusFilter(Array.from(keys)[0] as "active" | "archived")}
                        className="max-w-40"
                    >
                        <SelectItem key="active">Ativos</SelectItem>
                        <SelectItem key="archived">Arquivados</SelectItem>
                    </Select>
                )}

                <Select
                    selectedKeys={[size as string]}
                    onSelectionChange={(keys) => handleSetSearchParams("size", Array.from(keys)[0] as string)}
                    className="max-w-40 ml-auto"
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
                                Nenhum membro encontrado
                            </p>
                            <p className="text-sm text-default-400 mt-1">
                                {selectedTab === "members"
                                    ? "Adicione um novo colaborador ou ajuste os filtros de busca"
                                    : "Não há convites pendentes no momento"}
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
                                                    {member.status === "invited" && member.inviteLink ? (
                                                        <div className="flex flex-col gap-1 w-full max-w-md">
                                                            <div className="flex items-center gap-2 text-sm text-default-500">
                                                                <Phone size={16} weight="Outline" />
                                                                <span>{member.phone}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 bg-default-100 p-2 rounded-lg mt-1">
                                                                <code className="text-xs flex-1 truncate">{member.inviteLink}</code>
                                                                <Button
                                                                    isIconOnly
                                                                    size="sm"
                                                                    variant="light"
                                                                    onPress={() => {
                                                                        if (member.inviteLink) {
                                                                            navigator.clipboard.writeText(member.inviteLink);
                                                                            toast.success("Link copiado!");
                                                                        }
                                                                    }}
                                                                >
                                                                    <Copy size={16} />
                                                                </Button>
                                                            </div>

                                                        </div>
                                                    ) : (
                                                        <>
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
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Chip
                                                size="sm"
                                                color={member.status === "active" ? "success" : member.status === "invited" ? "warning" : "default"}
                                                variant="flat"
                                            >
                                                {member.status === "active" ? "Ativo" : member.status === "invited" ? "Pendente" : "Arquivado"}
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
                                            {member.status === "active" && (
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
                                            )}
                                            {member.status === "archived" && (
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
                                            {member.status === "invited" && (
                                                <div onClick={(e) => e.stopPropagation()}>
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        variant="light"
                                                        color="danger"
                                                        onPress={() => handleRevoke(member.id)}
                                                        title="Revogar"
                                                    >
                                                        <TrashBinMinimalistic size={20} weight="Outline" />
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
                            {formData.status !== "invited" && (
                                <>
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
                                </>
                            )}
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
                                {formData.status !== "invited" && (
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
                                )}
                            </div>
                            <Input
                                label="Telefone"
                                placeholder="(11) 98765-4321"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                isRequired={formData.status === "invited"}
                                description={formData.status === "invited" ? "Obrigatório. Usado para enviar o convite via WhatsApp." : undefined}
                            />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={handleClose}>
                            Cancelar
                        </Button>
                        <Button color="primary" onPress={handleSave}>
                            {selectedMember ? "Atualizar" : formData.status === "invited" ? "Enviar Convite" : "Adicionar"} Membro
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Invite Success Modal */}
            <Modal
                isOpen={isInviteSuccessOpen}
                onOpenChange={onInviteSuccessOpenChange}
                backdrop="blur"
                size="md"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <h2 className="text-2xl font-bold text-success">Convite Criado!</h2>
                                <p className="text-sm text-default-500 font-normal">
                                    O convite foi gerado com sucesso. Compartilhe o link abaixo.
                                </p>
                            </ModalHeader>
                            <ModalBody>
                                <div className="flex flex-col gap-4">
                                    <div className="p-4 bg-default-100 rounded-lg border border-default-200">
                                        <p className="text-xs text-default-500 mb-1 font-semibold uppercase">Link de Convite</p>
                                        <div className="flex items-center gap-2">
                                            <code className="text-sm flex-1 truncate">{createdInvite?.link}</code>
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                variant="light"
                                                onPress={() => {
                                                    if (createdInvite?.link) {
                                                        navigator.clipboard.writeText(createdInvite.link);
                                                        toast.success("Link copiado!");
                                                    }
                                                }}
                                            >
                                                <Copy size={16} />
                                            </Button>
                                        </div>
                                    </div>

                                    {createdInvite?.phone && (
                                        <Button
                                            color="success"
                                            className="text-white w-full"
                                            startContent={<ChatRoundDots size={24} weight="Bold" />}
                                            onPress={() => {
                                                if (createdInvite.phone) {
                                                    const text = `Olá! Aqui está seu convite para acessar o sistema: ${createdInvite.link}`;
                                                    const url = `https://wa.me/${createdInvite.phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
                                                    window.open(url, "_blank");
                                                }
                                            }}
                                        >
                                            Enviar no WhatsApp
                                        </Button>
                                    )}
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="primary" onPress={onClose}>
                                    Concluído
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
