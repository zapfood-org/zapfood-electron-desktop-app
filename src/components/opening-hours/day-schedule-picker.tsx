import { Button, Checkbox, Input } from "@heroui/react";
import { AddCircle, TrashBinTrash } from "@solar-icons/react";
import { useState, useEffect } from "react";

export interface TimeSlot {
    start: string;
    end: string;
}

export interface DaySchedule {
    dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
    isOpen: boolean;
    slots: TimeSlot[];
}

interface DaySchedulePickerProps {
    dayName: string;
    value: DaySchedule;
    onChange: (schedule: DaySchedule) => void;
}

export function DaySchedulePicker({ dayName, value, onChange }: DaySchedulePickerProps) {
    const handleOpenChange = (isOpen: boolean) => {
        onChange({ ...value, isOpen });
    };

    const handleAddSlot = () => {
        onChange({
            ...value,
            slots: [...value.slots, { start: "09:00", end: "18:00" }]
        });
    };

    const handleRemoveSlot = (index: number) => {
        const newSlots = value.slots.filter((_, i) => i !== index);
        onChange({ ...value, slots: newSlots });
    };

    const handleSlotChange = (index: number, field: keyof TimeSlot, time: string) => {
        const newSlots = value.slots.map((slot, i) => {
            if (i === index) {
                return { ...slot, [field]: time };
            }
            return slot;
        });
        onChange({ ...value, slots: newSlots });
    };

    return (
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 p-4 border rounded-lg border-default-200 bg-white dark:bg-default-50">
            <div className="w-32 pt-2">
                <Checkbox
                    isSelected={value.isOpen}
                    onValueChange={handleOpenChange}
                    classNames={{ label: "font-semibold" }}
                >
                    {dayName}
                </Checkbox>
            </div>

            <div className="flex-1 flex flex-col gap-3">
                {value.isOpen ? (
                    <>
                        {value.slots.map((slot, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Input
                                    type="time"
                                    value={slot.start}
                                    onChange={(e) => handleSlotChange(index, "start", e.target.value)}
                                    className="w-32"
                                    aria-label="Horário de abertura"
                                />
                                <span className="text-default-400">até</span>
                                <Input
                                    type="time"
                                    value={slot.end}
                                    onChange={(e) => handleSlotChange(index, "end", e.target.value)}
                                    className="w-32"
                                    aria-label="Horário de fechamento"
                                />
                                <Button
                                    isIconOnly
                                    color="danger"
                                    variant="light"
                                    onPress={() => handleRemoveSlot(index)}
                                    className="text-default-400 hover:text-danger"
                                >
                                    <TrashBinTrash size={20} />
                                </Button>
                            </div>
                        ))}
                        <div>
                            <Button
                                size="sm"
                                variant="flat"
                                color="primary"
                                startContent={<AddCircle size={16} />}
                                onPress={handleAddSlot}
                            >
                                Adicionar Horário
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="pt-2 text-default-400 italic">
                        Fechado
                    </div>
                )}
            </div>
        </div>
    );
}
