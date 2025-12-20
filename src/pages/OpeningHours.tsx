import { Button } from "@heroui/react";
import { CheckCircle, ClockSquare } from "@solar-icons/react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { DaySchedulePicker } from "../components/opening-hours/day-schedule-picker";
import type { DaySchedule } from "../components/opening-hours/day-schedule-picker";

const DAYS_OF_WEEK = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
];

const DEFAULT_SCHEDULE: DaySchedule[] = DAYS_OF_WEEK.map((_, index) => ({
    dayOfWeek: index,
    isOpen: index !== 0 && index !== 6, // Closed on weekends by default
    slots: index !== 0 && index !== 6 ? [{ start: "09:00", end: "18:00" }] : [],
}));

export function OpeningHoursPage() {
    const { tenantId } = useParams();
    const [schedule, setSchedule] = useState<DaySchedule[]>(DEFAULT_SCHEDULE);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (tenantId) {
            const savedData = localStorage.getItem(`zapfood_opening_hours_${tenantId}`);
            if (savedData) {
                try {
                    const parsed = JSON.parse(savedData);
                    // Merge with default ensuring all days exist
                    const merged = DEFAULT_SCHEDULE.map(day => {
                        const found = parsed.find((p: DaySchedule) => p.dayOfWeek === day.dayOfWeek);
                        return found || day;
                    });
                    setSchedule(merged);
                } catch (e) {
                    console.error("Failed to parse schedule", e);
                }
            }
            setLoading(false);
        }
    }, [tenantId]);

    const handleSave = () => {
        if (tenantId) {
            localStorage.setItem(`zapfood_opening_hours_${tenantId}`, JSON.stringify(schedule));

            // Dispatch event to update TitleBar immediately
            window.dispatchEvent(new Event("opening-hours-changed"));

            toast.success("Horários salvos com sucesso!");
        }
    };

    const handleDayChange = (dayIndex: number, newDaySchedule: DaySchedule) => {
        const newSchedule = [...schedule];
        newSchedule[dayIndex] = newDaySchedule;
        setSchedule(newSchedule);
    };

    if (loading) {
        return <div className="p-8">Carregando...</div>;
    }

    return (
        <div className="flex flex-col h-full w-full bg-default-100 dark:bg-default-10 overflow-y-auto">
            <div className="flex-1 p-6 max-w-4xl mx-auto w-full">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <ClockSquare className="text-primary" />
                            Horários de Funcionamento
                        </h1>
                        <p className="text-default-500">
                            Configure os horários de abertura e fechamento do seu restaurante.
                        </p>
                    </div>
                    <Button
                        color="primary"
                        startContent={<CheckCircle size={20} />}
                        onPress={handleSave}
                    >
                        Salvar Alterações
                    </Button>
                </div>

                <div className="space-y-4 pb-20">
                    {schedule.map((daySchedule, index) => (
                        <DaySchedulePicker
                            key={index}
                            dayName={DAYS_OF_WEEK[index]}
                            value={daySchedule}
                            onChange={(newVal) => handleDayChange(index, newVal)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
