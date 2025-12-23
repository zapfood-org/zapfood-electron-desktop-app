import { Checkbox, TimeInput } from "@heroui/react";
import { Time } from "@internationalized/date";

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

export function DaySchedulePicker({
  dayName,
  value,
  onChange,
}: DaySchedulePickerProps) {
  const handleOpenChange = (isOpen: boolean) => {
    // Quando marcar como aberto, garante que exista exatamente um horário
    if (isOpen && value.slots.length === 0) {
      onChange({
        ...value,
        isOpen: true,
        slots: [{ start: "09:00", end: "18:00" }],
      });
      return;
    }

    onChange({ ...value, isOpen });
  };

  // Apenas um horário por dia: usamos sempre o primeiro slot,
  // criando um default caso ainda não exista.
  const ensureSingleSlot = (): TimeSlot => {
    if (value.slots.length === 0) {
      return { start: "09:00", end: "18:00" };
    }
    return value.slots[0];
  };

  const handleSingleSlotChange = (field: keyof TimeSlot, time: string) => {
    const current = ensureSingleSlot();
    const updated: TimeSlot = { ...current, [field]: time };
    onChange({ ...value, slots: [updated] });
  };

  const stringToTime = (value: string): Time => {
    const [hourStr, minuteStr] = value.split(":");
    const hour = Number.parseInt(hourStr ?? "0", 10);
    const minute = Number.parseInt(minuteStr ?? "0", 10);
    return new Time(
      Number.isNaN(hour) ? 0 : hour,
      Number.isNaN(minute) ? 0 : minute
    );
  };

  const timeToString = (time: Time): string => {
    const h = time.hour.toString().padStart(2, "0");
    const m = time.minute.toString().padStart(2, "0");
    return `${h}:${m}`;
  };

  const handleTimeChange = (field: keyof TimeSlot, time: Time) => {
    const formatted = timeToString(time);
    handleSingleSlotChange(field, formatted);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-4 p-4 border rounded-lg border-default-200 bg-white dark:bg-default-50">
      <div className="w-32 pt-2">
        <Checkbox
          isSelected={value.isOpen}
          onValueChange={handleOpenChange}
          classNames={{ label: "font-semibold" }}
          className="text-nowrap"
        >
          {dayName}
        </Checkbox>
      </div>

      <div className="flex-1 flex flex-col gap-3">
        {value.isOpen ? (
          <div className="flex items-center gap-2">
            {(() => {
              const slot = ensureSingleSlot();
              return (
                <>
                  <TimeInput
                    aria-label="Horário de abertura"
                    value={stringToTime(slot.start)}
                    onChange={(val) => handleTimeChange("start", val as Time)}
                    hourCycle={24}
                    granularity="minute"
                    hideTimeZone
                    className="w-40"
                  />
                  <span className="text-default-400">até</span>
                  <TimeInput
                    aria-label="Horário de fechamento"
                    value={stringToTime(slot.end)}
                    onChange={(val) => handleTimeChange("end", val as Time)}
                    hourCycle={24}
                    granularity="minute"
                    hideTimeZone
                    className="w-40"
                  />
                </>
              );
            })()}
          </div>
        ) : (
          <div className="pt-2 text-default-400 italic">Fechado</div>
        )}
      </div>
    </div>
  );
}
