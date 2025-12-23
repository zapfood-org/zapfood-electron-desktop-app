import { authClient } from "@/lib/auth-client";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Spinner,
  useDisclosure,
} from "@heroui/react";
import {
  Box,
  LinkRound,
  Logout3,
  Settings,
  Shop,
  TrashBinMinimalistic,
} from "@solar-icons/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useStoreStatus } from "../hooks/useStoreStatus";

type Role = "owner" | "admin" | "member";

export function CompaniesPage() {
  const navigate = useNavigate();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isInviteOpen, onOpenChange: onInviteOpenChange } =
    useDisclosure();

  // Auth Hooks
  const { data: session, refetch: refetchSession } = authClient.useSession();
  const {
    data: organizations,
    isPending: isLoadingOrgs,
    refetch: refetchOrgs,
  } = authClient.useListOrganizations();
  const { data: activeOrg, refetch: refetchActiveOrg } =
    authClient.useActiveOrganization();

  // Force refetch session and organizations when component mounts to ensure fresh data
  useEffect(() => {
    const loadData = async () => {
      try {
        await refetchSession();
        // Force refetch organizations to clear any cached data from previous account
        await refetchOrgs();
      } catch (error) {
        console.error("Error refetching data:", error);
      }
    };
    loadData();
  }, [refetchSession, refetchOrgs]);

  // Refetch organizations when session changes (e.g., after login/logout)
  useEffect(() => {
    if (session?.user?.id) {
      // When session is available, ensure organizations are fresh
      refetchOrgs();
    }
  }, [session?.user?.id, refetchOrgs]);

  // Check if user is owner/admin of active org (to show invites list)
  // Invites come in activeOrg.invitations
  const pendingInvitations = activeOrg?.invitations || [];

  // New company form state
  const [newCompany, setNewCompany] = useState({
    name: "",
    slug: "",
    description: "", // Will be stored in metadata
  });
  const [isCreating, setIsCreating] = useState(false);

  // Invite state
  const [selectedCompanyForInvite] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [inviteData, setInviteData] = useState<{
    email: string;
    phone: string;
    role: Role;
  }>({
    email: "",
    phone: "",
    role: "member",
  });
  const [isInviting, setIsInviting] = useState(false);

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
      const { error } = await authClient.organization.create({
        name: newCompany.name,
        slug: newCompany.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
        metadata: {
          description: newCompany.description,
        },
      });

      if (error) {
        toast.error(error.message || "Erro ao criar organização");
      } else {
        toast.success("Estabelecimento cadastrado com sucesso!");
        setNewCompany({ name: "", slug: "", description: "" });
        onOpenChange(); // Close modal
        refetchOrgs();
      }
    } catch (e: unknown) {
      console.error(e);
      toast.error("Erro inesperado ao criar organização");
    } finally {
      setIsCreating(false);
    }
  };

  const [switchingCompanyId, setSwitchingCompanyId] = useState<string | null>(
    null
  );

  const handleSelectCompany = async (companyId: string) => {
    // Se já é a empresa ativa, não fazer nada
    if (activeOrg?.id === companyId) {
      return;
    }

    setSwitchingCompanyId(companyId);
    try {
      const { error } = await authClient.organization.setActive({
        organizationId: companyId,
      });

      if (error) {
        toast.error(error.message || "Erro ao selecionar organização");
        setSwitchingCompanyId(null);
        return;
      }

      // Refetch para atualizar a empresa ativa
      await refetchActiveOrg();

      toast.success(
        `Trocado para ${
          organizations?.find((org) => org.id === companyId)?.name || "empresa"
        }`
      );
      navigate(`/${companyId}/dashboard`);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao definir organização ativa");
      setSwitchingCompanyId(null);
    } finally {
      // Limpar loading após um pequeno delay para permitir navegação
      setTimeout(() => setSwitchingCompanyId(null), 500);
    }
  };

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      // Force clear any cached session and organization data
      await authClient.getSession();
      // Clear organizations cache by refetching (will return empty after logout)
      await refetchOrgs();
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
      navigate("/login");
    }
  };

  // Mantido por enquanto apenas para compatibilidade com o modal de convites,
  // mas sem entrada direta a partir do card de empresas.

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await authClient.organization.cancelInvitation({
        invitationId,
      });
      if (error) {
        toast.error(error.message || "Erro ao cancelar convite");
      } else {
        toast.success("Convite cancelado com sucesso");
        refetchActiveOrg();
      }
    } catch (e) {
      console.error(e);
      toast.error("Erro ao cancelar convite");
    }
  };

  const handleSendInvite = async () => {
    if (!inviteData.email && !inviteData.phone) {
      toast.error("Informe um e-mail ou telefone");
      return;
    }

    setIsInviting(true);
    try {
      // Set active organization first
      if (!selectedCompanyForInvite) {
        toast.error("Empresa não selecionada");
        setIsInviting(false);
        return;
      }

      const { error: activeError } = await authClient.organization.setActive({
        organizationId: selectedCompanyForInvite.id,
      });

      if (activeError) {
        toast.error("Erro ao selecionar organização para convite");
        setIsInviting(false);
        return;
      }

      // Call custom endpoint using fetch
      const response = await fetch(
        "http://localhost:8080/api/v1/organization/custom-invite-member",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            role: inviteData.role,
            email: inviteData.email,
            phone: inviteData.phone,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erro ao enviar convite");
      }

      toast.success("Convite enviado com sucesso!");
      refetchActiveOrg();
      // Don't close modal immediately so user can see the new invite in the list?
      // Or close it. Let's keep it open to show the list?
      // For now, let's keep it open and clear form
      setInviteData({ email: "", phone: "", role: "member" });
    } catch (e: unknown) {
      console.error(e);
      const errorMessage =
        e instanceof Error ? e.message : "Erro ao enviar convite";
      toast.error(errorMessage);
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-default-100 dark:bg-default-10 overflow-y-auto">
      <div className="flex-1 p-8 max-w-5xl mx-auto w-full">
        {/* Header with User Info */}
        <div className="flex items-center justify-between mb-8 bg-background p-6 rounded-2xl shadow-sm border border-default-200">
          <div className="flex items-center gap-4">
            <Avatar
              src={session?.user?.image || undefined}
              name={session?.user?.name || session?.user?.email || "User"}
              size="lg"
              isBordered
              color="primary"
            />
            <div>
              <h1 className="text-2xl font-bold text-default-900">
                Olá,{" "}
                {session?.user?.name?.split(" ")[0] ||
                  session?.user?.email?.split("@")[0] ||
                  "Visitante"}
                !
              </h1>
              <p className="text-default-500 text-sm">
                {session?.user?.email || "Email não disponível"}
              </p>
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
              Novo Estabelecimento
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-default-900">
              Meus Estabelecimentos
            </h2>
            <p className="text-default-500 text-sm">
              Gerencie seus estabelecimentos
            </p>
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
            <h3 className="text-xl font-semibold text-default-700">
              Nenhum estabelecimento encontrado
            </h3>
            <p className="text-default-500 mt-2 text-center max-w-md">
              Você ainda não possui nenhum estabelecimento cadastrado. Clique no
              botão "Novo Estabelecimento" para começar.
            </p>
            <Button
              color="primary"
              variant="flat"
              className="mt-6"
              onPress={onOpen}
            >
              Cadastrar meu primeiro estabelecimento
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {organizations.map((org) => (
              <CompanyCard
                key={org.id}
                company={org}
                onSelect={handleSelectCompany}
                isActive={activeOrg?.id === org.id}
                isSwitching={switchingCompanyId === org.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de Cadastro */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Cadastrar Novo Estabelecimento
              </ModalHeader>
              <ModalBody>
                <Input
                  label="Nome do Estabelecimento"
                  placeholder="Ex: Pizzaria do João"
                  value={newCompany.name}
                  onValueChange={(val) => {
                    // Auto-generate slug from name if slug is empty, sanitize simple regex
                    const slug = !newCompany.slug
                      ? val
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, "-")
                          .replace(/-+/g, "-")
                      : newCompany.slug;
                    setNewCompany({
                      ...newCompany,
                      name: val,
                      slug: newCompany.slug ? newCompany.slug : slug,
                    });
                  }}
                  startContent={<Shop size={18} className="text-default-400" />}
                  isRequired
                />
                <Input
                  label="Identificador (Slug)"
                  placeholder="pizzaria-do-joao"
                  value={newCompany.slug}
                  onValueChange={(val) =>
                    setNewCompany({ ...newCompany, slug: val })
                  }
                  isRequired
                  description="Identificador único para URL (sem espaços ou caracteres especiais)."
                  startContent={
                    <span className="text-default-400 text-small">
                      zapfood.com/
                    </span>
                  }
                />
                <Input
                  label="Descrição"
                  placeholder="Uma breve descrição do seu negócio"
                  value={newCompany.description}
                  onValueChange={(val) =>
                    setNewCompany({ ...newCompany, description: val })
                  }
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  onPress={handleCreateCompany}
                  isLoading={isCreating}
                >
                  Cadastrar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal de Convite */}
      <Modal
        isOpen={isInviteOpen}
        onOpenChange={onInviteOpenChange}
        backdrop="blur"
        placement="center"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Convidar Membro
                <span className="text-sm font-normal text-default-500">
                  {selectedCompanyForInvite?.name}
                </span>
              </ModalHeader>
              <ModalBody>
                <Input
                  label="E-mail"
                  type="email"
                  placeholder="colaborador@exemplo.com"
                  value={inviteData.email}
                  onValueChange={(val) =>
                    setInviteData({ ...inviteData, email: val })
                  }
                />
                <Input
                  label="Telefone"
                  placeholder="(99) 99999-9999"
                  value={inviteData.phone}
                  onValueChange={(val) =>
                    setInviteData({ ...inviteData, phone: val })
                  }
                />
                <Select
                  label="Cargo"
                  selectedKeys={[inviteData.role]}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setInviteData({ ...inviteData, role: selected as Role });
                  }}
                  isRequired
                >
                  <SelectItem key="owner">Proprietário (Owner)</SelectItem>
                  <SelectItem key="admin">Administrador (Admin)</SelectItem>
                  <SelectItem key="member">Membro (Member)</SelectItem>
                </Select>

                {pendingInvitations.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold text-default-500 mb-2">
                      Convites Pendentes
                    </h3>
                    <div className="flex flex-col gap-2">
                      {pendingInvitations.map((inv) => (
                        <div
                          key={inv.id}
                          className="flex items-center justify-between p-3 rounded-medium bg-content2 border border-default-100 hover:bg-content3 transition-colors"
                        >
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">
                              {inv.email || "Sem email"}
                            </span>
                            <div className="flex items-center gap-2 text-xs text-default-400">
                              <Chip
                                size="sm"
                                variant="flat"
                                color="primary"
                                className="h-5 text-[10px] px-1"
                              >
                                {inv.role}
                              </Chip>
                              {inv.status === "accepted" && (
                                <Chip
                                  size="sm"
                                  variant="flat"
                                  color="success"
                                  className="h-5 text-[10px] px-1"
                                >
                                  Aceito
                                </Chip>
                              )}
                              <span>
                                Expira em{" "}
                                {new Date(inv.expiresAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          {inv.status !== "accepted" && (
                            <Button
                              isIconOnly
                              size="sm"
                              color="danger"
                              variant="light"
                              onPress={() => handleCancelInvitation(inv.id)}
                            >
                              <TrashBinMinimalistic size={18} />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  onPress={handleSendInvite}
                  isLoading={isInviting}
                >
                  Enviar Convite
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

function CompanyCard({
  company,
  onSelect,
  isActive = false,
  isSwitching = false,
}: {
  company: {
    id: string;
    name: string;
    slug: string;
    logo?: string | null;
    metadata?: { description?: string } | null;
  };
  onSelect: (id: string) => void;
  isActive?: boolean;
  isSwitching?: boolean;
}) {
  // Note: useStoreStatus logic might need update if it depends on local ID.
  // Assuming it works or returns default for now.
  const { isOpen } = useStoreStatus(company.id);

  return (
    <Card
      isPressable
      onPress={() => !isSwitching && onSelect(company.id)}
      className={`
                transition-all duration-200
                ${
                  isActive
                    ? "ring-2 ring-primary shadow-lg shadow-primary/20"
                    : ""
                }
                ${isSwitching ? "opacity-60 cursor-wait" : ""}
                hover:bg-default-50
            `}
    >
      <CardBody className="p-4">
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 ${
              isActive ? "bg-primary text-white" : "bg-primary/10 text-primary"
            }`}
          >
            {company.logo ? (
              <img
                src={company.logo}
                alt={company.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <Shop size={28} weight="Bold" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3
                className={`text-lg font-bold truncate ${
                  isActive ? "text-primary" : "text-default-900"
                }`}
              >
                {company.name}
                {isActive && <span className="ml-2 text-xs">✓</span>}
              </h3>
            </div>
            <p className="text-xs text-default-500 font-mono mb-1">
              @{company.slug}
            </p>
            {company.metadata?.description && (
              <p className="text-sm text-default-400 line-clamp-1">
                {company.metadata.description}
              </p>
            )}
          </div>
          <div className="flex gap-2 items-center flex-shrink-0">
            <div onClick={(e) => e.stopPropagation()}>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={() =>
                  window.open(`https://zapfood.shop/${company.slug}`, "_blank")
                }
                title={`Visitar ${company.name}`}
                isDisabled={isSwitching}
              >
                <LinkRound size={20} className="text-default-500" />
              </Button>
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={() =>
                  !isSwitching &&
                  window.open(`#/companies/settings/${company.id}`, "_self")
                }
                title="Configurações"
                isDisabled={isSwitching}
              >
                <Settings size={20} className="text-default-500" />
              </Button>
            </div>
            {isSwitching ? (
              <Spinner size="sm" />
            ) : (
              <>
                <Chip
                  size="sm"
                  color={isOpen ? "success" : "danger"}
                  variant="dot"
                  className="border-0"
                >
                  {isOpen ? "Aberto" : "Fechado"}
                </Chip>
                {isActive && (
                  <Chip
                    size="sm"
                    color="primary"
                    variant="flat"
                    className="border-0"
                  >
                    Ativa
                  </Chip>
                )}
              </>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
