import {
  Avatar,
  Button,
  Chip,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Select,
  SelectItem,
  Spinner,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tabs,
  useDisclosure,
} from "@heroui/react";
import {
  AddCircle,
  Calendar,
  CheckCircle,
  Copy,
  Filter,
  Letter,
  Magnifer,
  PenNewRound,
  TrashBinMinimalistic,
  UsersGroupRounded,
} from "@solar-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { toast } from "react-toastify";

import { AUTH_URL } from "@/config/api";
import { useActiveOrganization } from "../hooks/useActiveOrganization";
import type { Invitation } from "../hooks/useInvitations";
import { useInvitations } from "../hooks/useInvitations";
import type { Member } from "../hooks/useMembers";
import { useMembers } from "../hooks/useMembers";

type Role = "owner" | "manager" | "waiter" | "cashier";
type InvitationStatus = "pending" | "accepted" | "canceled";

// Types are now imported from hooks

export function MembersPage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const { data: activeOrg } = useActiveOrganization();
  const {
    data: invitations,
    isPending: isInvitationsPending,
    refetch: refetchInvitations,
  } = useInvitations(activeOrg?.id);
  const {
    data: members,
    isPending: isMembersPending,
    refetch: refetchMembers,
  } = useMembers(activeOrg?.id);

  const isPending = isInvitationsPending || isMembersPending;

  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [formData, setFormData] = useState<{ email: string; role: Role }>({
    email: "",
    role: "waiter",
  });

  const [search, setSearch] = useState("");
  const [selectedTab, setSelectedTab] = useState<"members" | "invites">(
    "members"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Set<InvitationStatus>>(
    new Set<InvitationStatus>(["pending", "accepted", "canceled"])
  );
  const [selectedRoles, setSelectedRoles] = useState<Set<Role>>(
    new Set<Role>(["owner", "manager", "waiter", "cashier"])
  );
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null);

  const roleLabels: Record<Role, string> = {
    owner: "Proprietário",
    manager: "Gerente",
    waiter: "Garçom",
    cashier: "Caixa",
  };

  const statusLabels: Record<InvitationStatus, string> = {
    pending: "Pendente",
    accepted: "Aceito",
    canceled: "Cancelado",
  };

  const selectedStatusValue = Array.from(selectedStatus)
    .map((status) => statusLabels[status])
    .join(", ");
  const selectedRoleValue = Array.from(selectedRoles)
    .map((role) => roleLabels[role])
    .join(", ");

  // Confirmation Modal State
  const {
    isOpen: isConfirmOpen,
    onOpen: onConfirmOpen,
    onOpenChange: onConfirmOpenChange,
  } = useDisclosure();
  const [confirmAction, setConfirmAction] = useState<() => Promise<void>>(
    async () => {}
  );
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);

  const openConfirmModal = (
    title: string,
    message: string,
    action: () => Promise<void>
  ) => {
    setConfirmTitle(title);
    setConfirmMessage(message);
    setConfirmAction(() => action);
    onConfirmOpen();
  };

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await confirmAction();
      onConfirmOpenChange();
    } catch (error) {
      console.error(error);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleOpen = (member?: Member) => {
    if (member) {
      setSelectedMember(member);
      setFormData({
        email: member.user.email,
        role: member.role as Role,
      });
    } else {
      setSelectedMember(null);
      setFormData({
        email: "",
        role: "waiter",
      });
    }
    onOpen();
  };

  const handleClose = () => {
    setSelectedMember(null);
    setFormData({
      email: "",
      role: "waiter",
    });
    onOpenChange();
  };

  const handleSave = async () => {
    if (!formData.email.trim()) {
      toast.error("E-mail é obrigatório");
      return;
    }

    setIsSubmitting(true);
    try {
      if (selectedMember) {
        // Update Role
        const response = await fetch(
          `${AUTH_URL}/organization/update-member-role`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Origin: "https://zapfood.shop",
            },
            body: JSON.stringify({
              memberId: selectedMember.id,
              role: formData.role,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok || data.error) {
          toast.error(
            data.message || data.error?.message || "Erro ao atualizar permissão"
          );
        } else {
          toast.success("Permissão atualizada com sucesso!");
          refetchMembers();
          handleClose();
        }
      } else {
        // Invite Member
        const response = await fetch(`${AUTH_URL}/organization/invite-member`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Origin: "https://zapfood.shop",
          },
          body: JSON.stringify({
            email: formData.email,
            role: formData.role,
            teamId: activeOrg?.id || "",
          }),
        });

        const data = await response.json();

        if (!response.ok || data.error) {
          toast.error(
            data.message || data.error?.message || "Erro ao enviar convite"
          );
        } else {
          toast.success("Convite enviado com sucesso!");
          refetchInvitations();
          refetchMembers();
          handleClose();
        }
      }
    } catch (e: unknown) {
      console.error(e);
      toast.error("Erro inesperado");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = (memberId: string) => {
    openConfirmModal(
      "Remover Membro",
      "Tem certeza que deseja remover este membro? Essa ação não pode ser desfeita.",
      async () => {
        try {
          const response = await fetch(
            `${AUTH_URL}/organization/remove-member`,
            {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
                Origin: "https://zapfood.shop",
              },
              body: JSON.stringify({
                memberIdOrEmail: memberId,
              }),
            }
          );

          const data = await response.json();

          if (!response.ok || data.error) {
            toast.error(
              data.message || data.error?.message || "Erro ao remover membro"
            );
          } else {
            toast.success("Membro removido com sucesso");
            refetchMembers();
          }
        } catch (e) {
          console.error(e);
          toast.error("Erro ao remover membro");
        }
      }
    );
  };

  const handleCancelInvitation = (invitationId: string) => {
    openConfirmModal(
      "Cancelar Convite",
      "Tem certeza que deseja cancelar este convite?",
      async () => {
        try {
          const response = await fetch(
            `${AUTH_URL}/organization/cancel-invitation`,
            {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
                Origin: "https://zapfood.shop",
              },
              body: JSON.stringify({
                invitationId,
              }),
            }
          );

          const data = await response.json();

          if (!response.ok || data.error) {
            toast.error(
              data.message || data.error?.message || "Erro ao cancelar convite"
            );
          } else {
            toast.success("Convite cancelado com sucesso");
            refetchInvitations();
          }
        } catch (e) {
          console.error(e);
          toast.error("Erro ao cancelar convite");
        }
      }
    );
  };

  const handleCopyInviteLink = (invitation: Invitation) => {
    const domain =
      invitation.role === "waiter"
        ? "https://waiter.zapfood.shop"
        : "https://manager.zapfood.shop";
    const inviteLink = `${domain}/${invitation.id}`;

    navigator.clipboard.writeText(inviteLink);
    toast.success("Link de convite copiado!");
    setCopiedInviteId(invitation.id);

    setTimeout(() => {
      setCopiedInviteId(null);
    }, 2000);
  };

  // Filter Logic
  const filteredMembers = (members || []).filter(
    (m: Member) =>
      (m.user.name?.toLowerCase().includes(search.toLowerCase()) ||
        m.user.email?.toLowerCase().includes(search.toLowerCase())) &&
      selectedRoles.has(m.role)
  );

  const filteredInvitations = (invitations || [])
    .filter((i: Invitation) =>
      (i.email || "Sem email").toLowerCase().includes(search.toLowerCase())
    )
    .filter((i: Invitation) => selectedStatus.has(i.status))
    .filter((i: Invitation) => selectedRoles.has(i.role));

  const roleColors: Record<
    Role,
    "danger" | "warning" | "primary" | "secondary"
  > = {
    owner: "danger",
    manager: "warning",
    waiter: "primary",
    cashier: "secondary",
  };

  // Duplicate maps for invitation table scope or move outside if preferred, keeping simple here
  const invitationRoleColors = roleColors;
  const invitationRoleLabels = roleLabels;

  return (
    <div className="flex flex-col h-full w-full overflow-y-auto bg-default-100 dark:bg-default-10 ">
      <div className="flex-1 flex flex-col">
        <div className="flex flex-col flex-1 overflow-hidden bg-background">
          <div className="flex items-center gap-4 py-3 max-w-7xl mx-auto w-full">
            <Input
              placeholder="Buscar..."
              startContent={<Magnifer size={18} weight="Outline" />}
              className="max-w-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Tabs
              aria-label="Filtrar colaboradores"
              selectedKey={selectedTab}
              onSelectionChange={(key) =>
                setSelectedTab(key as "members" | "invites")
              }
            >
              <Tab key="members" title={`Membros (${members.length})`} />
              <Tab
                key="invites"
                title={`Convites (${invitations?.length || 0})`}
              />
            </Tabs>

            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="bordered"
                  startContent={<Filter size={16} />}
                  className="capitalize"
                >
                  {selectedRoleValue || "Filtrar Cargo"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Filtrar por cargo"
                closeOnSelect={false}
                selectedKeys={selectedRoles}
                selectionMode="multiple"
                variant="flat"
                onSelectionChange={(keys) =>
                  setSelectedRoles(keys as Set<Role>)
                }
              >
                <DropdownItem key="owner">Proprietário</DropdownItem>
                <DropdownItem key="manager">Gerente</DropdownItem>
                <DropdownItem key="waiter">Garçom</DropdownItem>
                <DropdownItem key="cashier">Caixa</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            {selectedTab === "invites" && (
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    variant="bordered"
                    startContent={<Filter size={16} />}
                    className="capitalize"
                  >
                    {selectedStatusValue || "Filtrar Status"}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  disallowEmptySelection
                  aria-label="Filtrar por status"
                  closeOnSelect={false}
                  selectedKeys={selectedStatus}
                  selectionMode="multiple"
                  variant="flat"
                  onSelectionChange={(keys) =>
                    setSelectedStatus(keys as Set<InvitationStatus>)
                  }
                >
                  <DropdownItem key="pending">Pendente</DropdownItem>
                  <DropdownItem key="accepted">Aceito</DropdownItem>
                  <DropdownItem key="canceled">Cancelado</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            )}
            <Button
              color="primary"
              startContent={<AddCircle size={20} weight="Outline" />}
              onPress={() => handleOpen()}
              className="ml-auto"
            >
              Convidar Membro
            </Button>
          </div>

          <Divider />
          <div className="flex flex-1 flex-col bg-default-100 dark:bg-default-10">
            {(isPending && selectedTab === "members") ||
            (isPending && selectedTab === "invites") ? (
              <div className="flex justify-center p-10">
                <Spinner />
              </div>
            ) : (
                selectedTab === "members"
                  ? filteredMembers.length === 0
                  : filteredInvitations.length === 0
              ) ? (
              <div className="flex flex-col flex-1 items-center justify-center py-12 text-center">
                <UsersGroupRounded
                  size={64}
                  weight="Outline"
                  className="text-default-300 mb-4"
                />
                <p className="text-lg font-medium text-default-500">
                  Nenhum registro encontrado {search && `para "${search}"`}
                </p>
              </div>
            ) : selectedTab === "members" ? (
              <Table
                aria-label="Tabela de Membros"
                isHeaderSticky
                classNames={{
                  base: "flex flex-col flex-grow h-0 overflow-y-auto py-3",
                  table: "min-h-0 max-w-7xl mx-auto w-full",
                  wrapper:
                    "flex flex-col flex-grow h-0 overflow-y-auto py-3 max-w-7xl mx-auto w-full",
                }}
              >
                <TableHeader>
                  <TableColumn>MEMBRO</TableColumn>
                  <TableColumn>CARGO</TableColumn>
                  <TableColumn>ENTROU EM</TableColumn>
                  <TableColumn align="end">AÇÕES</TableColumn>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={member.user.image}
                            name={member.user.name}
                            size="sm"
                            className="bg-primary text-primary-foreground"
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold">
                              {member.user.name}
                            </span>
                            <span className="text-xs text-default-500">
                              {member.user.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="sm"
                          color={roleColors[member.role] || "default"}
                          variant="flat"
                        >
                          {roleLabels[member.role] || member.role}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-default-500">
                          <Calendar size={14} weight="Outline" />
                          <span>
                            {new Date(member.createdAt).toLocaleDateString(
                              "pt-BR"
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={() => handleOpen(member)}
                            title="Editar Permissão"
                          >
                            <PenNewRound size={18} weight="Outline" />
                          </Button>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="danger"
                            onPress={() => handleRemoveMember(member.id)}
                            title="Remover Membro"
                          >
                            <TrashBinMinimalistic size={18} weight="Outline" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Table
                aria-label="Tabela de Convites"
                isHeaderSticky
                classNames={{
                  base: "flex flex-col flex-grow h-0 overflow-y-auto py-3",
                  table: "min-h-0 max-w-7xl mx-auto w-full",
                  wrapper:
                    "flex flex-col flex-grow h-0 overflow-y-auto py-3 max-w-7xl mx-auto w-full",
                }}
              >
                <TableHeader>
                  <TableColumn>EMAIL / LINK</TableColumn>
                  <TableColumn>CARGO</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>EXPIRA EM</TableColumn>
                  <TableColumn align="end">AÇÕES</TableColumn>
                </TableHeader>
                <TableBody>
                  {filteredInvitations.map((invitation) => {
                    const isCanceled = invitation.status === "canceled";
                    const isAccepted = invitation.status === "accepted";
                    let statusColor: "default" | "warning" | "success" =
                      "warning";
                    let statusLabel = "Pendente";

                    if (isCanceled) {
                      statusColor = "default";
                      statusLabel = "Cancelado";
                    } else if (isAccepted) {
                      statusColor = "success";
                      statusLabel = "Aceito";
                    }

                    return (
                      <TableRow
                        key={invitation.id}
                        className={isCanceled ? "opacity-60" : ""}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Letter
                              size={16}
                              weight="Outline"
                              className="text-default-400"
                            />
                            <span
                              className={`text-sm ${
                                isCanceled
                                  ? "line-through text-default-400"
                                  : "font-medium"
                              }`}
                            >
                              {invitation.email || "Link de Convite"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="sm"
                            color={
                              invitationRoleColors[invitation.role] || "default"
                            }
                            variant="flat"
                          >
                            {invitationRoleLabels[invitation.role] ||
                              invitation.role}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <Chip size="sm" color={statusColor} variant="dot">
                            {statusLabel}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-default-500">
                            <Calendar size={14} weight="Outline" />
                            <span>
                              {new Date(
                                invitation.expiresAt
                              ).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            {!isCanceled && !isAccepted && (
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                onPress={() => handleCopyInviteLink(invitation)}
                                title="Copiar Link de Convite"
                                color={
                                  copiedInviteId === invitation.id
                                    ? "success"
                                    : "default"
                                }
                                className="relative overflow-visible"
                              >
                                <AnimatePresence mode="wait">
                                  {copiedInviteId === invitation.id ? (
                                    <motion.div
                                      key="check"
                                      initial={{ opacity: 0, scale: 0.5 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.5 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <CheckCircle size={18} weight="Bold" />
                                    </motion.div>
                                  ) : (
                                    <motion.div
                                      key="copy"
                                      initial={{ opacity: 0, scale: 0.5 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.5 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <Copy size={18} weight="Outline" />
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </Button>
                            )}
                            {!isCanceled && !isAccepted && (
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                color="danger"
                                onPress={() =>
                                  handleCancelInvitation(invitation.id)
                                }
                                title="Cancelar Convite"
                              >
                                <TrashBinMinimalistic
                                  size={18}
                                  weight="Outline"
                                />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>

          <Divider />

          <div className="flex justify-center items-center py-3">
            <Pagination
              isCompact
              showControls
              initialPage={1}
              total={1}
              isDisabled
            />
          </div>
        </div>

        <Modal isOpen={isOpen} onOpenChange={handleClose} backdrop="blur">
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold">
                {selectedMember ? "Editar Permissão" : "Convidar Membro"}
              </h2>
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4">
                {!selectedMember && (
                  <Input
                    label="E-mail"
                    type="email"
                    placeholder="colaborador@exemplo.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    isRequired
                  />
                )}
                <Select
                  label="Cargo"
                  selectedKeys={[formData.role]}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setFormData({ ...formData, role: selected as Role });
                  }}
                  isRequired
                >
                  <SelectItem key="owner">Proprietário</SelectItem>
                  <SelectItem key="manager">Gerente</SelectItem>
                  <SelectItem key="waiter">Garçom</SelectItem>
                  <SelectItem key="cashier">Caixa</SelectItem>
                </Select>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={handleClose}>
                Cancelar
              </Button>
              <Button
                color="primary"
                onPress={handleSave}
                isLoading={isSubmitting}
              >
                {selectedMember ? "Atualizar" : "Enviar Convite"}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Confirmation Modal */}
        <Modal
          isOpen={isConfirmOpen}
          onOpenChange={onConfirmOpenChange}
          backdrop="blur"
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  {confirmTitle}
                </ModalHeader>
                <ModalBody>
                  <p>{confirmMessage}</p>
                </ModalBody>
                <ModalFooter>
                  <Button variant="light" onPress={onClose}>
                    Cancelar
                  </Button>
                  <Button
                    color="danger"
                    onPress={handleConfirm}
                    isLoading={isConfirming}
                  >
                    Confirmar
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
}
