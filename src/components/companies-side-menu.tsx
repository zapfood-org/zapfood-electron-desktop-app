import { Button, Tooltip } from "@heroui/react";
import clsx from "clsx";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

import {
    Buildings2,
    Settings,
    Sun,
    Moon
} from "@solar-icons/react";

interface MenuItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    enabled?: boolean;
}

const menuItems: MenuItem[] = [
    {
        label: "Meus Restaurantes",
        href: "/companies",
        icon: <Buildings2 size={24} weight="Outline" />,
        enabled: true,
    },
    {
        label: "Configurações",
        href: "/companies/settings",
        icon: <Settings size={24} weight="Outline" />,
        enabled: true,
    },
];

export function CompaniesSideMenu() {
    const location = useLocation();
    const pathname = location.pathname;
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isActive = (href: string) => {
        return pathname === href;
    };

    const MenuButton = ({ item }: { item: MenuItem }) => {
        const active = isActive(item.href);
        const button = (
            <div className="flex justify-center w-full">
                <Button
                    as={Link}
                    to={item.href}
                    isIconOnly
                    className={clsx(
                        "w-10 h-10 min-w-10",
                        active && "text-primary"
                    )}
                    variant={active ? "flat" : "light"}
                    color={active ? "primary" : "default"}
                >
                    {item.icon}
                </Button>
            </div>
        );

        return (
            <Tooltip content={item.label} placement="right">
                {button}
            </Tooltip>
        );
    };

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    return (
        <aside className="flex flex-col w-20 bg-default-50 border-r border-default-200 transition-all duration-300 h-full">

            {/* Navigation Items - Centered vertically */}
            <div className="flex flex-col justify-center flex-1 gap-6 w-full py-4">
                <div className="flex flex-col gap-2 w-full">
                    {menuItems.map((item) => (
                        <MenuButton key={item.href} item={item} />
                    ))}
                </div>
            </div>

            {/* Theme Toggle at Bottom */}
            <div className="p-4 flex flex-col items-center gap-2">
                <Tooltip content={theme === "light" ? "Mudar para escuro" : "Mudar para claro"} placement="right">
                    <Button
                        isIconOnly
                        variant="light"
                        onPress={toggleTheme}
                    >
                        {mounted && theme === "light" ? (
                            <Sun size={24} weight="Outline" />
                        ) : (
                            <Moon size={24} weight="Outline" />
                        )}
                    </Button>
                </Tooltip>
            </div>
        </aside>
    );
}
