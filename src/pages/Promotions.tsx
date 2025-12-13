
import { Button, Card, CardBody, CardHeader, Chip, DatePicker, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, NumberInput, Select, SelectItem, useDisclosure, addToast } from "@heroui/react";
import { AddCircle } from "@solar-icons/react";
import { CalendarDate } from "@internationalized/date";
import { useState } from "react";

export function PromotionsPage() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [startDate, setStartDate] = useState<CalendarDate | null>(null);
    const [endDate, setEndDate] = useState<CalendarDate | null>(null);

    const handleCreate = (onClose: () => void) => {
        addToast({
            title: "Promoção criada",
            description: "A promoção foi criada com sucesso!",
            color: "success",
        });
        setStartDate(null);
        setEndDate(null);
        onClose();
    };

    return (
        <div className="flex flex-col flex-1 h-full overflow-hidden">
            <div className="flex items-center justify-between p-6">
                <div>
                    <h1 className="text-3xl font-bold">Promoções</h1>
                    <p className="text-sm text-default-500 mt-1">
                        Crie e gerencie promoções para seus clientes
                    </p>
                </div>
                <Button color="primary" startContent={<AddCircle size={20} weight="Outline" />} onPress={onOpen}>
                    Criar Promoção
                </Button>
            </div>

            <Divider />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 overflow-y-auto">
                {[
                    { title: "Desconto de 20%", status: "ativa", discount: "20%" },
                    { title: "Frete Grátis", status: "ativa", discount: "Grátis" },
                    { title: "Combo Especial", status: "pausada", discount: "15%" },
                ].map((promo, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <div className="flex items-center justify-between w-full">
                                <div className="flex flex-col">
                                    <h3 className="text-lg font-semibold">{promo.title}</h3>
                                    <p className="text-sm text-default-500">Desconto: {promo.discount}</p>
                                </div>
                                <Chip
                                    size="sm"
                                    color={promo.status === "ativa" ? "success" : "default"}
                                    variant="flat"
                                >
                                    {promo.status}
                                </Chip>
                            </div>
                        </CardHeader>
                        <CardBody>
                            <div className="flex gap-2">
                                <Button size="sm" variant="flat" className="flex-1">
                                    Editar
                                </Button>
                                <Button size="sm" variant="bordered" className="flex-1">
                                    Ver Detalhes
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>

            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                backdrop="blur"
                size="2xl"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <h2 className="text-2xl font-bold">Criar Promoção</h2>
                                <p className="text-sm text-default-500 font-normal">
                                    Configure uma nova promoção para atrair clientes
                                </p>
                            </ModalHeader>
                            <ModalBody>
                                <div className="flex flex-col gap-4">
                                    <Input
                                        label="Título da Promoção"
                                        placeholder="Ex: Desconto de 20%"
                                        isRequired
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Select
                                            label="Tipo de Desconto"
                                            placeholder="Selecione"
                                            isRequired
                                        >
                                            <SelectItem key="percent">Percentual (%)</SelectItem>
                                            <SelectItem key="fixed">Valor Fixo (R$)</SelectItem>
                                        </Select>
                                        <NumberInput
                                            label="Valor do Desconto"
                                            placeholder="0"
                                            minValue={0}
                                            step={0.01}
                                            isRequired
                                        />
                                    </div>
                                    <DatePicker
                                        label="Data de Início"
                                        value={startDate}
                                        onChange={setStartDate}
                                        firstDayOfWeek="mon"
                                        isRequired
                                    />
                                    <DatePicker
                                        label="Data de Término"
                                        value={endDate}
                                        onChange={setEndDate}
                                        minValue={startDate || undefined}
                                        firstDayOfWeek="mon"
                                        isRequired
                                    />
                                    <Input
                                        label="Descrição"
                                        placeholder="Descreva a promoção"
                                    />
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>
                                    Cancelar
                                </Button>
                                <Button color="primary" onPress={() => handleCreate(onClose)}>
                                    Criar
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
