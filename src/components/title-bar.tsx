"use client";

import {
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import {
  CloseCircle,
  MaximizeSquareMinimalistic,
  MinimizeSquareMinimalistic,
  MinusSquare,
} from "@solar-icons/react";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import packageJson from "../../package.json";
import { useActiveOrganization } from "../hooks/useActiveOrganization";
import { useStoreStatus } from "../hooks/useStoreStatus";
import { ManagerPasswordModal } from "./auth/ManagerPasswordModal";

export function TitleBar() {
  const { tenantId } = useParams();
  const location = useLocation();
  const { data: activeOrg } = useActiveOrganization();
  const [isMaximized, setIsMaximized] = useState(false);
  const [dateTime, setDateTime] = useState(new Date());
  const { isOpen, overrideStatus } = useStoreStatus(tenantId);

  // Mostrar informações do restaurante apenas quando houver tenantId na URL
  // (ou seja, quando estiver em uma página de restaurante selecionado)
  const shouldShowRestaurantInfo =
    !!tenantId &&
    !location.pathname.includes("/login") &&
    !location.pathname.includes("/companies");
  const companyName = shouldShowRestaurantInfo ? activeOrg?.name || "" : "";
  // checkStatus logic removed, replaced by hook

  // We still need local state for dateTime as it's UI specific
  // isOpen and overrideStatus come from hook

  // Local state for password modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [pendingStatusKey, setPendingStatusKey] = useState<React.Key | null>(
    null
  );

  const handleStatusSelect = (key: React.Key) => {
    setPendingStatusKey(key);
    setIsPasswordModalOpen(true);
  };

  const handlePasswordSuccess = () => {
    if (!tenantId || !pendingStatusKey) return;

    if (pendingStatusKey === "auto") {
      localStorage.removeItem(`zapfood_status_override_${tenantId}`);
    } else {
      localStorage.setItem(
        `zapfood_status_override_${tenantId}`,
        pendingStatusKey as string
      );
    }

    // Dispatch storage event to force hook update across windows/components
    window.dispatchEvent(new Event("storage"));

    setPendingStatusKey(null);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setDateTime(new Date());
    }, 1000); // Update every second

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    // Verificar se está maximizado ao montar
    if (typeof window !== "undefined" && window.electron) {
      window.electron?.window?.isMaximized()?.then(setIsMaximized);
    }
  }, []);

  const handleMinimize = () => {
    if (typeof window !== "undefined" && window.electron) {
      window.electron.window.minimize();
    }
  };

  const handleMaximize = async () => {
    if (typeof window !== "undefined" && window.electron) {
      await window.electron.window.maximize();
      const maximized = await window.electron.window.isMaximized();
      setIsMaximized(maximized);
    }
  };

  const handleClose = () => {
    if (typeof window !== "undefined" && window.electron) {
      window.electron.window.close();
    }
  };

  return (
    <>
      <ManagerPasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={handlePasswordSuccess}
        description="É necessário senha de gerente para alterar o status manualmente."
      />

      <div
        className="flex items-center justify-between h-8 bg-default-100 border-b border-default-200 drag-region"
        style={
          {
            WebkitAppRegion: "drag",
          } as React.CSSProperties
        }
      >
        {/* Lado esquerdo - Logo/Título */}
        <div className="flex items-center gap-2 px-3 select-none">
          <span className="text-sm font-semibold text-default-700 flex items-center gap-2">
            ZapFood
            <span className="text-xs font-normal text-default-400">
              v{packageJson.version}
            </span>
            {companyName && (
              <>
                <span className="font-normal text-default-500">
                  - {companyName}
                </span>
                <Chip
                  size="sm"
                  color="success"
                  variant="flat"
                  className="h-5 text-xs"
                >
                  Freemium
                </Chip>
              </>
            )}
          </span>
        </div>

        {/* Info Central/Direita */}
        {companyName && (
          <div className="flex-1 flex items-center justify-end gap-3 px-4">
            <span className="text-xs font-mono text-default-600">
              {dateTime.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}{" "}
              •{" "}
              {dateTime.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
            <div
              className="no-drag"
              style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
            >
              <Dropdown>
                <DropdownTrigger>
                  <Chip
                    size="sm"
                    color={isOpen ? "success" : "danger"}
                    variant="solid"
                    className="text-xs text-white border-0 pl-1 cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    {isOpen ? "Aberto" : "Fechado"}
                    {overrideStatus && " (Manual)"}
                  </Chip>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Alterar status"
                  onAction={handleStatusSelect}
                  disabledKeys={["info"]}
                >
                  <DropdownItem key="info">
                    Abre às:{" "}
                    {new Date().toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </DropdownItem>
                  {!isOpen ? (
                    <DropdownItem key="open">Abrir agora</DropdownItem>
                  ) : (
                    <DropdownItem key="closed">Fechar agora</DropdownItem>
                  )}
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
        )}

        {/* Lado direito - Botões de controle */}
        <div
          className="flex items-center h-full no-drag"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          <button
            onClick={handleMinimize}
            className="h-full px-4 hover:bg-default-200 transition-colors flex items-center justify-center"
            title="Minimizar"
          >
            <MinusSquare
              size={16}
              weight="Outline"
              className="text-default-700"
            />
          </button>

          <button
            onClick={handleMaximize}
            className="h-full px-4 hover:bg-default-200 transition-colors flex items-center justify-center"
            title={isMaximized ? "Restaurar" : "Maximizar"}
          >
            {isMaximized ? (
              <MinimizeSquareMinimalistic
                size={16}
                weight="Outline"
                className="text-default-700"
              />
            ) : (
              <MaximizeSquareMinimalistic
                size={16}
                weight="Outline"
                className="text-default-700"
              />
            )}
          </button>

          <button
            onClick={handleClose}
            className="h-full px-4 hover:bg-danger transition-colors flex items-center justify-center group"
            title="Fechar"
          >
            <CloseCircle
              size={16}
              weight="Outline"
              className="text-default-700 group-hover:text-white"
            />
          </button>
        </div>
      </div>
    </>
  );
}
