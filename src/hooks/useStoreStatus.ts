import { useState, useEffect } from "react";

export interface StoreStatus {
    isOpen: boolean;
    overrideStatus: "open" | "closed" | null;
}

export function useStoreStatus(tenantId?: string) {
    const [status, setStatus] = useState<StoreStatus>({ isOpen: false, overrideStatus: null });

    const checkStatus = () => {
        if (!tenantId) return;

        let newIsOpen = false;
        let newOverrideStatus: "open" | "closed" | null = null;

        // 1. Check override
        try {
            const savedOverride = localStorage.getItem(`zapfood_status_override_${tenantId}`);
            if (savedOverride === "open") {
                newIsOpen = true;
                newOverrideStatus = "open";
            } else if (savedOverride === "closed") {
                newIsOpen = false;
                newOverrideStatus = "closed";
            }
        } catch (e) {
            console.error(e);
        }

        if (newOverrideStatus) {
            setStatus({ isOpen: newIsOpen, overrideStatus: newOverrideStatus });
            return;
        }

        // 2. Check schedule (if no override)
        const now = new Date();
        const currentDay = now.getDay(); // 0-6
        const currentTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        try {
            const savedSchedule = localStorage.getItem(`zapfood_opening_hours_${tenantId}`);
            if (savedSchedule) {
                const schedule = JSON.parse(savedSchedule);
                const dayConfig = schedule.find((d: any) => d.dayOfWeek === currentDay);

                if (dayConfig && dayConfig.isOpen && dayConfig.slots && dayConfig.slots.length > 0) {
                    const isOpenNow = dayConfig.slots.some((slot: any) => {
                        return currentTime >= slot.start && currentTime <= slot.end;
                    });
                    newIsOpen = isOpenNow;
                }
            }
        } catch (e) {
            console.error(e);
        }

        setStatus({ isOpen: newIsOpen, overrideStatus: null });
    };

    useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, 1000); // Check every second

        const handleStorageChange = () => checkStatus();
        window.addEventListener("opening-hours-changed", handleStorageChange);
        window.addEventListener("storage", handleStorageChange);

        return () => {
            clearInterval(interval);
            window.removeEventListener("opening-hours-changed", handleStorageChange);
            window.removeEventListener("storage", handleStorageChange);
        };
    }, [tenantId]);

    return status;
}
