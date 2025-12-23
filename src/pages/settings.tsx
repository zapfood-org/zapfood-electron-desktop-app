import { authClient } from "@/lib/auth-client";
import { Button, Card, CardBody, CardHeader, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@heroui/react";
import { TrashBinTrash } from "@solar-icons/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export function SettingsPage() {
    const navigate = useNavigate();
    const { data: activeOrg } = authClient.useActiveOrganization();
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const [confirmSlug, setConfirmSlug] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteCompany = async () => {
        if (confirmSlug !== activeOrg?.slug) {
            toast.error("O identificador digitado não corresponde.");
            return;
        }

        setIsDeleting(true);
        try {
            const { error } = await authClient.organization.delete({
                organizationId: activeOrg.id
            });

            if (error) {
                toast.error(error.message || "Erro ao desativar empresa");
            } else {
                toast.success("Empresa desativada com sucesso");
                navigate("/companies"); // Redirect to companies list
            }
        } catch (e: unknown) {
            console.error(e);
            toast.error("Erro inesperado ao desativar empresa");
        } finally {
            setIsDeleting(false);
            onOpenChange(); // Close modal
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-default-100 dark:bg-default-10 overflow-y-auto">
            <div className="flex-1 p-8 max-w-4xl mx-auto w-full flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-default-900">Configurações</h1>
                    <p className="text-default-500 text-sm">Gerencie as informações e preferências da sua empresa</p>
                </div>

                <Card className="shadow-sm">
                    <CardHeader className="pb-0">
                        <h2 className="text-lg font-semibold">Informações Gerais</h2>
                    </CardHeader>
                    <CardBody className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Nome da Empresa" placeholder="Digite o nome" defaultValue={activeOrg?.name} />
                            <Input label="Identificador (Slug)" isDisabled defaultValue={activeOrg?.slug} description="O identificador não pode ser alterado." />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Email" type="email" placeholder="email@exemplo.com" />
                            <Input label="Telefone" placeholder="(11) 98765-4321" />
                        </div>
                        <div className="flex justify-end mt-2">
                            <Button color="primary">Salvar Alterações</Button>
                        </div>
                    </CardBody>
                </Card>

                {/* Others settings placeholders could go here */}

                {/* Danger Zone */}
                <Card className="border-danger-200 dark:border-danger-500/50 border-2 shadow-sm bg-danger-50/30 dark:bg-danger-950/40">
                    <CardHeader className="flex flex-col items-start gap-1 pb-2">
                        <h2 className="text-lg font-semibold text-danger-600 dark:text-danger-400">Zona de Perigo</h2>
                        <p className="text-sm text-default-600 dark:text-default-400">
                            Ações nesta área são irreversíveis. Tenha cuidado.
                        </p>
                    </CardHeader>
                    <CardBody>
                        <div className="flex flex-col md:flex-row items-center justify-between p-5 bg-danger-100/50 dark:bg-danger-100/0 rounded-lg gap-4 border border-danger-200/50 dark:border-danger-500/40">
                            <div className="flex-1">
                                <h3 className="font-semibold text-danger-700 dark:text-danger-400 mb-1">Desativar Empresa</h3>
                                <p className="text-sm text-danger-600/90 dark:text-danger-300/90">
                                    Isso irá excluir permanentemente sua empresa e todos os dados associados.
                                </p>
                            </div>
                            <Button
                                color="danger"
                                variant="flat"
                                className="text-white"
                                startContent={<TrashBinTrash size={20} />}
                                onPress={() => {
                                    setConfirmSlug("");
                                    onOpen();
                                }}
                            >
                                Desativar Empresa
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Confirmation Modal */}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 text-danger">Desativar Empresa?</ModalHeader>
                            <ModalBody>
                                <p className="text-sm">
                                    Esta ação <strong>não pode ser desfeita</strong>. Isso excluirá permanentemente a empresa
                                    <strong className="mx-1">{activeOrg?.name}</strong>
                                    e removerá todos os dados associados.
                                </p>
                                <p className="text-sm mt-2">
                                    Por favor, digite <strong>{activeOrg?.slug}</strong> para confirmar.
                                </p>
                                <Input
                                    placeholder={activeOrg?.slug}
                                    value={confirmSlug}
                                    onValueChange={setConfirmSlug}
                                    classNames={{
                                        inputWrapper: "border-danger focus-within:border-danger"
                                    }}
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>
                                    Cancelar
                                </Button>
                                <Button
                                    color="danger"
                                    onPress={handleDeleteCompany}
                                    isLoading={isDeleting}
                                    isDisabled={confirmSlug !== activeOrg?.slug}
                                >
                                    Excluir permanentemente
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
