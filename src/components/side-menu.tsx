import { Avatar, Button, Divider, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input, Modal, ModalBody, ModalContent, ModalHeader, Select, SelectItem, useDisclosure } from "@heroui/react";
import { Tooltip } from "@heroui/tooltip";
import clsx from "clsx";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import zapFoodLogo from "../assets/images/ZapFoodLogo.png";
import zapFoodLogoIcon from "../assets/images/ZapFoodLogoIco.png";
import { ScrollArea } from "./ui/scroll-area";

import {
    Bell,
    BillList,
    BookBookmark,
    Box,
    Buildings2,
    Delivery,
    Dollar,
    Gift,
    GraphUp,
    HeadphonesRoundSound,
    Logout,
    Magnifer,
    MenuDots,
    Moon,
    PhoneCalling,
    PieChart2,
    Printer,
    RoundAltArrowLeft,
    Settings,
    Shop,
    Sun,
    TagPrice,
    TeaCup,
    Ticket,
    User,
    UsersGroupRounded,
    WalletMoney,
    Widget
} from "@solar-icons/react";

interface MenuItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    badge?: number;
    group?: string;
    enabled?: boolean;
}

const menuItems = (tenantId: string): MenuItem[] => [
    // Principal
    {
        label: "Painel",
        href: `/${tenantId}/dashboard`,
        icon: <PieChart2 size={24} weight="Outline" />,
        group: "principal",
        enabled: true,
    },
    {
        label: "Pedidos",
        href: `/${tenantId}/orders`,
        icon: <Box size={24} weight="Outline" />,
        badge: 3,
        group: "principal",
        enabled: true,
    },
    {
        label: "Restaurantes",
        href: `/${tenantId}/restaurants`,
        icon: <Shop size={24} weight="Outline" />,
        group: "principal",
        enabled: false,
    },
    {
        label: "Mesas",
        href: `/${tenantId}/tables`,
        icon: <Buildings2 size={24} weight="Outline" />,
        group: "principal",
        enabled: true,
    },
    {
        label: "Comandas",
        href: `/${tenantId}/bills`,
        icon: <Ticket size={24} weight="Outline" />,
        group: "principal",
        enabled: true,
    },
    {
        label: "Produtos",
        href: `/${tenantId}/products`,
        icon: <TeaCup size={24} weight="Outline" />,
        group: "produtos",
        enabled: true,
    },
    {
        label: "Categorias",
        href: `/${tenantId}/categories`,
        icon: <Widget size={24} weight="Outline" />,
        group: "produtos",
        enabled: false,
    },
    {
        label: "Cardápios",
        href: `/${tenantId}/menus`,
        icon: <BookBookmark size={24} weight="Outline" />,
        group: "produtos",
        enabled: true,
    },

    // Clientes e Entregadores
    {
        label: "Clientes",
        href: `/${tenantId}/customers`,
        icon: <UsersGroupRounded size={24} weight="Outline" />,
        group: "pessoas",
        enabled: false,
    },
    {
        label: "Entregadores",
        href: `/${tenantId}/delivery-drivers`,
        icon: <Delivery size={24} weight="Outline" />,
        badge: 2,
        group: "pessoas",
        enabled: false,
    },
    {
        label: "Colaboradores",
        href: `/${tenantId}/members`,
        icon: <UsersGroupRounded size={24} weight="Outline" />,
        group: "pessoas",
        enabled: false,
    },
    {
        label: "Garçons",
        href: `/${tenantId}/waiters`,
        icon: <User size={24} weight="Outline" />,
        group: "pessoas",
        enabled: true,
    },

    // Marketing e Promoções
    {
        label: "Promoções",
        href: `/${tenantId}/promotions`,
        icon: <TagPrice size={24} weight="Outline" />,
        group: "marketing",
        enabled: false,
    },
    {
        label: "Cupons",
        href: `/${tenantId}/coupons`,
        icon: <Ticket size={24} weight="Outline" />,
        group: "marketing",
        enabled: true,
    },
    {
        label: "Notificações Push",
        href: `/${tenantId}/notifications`,
        icon: <Bell size={24} weight="Outline" />,
        badge: 5,
        group: "marketing",
        enabled: false,
    },
    {
        label: "Jogos Promocionais",
        href: `/${tenantId}/promotional-games`,
        icon: <Gift size={24} weight="Outline" />,
        group: "marketing",
        enabled: false,
    },

    // Financeiro e Relatórios
    {
        label: "Financeiro",
        href: `/${tenantId}/financial`,
        icon: <Dollar size={24} weight="Outline" />,
        group: "financeiro",
        enabled: false,
    },
    {
        label: "Faturas",
        href: `/${tenantId}/invoices`,
        icon: <BillList size={24} weight="Outline" />,
        group: "financeiro",
        enabled: true,
    },
    {
        label: "Relatórios",
        href: `/${tenantId}/reports`,
        icon: <GraphUp size={24} weight="Outline" />,
        group: "financeiro",
        enabled: false,
    },
    {
        label: "Relatório de Vendas",
        href: `/${tenantId}/sales-report`,
        icon: <GraphUp size={24} weight="Outline" />,
        group: "financeiro",
        enabled: false,
    },
    {
        label: "Sangria",
        href: `/${tenantId}/cash-withdrawal`,
        icon: <WalletMoney size={24} weight="Outline" />,
        group: "financeiro",
        enabled: false,
    },
    {
        label: "Comissões",
        href: `/${tenantId}/commissions`,
        icon: <WalletMoney size={24} weight="Outline" />,
        group: "financeiro",
        enabled: false,
    },

    // Configurações e Suporte
    {
        label: "WhatsApp",
        href: `/${tenantId}/whatsapp`,
        icon: <PhoneCalling size={24} weight="Outline" />,
        group: "config",
        enabled: true,
    },
    {
        label: "Impressoras",
        href: `/${tenantId}/printers`,
        icon: <Printer size={24} weight="Outline" />,
        group: "config",
        enabled: true,
    },
    {
        label: "Configurações",
        href: `/${tenantId}/settings`,
        icon: <Settings size={24} weight="Outline" />,
        group: "config",
        enabled: false,
    },
    {
        label: "Suporte",
        href: `/${tenantId}/support`,
        icon: <HeadphonesRoundSound size={24} weight="Outline" />,
        badge: 1,
        group: "config",
        enabled: false,
    },
    {
        label: "Atendimento",
        href: `/${tenantId}/customer-service`,
        icon: <PhoneCalling size={24} weight="Outline" />,
        badge: 3,
        group: "config",
        enabled: true,
    },
    {
        label: "Teste Notificações",
        href: `/${tenantId}/windows-notifications`,
        icon: <Bell size={24} weight="Outline" />,
        group: "config",
        enabled: false,
    },
];

interface Tenant {
    id: string;
    name: string;
    cnpj?: string;
}

const mockTenants: Tenant[] = [
    { id: "1", name: "Restaurante Premium", cnpj: "12.345.678/0001-90" },
    { id: "2", name: "Cozinha Caseira", cnpj: "23.456.789/0001-01" },
    { id: "3", name: "Sabor Express", cnpj: "34.567.890/0001-12" },
    { id: "4", name: "Delícias do Chef", cnpj: "45.678.901/0001-23" },
    { id: "5", name: "Fast Food Brasil", cnpj: "56.789.012/0001-34" },
];

export function SideMenu() {
    const { tenantId } = useParams();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(true);
    const [mounted, setMounted] = useState(false);
    const location = useLocation();
    const pathname = location.pathname;
    const { theme, setTheme } = useTheme();
    const [tenants] = useState<Tenant[]>(mockTenants);
    const currentTenant = tenants.find((t) => t.id === (tenantId as string)) || tenants[0];
    const { isOpen: isSearchModalOpen, onOpen: onSearchModalOpen, onClose: onSearchModalClose, onOpenChange: onSearchModalOpenChange } = useDisclosure();
    const [searchQuery, setSearchQuery] = useState("");
    const onSearchModalOpenRef = useRef(onSearchModalOpen);

    // Keep ref updated
    useEffect(() => {
        onSearchModalOpenRef.current = onSearchModalOpen;
    }, [onSearchModalOpen]);

    useEffect(() => {
        setTimeout(() => {
            setMounted(true);
        }, 0);
    }, []);

    // Keyboard shortcut: Ctrl+B to toggle side menu
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.key === "b") {
                event.preventDefault();
                setIsOpen((prev) => !prev);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    // Keyboard shortcut: Ctrl+K to open search modal
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey && (event.key === "k" || event.key === "K")) {
                event.preventDefault();
                onSearchModalOpenRef.current();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    const isActive = (href: string) => {
        if (href === "/dashboard") {
            return pathname === href || pathname.startsWith("/dashboard");
        }
        return pathname === href || pathname.startsWith(href);
    };

    // Filter menu items based on search query and enabled status
    const filteredMenuItems = useMemo(() => {
        const items = menuItems(tenantId as string ?? "1")
            .filter((item) => item.enabled !== false); // Filtrar itens desabilitados

        if (!searchQuery.trim()) {
            return items;
        }
        const query = searchQuery.toLowerCase().trim();
        return items.filter((item) =>
            item.label.toLowerCase().includes(query)
        );
    }, [searchQuery, tenantId]);

    const handleMenuClick = (href: string) => {
        navigate(href);
        setSearchQuery("");
        onSearchModalClose();
    };

    const MenuButton = ({ item }: { item: MenuItem }) => {
        const active = isActive(item.href);
        const button = (
            <div className="relative w-full">
                <Button
                    as={Link}
                    to={item.href}
                    className={clsx(
                        "w-full justify-start h-10 min-w-0",
                        !isOpen && "justify-center px-0",
                        active && "text-primary"
                    )}
                    variant={active ? "flat" : "light"}
                    color={active ? "primary" : "default"}
                    startContent={
                        item.icon
                    }
                >
                    {isOpen && (
                        <span
                            className={clsx(
                                "text-sm font-medium flex-1 text-left",
                                active && "text-primary font-semibold"
                            )}
                        >
                            {item.label}
                        </span>
                    )}
                </Button>
                {item.badge && item.badge > 0 && (
                    <span className="absolute top-1 right-1 flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-danger text-[10px] font-semibold text-white px-1 z-10 border-2 border-default-50">
                        {item.badge > 99 ? "99+" : item.badge}
                    </span>
                )}
            </div>
        );

        if (!isOpen) {
            return (
                <Tooltip content={item.label} placement="right">
                    {button}
                </Tooltip>
            );
        }

        return button;
    };

    return (
        <aside className={clsx("flex flex-col bg-default-50 border-r border-default-200 transition-all duration-300", isOpen ? "w-80" : "w-20")}>
            {/* Header */}
            <div className="p-6">
                <div className="flex items-center justify-between gap-3">
                    {isOpen ? (
                        <>
                            <div className="flex flex-col gap-2 flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <img src={zapFoodLogo} alt="Logo" width={128} />
                                    <Tooltip content="Recolher menu" placement="bottom">
                                        <Button
                                            isIconOnly
                                            variant="light"
                                            size="sm"
                                            onPress={() => setIsOpen(false)}
                                            className="ml-auto"
                                        >
                                            <RoundAltArrowLeft size={20} weight="Outline" />
                                        </Button>
                                    </Tooltip>
                                </div>
                                <Divider />
                                <Select
                                    selectedKeys={currentTenant ? [currentTenant.id] : []}
                                    onSelectionChange={(keys) => {
                                        const selectedId = Array.from(keys)[0] as string;
                                        if (selectedId && selectedId !== tenantId) {
                                            // Extrair o path atual sem o tenantId
                                            const pathWithoutTenant = pathname.replace(`/${tenantId}`, "");
                                            navigate(`/${selectedId}${pathWithoutTenant || "/dashboard"}`);
                                        }
                                    }}
                                    placeholder="Selecione a empresa"
                                    classNames={{
                                        trigger: "bg-default-100",
                                        value: "text-xs",
                                    }}
                                    size="lg"
                                    startContent={
                                        <Buildings2
                                            size={16}
                                            weight="Outline"
                                            className="text-default-500"
                                        />
                                    }
                                >
                                    {tenants.map((tenant) => (
                                        <SelectItem
                                            key={tenant.id}
                                            textValue={tenant.name}
                                        >
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-sm font-medium">{tenant.name}</span>
                                                {tenant.cnpj && (
                                                    <span className="text-xs text-default-500">{tenant.cnpj}</span>
                                                )}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </Select>
                            </div>

                        </>
                    ) : (
                        <Tooltip content="Expandir menu" placement="right">
                            <Button
                                isIconOnly
                                variant="light"
                                size="sm"
                                onPress={() => setIsOpen(true)}
                                className="w-full"
                            >
                                <img src={zapFoodLogoIcon} alt="Logo" width={24} />
                            </Button>
                        </Tooltip>
                    )}
                </div>

                {/* Search */}
                {isOpen ? (
                    <div className="mt-4">
                        <Input
                            placeholder="Buscar..."
                            classNames={{
                                inputWrapper: "bg-default-100",
                                input: "text-sm",
                            }}
                            size="md"
                            startContent={
                                <Magnifer
                                    size={18}
                                    weight="Outline"
                                    className="text-default-400"
                                />
                            }
                            onFocus={onSearchModalOpen}
                            readOnly
                        />
                    </div>
                ) : (
                    <div className="mt-4 flex justify-center">
                        <Tooltip content="Buscar" placement="right">
                            <Button
                                isIconOnly
                                variant="light"
                                size="md"
                                className="w-full"
                                onPress={onSearchModalOpen}
                            >
                                <Magnifer size={20} weight="Outline" />
                            </Button>
                        </Tooltip>
                    </div>
                )}
            </div>

            <Divider />

            {/* Navigation Items */}
            <ScrollArea className="flex flex-col grow h-0 overflow-y-auto p-4">
                {(() => {
                    const groups: { [key: string]: MenuItem[] } = {};
                    const groupOrder: string[] = [];

                    menuItems(tenantId as string ?? "1")
                        .filter((item) => item.enabled !== false) // Filtrar itens desabilitados
                        .forEach((item) => {
                            const group = item.group || "outros";
                            if (!groups[group]) {
                                groups[group] = [];
                                groupOrder.push(group);
                            }
                            groups[group].push(item);
                        });

                    const groupLabels: { [key: string]: string } = {
                        principal: "Principal",
                        produtos: "Produtos",
                        pessoas: "Pessoas",
                        marketing: "Marketing",
                        financeiro: "Financeiro",
                        config: "Configurações",
                    };

                    return groupOrder.map((groupKey, groupIndex) => {
                        const items = groups[groupKey];
                        return (
                            <div key={groupKey} className={groupIndex > 0 ? "mt-6" : ""}>
                                {isOpen && groupLabels[groupKey] && (
                                    <div className="px-2 mb-2">
                                        <span className="text-xs font-semibold text-default-500 uppercase tracking-wider">
                                            {groupLabels[groupKey]}
                                        </span>
                                    </div>
                                )}
                                <div className="space-y-1">
                                    {items.map((item) => (
                                        <MenuButton key={item.href} item={item} />
                                    ))}
                                </div>
                            </div>
                        );
                    });
                })()}
            </ScrollArea>

            <Divider />

            {/* Bottom Section */}
            <div className="p-4 space-y-4">
                {/* Theme Toggle */}
                {isOpen ? (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-default-100">
                        <div className="flex items-center gap-2">
                            <Sun size={18} weight="Outline" className="text-default-600" />
                            <span className="text-sm font-medium text-default-700">
                                Tema
                            </span>
                        </div>
                        <div className="flex items-center gap-2 bg-default-200 rounded-lg p-1">
                            <Button
                                size="sm"
                                variant={mounted && theme === "light" ? "solid" : "light"}
                                color={mounted && theme === "light" ? "primary" : "default"}
                                className="min-w-12 h-7 text-xs"
                                onPress={() => setTheme("light")}
                            >
                                Claro
                            </Button>
                            <Button
                                size="sm"
                                variant={(!mounted || theme === "dark") ? "solid" : "light"}
                                color={(!mounted || theme === "dark") ? "primary" : "default"}
                                className="min-w-12 h-7 text-xs"
                                onPress={() => setTheme("dark")}
                            >
                                Escuro
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <Tooltip content="Tema claro" placement="right">
                            <Button
                                isIconOnly
                                size="sm"
                                variant={mounted && theme === "light" ? "solid" : "light"}
                                color={mounted && theme === "light" ? "primary" : "default"}
                                onPress={() => setTheme("light")}
                            >
                                <Sun size={18} weight="Outline" />
                            </Button>
                        </Tooltip>
                        <Tooltip content="Tema escuro" placement="right">
                            <Button
                                isIconOnly
                                size="sm"
                                variant={(!mounted || theme === "dark") ? "solid" : "light"}
                                color={(!mounted || theme === "dark") ? "primary" : "default"}
                                onPress={() => setTheme("dark")}
                            >
                                <Moon size={18} weight="Outline" />
                            </Button>
                        </Tooltip>
                    </div>
                )}

                {/* User Profile */}
                {isOpen ? (
                    <div className="flex items-center justify-between p-2 rounded-lg">
                        <div className="flex items-center gap-3">
                            <Avatar
                                size="sm"
                                name="Usuário"
                                className="bg-primary text-primary-foreground"
                            />
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-medium text-default-900 truncate">
                                    Usuário
                                </span>
                                <span className="text-xs text-default-500 truncate">
                                    usuario@exemplo.com
                                </span>
                            </div>
                        </div>
                        <Dropdown placement="top-start">
                            <DropdownTrigger>
                                <Button
                                    isIconOnly
                                    variant="light"
                                    size="sm"
                                    className="flex-shrink-0"
                                >
                                    <MenuDots size={18} weight="Outline" />
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                aria-label="Menu do usuário"
                                onAction={(key) => {
                                    if (key === "logout") {
                                        navigate("/login");
                                    }
                                }}
                            >
                                <DropdownItem
                                    key="profile"
                                    startContent={<Avatar size="sm" name="Usuário" className="bg-primary text-primary-foreground" />}
                                >
                                    Meu Perfil
                                </DropdownItem>
                                <DropdownItem
                                    key="settings"
                                    startContent={<Settings size={18} weight="Outline" />}
                                >
                                    Configurações
                                </DropdownItem>
                                <DropdownItem
                                    key="logout"
                                    className="text-danger"
                                    color="danger"
                                    startContent={<Logout size={18} weight="Outline" />}
                                >
                                    Sair
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <Dropdown placement="top-start">
                            <DropdownTrigger>
                                <Avatar
                                    size="sm"
                                    name="Usuário"
                                    className="bg-primary text-primary-foreground cursor-pointer"
                                />
                            </DropdownTrigger>
                            <DropdownMenu
                                aria-label="Menu do usuário"
                                onAction={(key) => {
                                    if (key === "logout") {
                                        navigate("/login");
                                    }
                                }}
                            >
                                <DropdownItem
                                    key="profile"
                                    startContent={<Avatar size="sm" name="Usuário" className="bg-primary text-primary-foreground" />}
                                >
                                    Meu Perfil
                                </DropdownItem>
                                <DropdownItem
                                    key="settings"
                                    startContent={<Settings size={18} weight="Outline" />}
                                >
                                    Configurações
                                </DropdownItem>
                                <DropdownItem
                                    key="logout"
                                    className="text-danger"
                                    color="danger"
                                    startContent={<Logout size={18} weight="Outline" />}
                                >
                                    Sair
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                )}
            </div>

            {/* Search Modal */}
            <Modal
                isOpen={isSearchModalOpen}
                onOpenChange={onSearchModalOpenChange}
                backdrop="blur"
                size="2xl"
                scrollBehavior="inside"
            >
                <ModalContent>
                    {() => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <h2 className="text-2xl font-bold">Buscar Menu</h2>
                                <p className="text-sm text-default-500 font-normal">
                                    Digite para buscar nos menus disponíveis
                                </p>
                            </ModalHeader>
                            <ModalBody>
                                <div className="flex flex-col gap-4">
                                    <Input
                                        placeholder="Buscar menu..."
                                        value={searchQuery}
                                        onValueChange={setSearchQuery}
                                        classNames={{
                                            inputWrapper: "bg-default-100",
                                            input: "text-sm",
                                        }}
                                        size="lg"
                                        startContent={
                                            <Magnifer
                                                size={20}
                                                weight="Outline"
                                                className="text-default-400"
                                            />
                                        }
                                        autoFocus
                                    />
                                    <ScrollArea className="h-[400px]">
                                        <div className="flex flex-col gap-2 pr-2">
                                            {filteredMenuItems.length > 0 ? (
                                                filteredMenuItems.map((item) => {
                                                    const active = isActive(item.href);
                                                    return (
                                                        <Button
                                                            key={item.href}
                                                            className={clsx(
                                                                "w-full justify-start h-12",
                                                                active && "text-primary"
                                                            )}
                                                            variant={active ? "flat" : "light"}
                                                            color={active ? "primary" : "default"}
                                                            startContent={item.icon}
                                                            onPress={() => handleMenuClick(item.href)}
                                                        >
                                                            <div className="flex items-center justify-between w-full">
                                                                <span
                                                                    className={clsx(
                                                                        "text-sm font-medium",
                                                                        active && "text-primary font-semibold"
                                                                    )}
                                                                >
                                                                    {item.label}
                                                                </span>
                                                                {item.badge && item.badge > 0 && (
                                                                    <span className="flex min-w-[20px] h-[20px] items-center justify-center rounded-full bg-danger text-[10px] font-semibold text-white px-1.5">
                                                                        {item.badge > 99 ? "99+" : item.badge}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </Button>
                                                    );
                                                })
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                                    <Magnifer size={48} weight="Outline" className="text-default-300 mb-2" />
                                                    <p className="text-sm text-default-500">
                                                        Nenhum menu encontrado
                                                    </p>
                                                    <p className="text-xs text-default-400 mt-1">
                                                        Tente buscar com outros termos
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </div>
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </aside>
    );
}
