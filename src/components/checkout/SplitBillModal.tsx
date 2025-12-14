
import { Button, Checkbox, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Tab, Tabs } from "@heroui/react";
import { TeaCup, UsersGroupRounded } from "@solar-icons/react";
import { useMemo, useState } from "react";

interface OrderItem {
    id: number;
    name: string;
    quantity: number;
    price: number;
}

interface SplitBillModalProps {
    isOpen: boolean;
    onClose: () => void;
    total: number;
    items?: OrderItem[];
    onSplit: (amount: number, type: "people" | "items", selectedItemIds?: string[]) => void;
}

export function SplitBillModal({ isOpen, onClose, total, items = [], onSplit }: SplitBillModalProps) {
    const [splitType, setSplitType] = useState<"people" | "items">("people");
    const [peopleCount, setPeopleCount] = useState(2);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

    // People Split Calculation
    const amountPerPerson = total / peopleCount;

    // Item Split Calculation
    const selectedSubtotal = useMemo(() => {
        let sum = 0;
        items.forEach(item => {
            // Check if item is fully selected
            if (selectedItems.has(item.id.toString())) {
                sum += item.price * item.quantity;
            }
        });
        return sum;
    }, [items, selectedItems]);

    // Calculate service fee rate based on total and items
    const allItemsSubtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const serviceFeeRate = allItemsSubtotal > 0 ? (total - allItemsSubtotal) / allItemsSubtotal : 0;
    const selectedServiceFee = selectedSubtotal * serviceFeeRate;
    const selectedTotal = selectedSubtotal + selectedServiceFee;

    const handleToggleItem = (itemId: string) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(itemId)) {
            newSelected.delete(itemId);
        } else {
            newSelected.add(itemId);
        }
        setSelectedItems(newSelected);
    };

    const handleConfirm = () => {
        if (splitType === "people") {
            onSplit(amountPerPerson, "people");
        } else {
            onSplit(selectedTotal, "items", Array.from(selectedItems));
        }
        onClose();
        // Reset selection after confirm
        if (splitType === "items") {
            setSelectedItems(new Set());
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
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
                            <div className="flex flex-col gap-4 py-4 max-h-[400px] overflow-y-auto">
                                <p className="text-sm text-default-500">
                                    Selecione os itens que serão pagos agora.
                                </p>

                                <div className="flex flex-col gap-2">
                                    {items.map((item) => (
                                        <div
                                            key={item.id}
                                            className={`
                                                flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors
                                                ${selectedItems.has(item.id.toString())
                                                    ? "border-primary bg-primary/5"
                                                    : "border-default-200 hover:bg-default-50"}
                                            `}
                                            onClick={() => handleToggleItem(item.id.toString())}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Checkbox
                                                    isSelected={selectedItems.has(item.id.toString())}
                                                    onValueChange={() => handleToggleItem(item.id.toString())}
                                                    classNames={{ label: "hidden" }}
                                                />
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">{item.name}</span>
                                                    <span className="text-xs text-default-400">
                                                        {item.quantity}x R$ {item.price.toFixed(2).replace(".", ",")}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="font-semibold text-sm">
                                                R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-default-100 p-4 rounded-lg flex justify-between items-center mt-2 sticky bottom-0">
                                    <span className="text-sm font-medium">Total Selecionado:</span>
                                    <span className="text-xl font-bold text-primary">
                                        R$ {selectedTotal.toFixed(2).replace(".", ",")}
                                    </span>
                                </div>
                            </div>
                        </Tab>
                    </Tabs>
                </ModalBody>
                <ModalFooter>
                    <Button variant="light" onPress={onClose}>Cancelar</Button>
                    <Button
                        color="primary"
                        onPress={handleConfirm}
                        isDisabled={splitType === "items" && selectedTotal === 0}
                    >
                        Confirmar Valor
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
