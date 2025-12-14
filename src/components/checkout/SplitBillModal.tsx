
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Tab, Tabs } from "@heroui/react";
import { UsersGroupRounded, TeaCup } from "@solar-icons/react";
import { useState } from "react";

interface SplitBillModalProps {
    isOpen: boolean;
    onClose: () => void;
    total: number;
    onSplit: (amount: number, type: "people" | "items") => void;
}

export function SplitBillModal({ isOpen, onClose, total, onSplit }: SplitBillModalProps) {
    const [splitType, setSplitType] = useState<"people" | "items">("people");
    const [peopleCount, setPeopleCount] = useState(2);

    // Mock for item splitting - in a real scenario this would take the order items
    // For now we just focus on the people split logic which is the most common

    const amountPerPerson = total / peopleCount;

    const handleConfirm = () => {
        onSplit(amountPerPerson, splitType);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent>
                <ModalHeader>Dividir Conta</ModalHeader>
                <ModalBody>
                    <Tabs
                        aria-label="Opções de divisão"
                        color="primary"
                        variant="underlined"
                        selectedKey={splitType}
                        onSelectionChange={(key) => setSplitType(key as "people" | "items")}
                    >
                        <Tab
                            key="people"
                            title={
                                <div className="flex items-center gap-2">
                                    <UsersGroupRounded size={20} />
                                    <span>Por Pessoa</span>
                                </div>
                            }
                        >
                            <div className="flex flex-col gap-4 py-4">
                                <p className="text-sm text-default-500">
                                    Dividir o valor total de R$ {total.toFixed(2).replace(".", ",")} igualmente entre as pessoas da mesa.
                                </p>

                                <div className="flex items-center gap-4">
                                    <Button
                                        isIconOnly variant="flat"
                                        onPress={() => setPeopleCount(Math.max(2, peopleCount - 1))}
                                    >
                                        -
                                    </Button>
                                    <div className="flex-1 text-center">
                                        <span className="text-2xl font-bold">{peopleCount}</span>
                                        <p className="text-xs text-default-500">Pessoas</p>
                                    </div>
                                    <Button
                                        isIconOnly variant="flat"
                                        onPress={() => setPeopleCount(peopleCount + 1)}
                                    >
                                        +
                                    </Button>
                                </div>

                                <div className="bg-default-100 p-4 rounded-lg text-center mt-2">
                                    <p className="text-sm text-default-600">Valor para cada:</p>
                                    <p className="text-3xl font-bold text-primary">
                                        R$ {amountPerPerson.toFixed(2).replace(".", ",")}
                                    </p>
                                </div>
                            </div>
                        </Tab>
                        <Tab
                            key="items"
                            title={
                                <div className="flex items-center gap-2">
                                    <TeaCup size={20} />
                                    <span>Por Itens</span>
                                </div>
                            }
                        >
                            <div className="flex flex-col gap-4 py-4">
                                <p className="text-sm text-default-500">
                                    Selecione os itens que cada pessoa vai pagar.
                                </p>
                                <div className="p-8 text-center text-default-400 bg-default-50 rounded-lg border border-dashed border-default-200">
                                    Funcionalidade em desenvolvimento
                                </div>
                            </div>
                        </Tab>
                    </Tabs>
                </ModalBody>
                <ModalFooter>
                    <Button variant="light" onPress={onClose}>Cancelar</Button>
                    <Button color="primary" onPress={handleConfirm}>
                        Confirmar Divisão
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
