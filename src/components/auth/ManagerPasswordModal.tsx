import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import { LockPassword } from "@solar-icons/react";
import { useState } from "react";
import { toast } from "react-toastify";

interface ManagerPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    title?: string;
    description?: string;
}

export function ManagerPasswordModal({
    isOpen,
    onClose,
    onSuccess,
    title = "Senha de Gerente",
    description = "Digite a senha de gerente para continuar."
}: ManagerPasswordModalProps) {
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);

    const handleSubmit = () => {
        // Mock validation - Replace with actual auth logic or API call
        if (password === "1234") {
            setError(false);
            setPassword("");
            onSuccess();
            onClose();
        } else {
            setError(true);
            toast.error("Senha incorreta");
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setPassword("");
            setError(false);
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={handleOpenChange}
            placement="center"
            backdrop="blur"
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1 items-center">
                            <div className="p-3 bg-primary/10 rounded-full mb-2">
                                <LockPassword size={32} className="text-primary" weight="Bold" />
                            </div>
                            <span className="text-xl">{title}</span>
                            <span className="text-sm font-normal text-default-500 text-center px-4">
                                {description}
                            </span>
                        </ModalHeader>
                        <ModalBody>
                            <Input
                                autoFocus
                                label="Senha"
                                placeholder="Digite a senha"
                                type="password"
                                variant="bordered"
                                value={password}
                                onValueChange={(val) => {
                                    setPassword(val);
                                    setError(false);
                                }}
                                isInvalid={error}
                                errorMessage={error ? "Senha incorreta" : ""}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleSubmit();
                                    }
                                }}
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="light" onPress={onClose}>
                                Cancelar
                            </Button>
                            <Button color="primary" onPress={handleSubmit}>
                                Confirmar
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
