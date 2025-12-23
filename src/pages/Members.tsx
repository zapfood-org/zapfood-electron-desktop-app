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
  Filter,
  Letter,
  Magnifer,
  PenNewRound,
  TrashBinMinimalistic,
  UsersGroupRounded,
} from "@solar-icons/react";
import { useState } from "react";
import { toast } from "react-toastify";

import { authClient } from "@/lib/auth-client";

type Role = "owner" | "admin" | "member";

interface MemberUser {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface Member {
  id: string;
  role: Role;
  user: MemberUser;
  createdAt: string | Date;
}

type InvitationStatus = "pending" | "accepted" | "canceled";

interface Invitation {
  id: string;
  email: string | null;
  role: Role;
  status: InvitationStatus;
  expiresAt: string | Date;
}

export function MembersPage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const {
    data: organization,
    isPending,
    refetch,
  } = authClient.useActiveOrganization();

  const invitations: Invitation[] = (organization?.invitations ??
    []) as unknown as Invitation[];
  const members: Member[] = (organization?.members ??
    []) as unknown as Member[];

  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [formData, setFormData] = useState<{ email: string; role: Role }>({
    email: "",
    role: "member",
  });

  const [search, setSearch] = useState("");
  const [selectedTab, setSelectedTab] = useState<"members" | "invites">(
    "members"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Set<InvitationStatus>>(
    new Set<InvitationStatus>(["pending", "accepted"])
  );
  const [selectedRoles, setSelectedRoles] = useState<Set<Role>>(
    new Set<Role>(["owner", "admin", "member"])
  );

  const selectedStatusValue = Array.from(selectedStatus)
    .join(", ")
    .replaceAll("_", " ");
  const selectedRoleValue = Array.from(selectedRoles)
    .join(", ")
    .replaceAll("_", " ");

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
        role: "member",
      });
    }
    onOpen();
  };

  const handleClose = () => {
    setSelectedMember(null);
    setFormData({
      email: "",
      role: "member",
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
        const { error } = await authClient.organization.updateMemberRole({
          memberId: selectedMember.id,
          role: formData.role,
        });

        if (error) {
          toast.error(error.message || "Erro ao atualizar permissão");
        } else {
          toast.success("Permissão atualizada com sucesso!");
          refetch();
          handleClose();
        }
      } else {
        // Invite Member
        const { error } = await authClient.organization.inviteMember({
          email: formData.email,
          role: formData.role,
        });

        if (error) {
          toast.error(error.message || "Erro ao enviar convite");
        } else {
          toast.success("Convite enviado com sucesso!");
          refetch();
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
          const { error } = await authClient.organization.removeMember({
            memberIdOrEmail: memberId,
          });
          if (error) {
            toast.error(error.message || "Erro ao remover membro");
          } else {
            toast.success("Membro removido com sucesso");
            refetch();
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
          const { error } = await authClient.organization.cancelInvitation({
            invitationId,
          });
          if (error) {
            toast.error(error.message || "Erro ao cancelar convite");
          } else {
            toast.success("Convite cancelado com sucesso");
            refetch();
          }
        } catch (e) {
          console.error(e);
          toast.error("Erro ao cancelar convite");
        }
      }
    );
  };

  // Filter Logic
  const filteredMembers = members.filter(
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

  const roleColors: Record<Role, "danger" | "warning" | "primary"> = {
    owner: "danger",
    admin: "warning",
    member: "primary",
  };

  const roleLabels: Record<Role, string> = {
    owner: "Proprietário",
    admin: "Administrador",
    member: "Membro",
  };

  // Duplicate maps for invitation table scope or move outside if preferred, keeping simple here
  const invitationRoleColors = roleColors;
  const invitationRoleLabels = roleLabels;

  return (
    <div className="flex flex-col h-full w-full overflow-y-auto">
      <div className="flex-1 p-8 max-w-7xl mx-auto w-full flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Colaboradores</h1>
          </div>
          <div className="flex gap-2">
            <Button
              color="primary"
              startContent={<AddCircle size={20} weight="Outline" />}
              onPress={() => handleOpen()}
            >
              Convidar Membro
            </Button>
          </div>
        </div>

        <Divider />

        <div className="flex items-center gap-4">
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
              onSelectionChange={(keys) => setSelectedRoles(keys as Set<Role>)}
            >
              <DropdownItem key="owner">Proprietário</DropdownItem>
              <DropdownItem key="admin">Administrador</DropdownItem>
              <DropdownItem key="member">Membro</DropdownItem>
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
        </div>

        <Divider />

        <div className="flex flex-col flex-1 justify-center items-center">
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
            <div className="flex flex-col items-center justify-center py-12 text-center">
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
                base: "flex flex-col flex-grow h-0 overflow-y-auto p-6",
                table: "min-h-0",
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
                base: "flex flex-col flex-grow h-0 overflow-y-auto p-6",
                table: "min-h-0",
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
                            {new Date(invitation.expiresAt).toLocaleDateString(
                              "pt-BR"
                            )}
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

        <div className="flex justify-center px-6 py-3 border-t border-divider">
          <Pagination
            isCompact
            showControls
            initialPage={1}
            total={1}
            isDisabled
          />
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
                  <SelectItem key="owner">Proprietário (Owner)</SelectItem>
                  <SelectItem key="admin">Administrador (Admin)</SelectItem>
                  <SelectItem key="member">Membro (Member)</SelectItem>
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
