
import { Button, Card, CardBody, CardHeader, Chip, DatePicker, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, NumberInput, Select, SelectItem, useDisclosure, addToast } from "@heroui/react";
import { AddCircle } from "@solar-icons/react";
import { CalendarDate } from "@internationalized/date";
import { useState } from "react";

export function CouponsPage() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [startDate, setStartDate] = useState<CalendarDate | null>(null);
    const [expiryDate, setExpiryDate] = useState<CalendarDate | null>(null);

    const handleCreate = (onClose: () => void) => {
        addToast({
            title: "Cupom criado",
            description: "O cupom foi criado com sucesso!",
            color: "success",
        });
        setStartDate(null);
        setExpiryDate(null);
        onClose();
    };

    return (
        <div className="flex flex-col flex-1 h-full overflow-hidden">
            <div className="flex items-center justify-between p-6">
                <div>
                    <h1 className="text-3xl font-bold">Cupons</h1>
                    <p className="text-sm text-default-500 mt-1">
                        Gerencie cupons de desconto
                    </p>
                </div>
                <Button color="primary" startContent={<AddCircle size={20} weight="Outline" />} onPress={onOpen}>
                    Criar Cupom
                </Button>
            </div>

            <Divider />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 overflow-y-auto">
                {[
                    { code: "DESC10", discount: "10%", uses: 45, maxUses: 100 },
                    { code: "FRETE20", discount: "R$ 20", uses: 12, maxUses: 50 },
                    { code: "BEMVINDO", discount: "15%", uses: 89, maxUses: 200 },
                ].map((coupon, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <div className="flex items-center justify-between w-full">
                                <div className="flex flex-col">
                                    <h3 className="text-lg font-semibold font-mono">{coupon.code}</h3>
                                    <p className="text-sm text-default-500">Desconto: {coupon.discount}</p>
                                </div>
                                <Chip size="sm" color="primary" variant="flat">
                                    {coupon.uses}/{coupon.maxUses}
                                </Chip>
                            </div>
                        </CardHeader>
                        <CardBody>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-default-500">Usos:</span>
                                    <span className="font-medium">{coupon.uses} de {coupon.maxUses}</span>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="flat" className="flex-1">
                                        Editar
                                    </Button>
                                    <Button size="sm" variant="bordered" className="flex-1">
                                        Copiar Código
                                    </Button>
                                </div>
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
                                <h2 className="text-2xl font-bold">Criar Cupom</h2>
                                <p className="text-sm text-default-500 font-normal">
                                    Configure um novo cupom de desconto
                                </p>
                            </ModalHeader>
                            <ModalBody>
                                <div className="flex flex-col gap-4">
                                    <Input
                                        label="Código do Cupom"
                                        placeholder="Ex: DESC10, FRETE20"
                                        isRequired
                                        description="Código que o cliente usará para aplicar o desconto"
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
                                    <div className="grid grid-cols-2 gap-4">
                                        <NumberInput
                                            label="Usos Máximos"
                                            placeholder="100"
                                            minValue={1}
                                            step={1}
                                            isRequired
                                        />
                                        <NumberInput
                                            label="Valor Mínimo do Pedido"
                                            placeholder="0.00"
                                            minValue={0}
                                            step={0.01}
                                            startContent={<span className="text-default-500">R$</span>}
                                            formatOptions={{
                                                style: "currency",
                                                currency: "BRL",
                                            }}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <DatePicker
                                            label="Data de Início"
                                            value={startDate}
                                            onChange={setStartDate}
                                            firstDayOfWeek="mon"
                                            isRequired
                                        />
                                        <DatePicker
                                            label="Data de Expiração"
                                            value={expiryDate}
                                            onChange={setExpiryDate}
                                            minValue={startDate || undefined}
                                            firstDayOfWeek="mon"
                                            isRequired
                                        />
                                    </div>
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
