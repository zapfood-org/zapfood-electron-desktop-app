import { authClient } from "@/lib/auth-client";
import { Avatar, Button, Divider, Tab, Tabs } from "@heroui/react";
import { RoundAltArrowLeft } from "@solar-icons/react";
import { useMemo } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";

export function SettingsLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tenantId } = useParams<{ tenantId: string }>();
  const { data: organizations } = authClient.useListOrganizations();

  const organization = useMemo(() => {
    return organizations?.find((org) => org.id === tenantId);
  }, [organizations, tenantId]);

  // Determinar qual tab está ativa baseado na URL
  const getActiveTab = () => {
    const path = location.pathname || location.hash.replace("#", "");
    if (path.includes("/opening-hours")) return "opening-hours";
    if (path.includes("/printers")) return "printers";
    if (path.includes("/members")) return "members";
    if (path.includes("/coupons")) return "coupons";
    if (path.includes("/invoices")) return "invoices";
    if (path.includes("/whatsapp")) return "whatsapp";
    if (path.includes("/danger-zone")) return "danger-zone";
    return "general";
  };

  return (
    <div className="flex flex-col h-full w-full bg-default-100 dark:bg-default-10 overflow-hidden">
      <div className="flex flex-col bg-background">
        <div className="flex flex-col">
          <div className="flex items-center gap-3 py-3 max-w-7xl mx-auto w-full">
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onPress={() => navigate("/companies")}
              aria-label="Voltar"
            >
              <RoundAltArrowLeft size={20} weight="Outline" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <div className="flex items-center gap-2">
                  <Avatar
                    src={organization?.logo || undefined}
                    name={organization?.name || ""}
                  />
                  <div className="flex flex-col">
                    <span className="text-lg font-semibold text-default-700">
                      {organization?.name}
                    </span>
                    <span className="text-xs text-default-500 font-mono">
                      @{organization?.slug}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Divider />

          <div className="flex flex-col max-w-7xl mx-auto w-full">
            <Tabs
              aria-label="Navegação de configurações"
              variant="underlined"
              color="primary"
              classNames={{
                tabList: "py-4",
              }}
              selectedKey={getActiveTab()}
              onSelectionChange={(key) => {
                const value = String(key);
                if (!tenantId) return;

                if (value === "general") {
                  navigate(`/companies/settings/${tenantId}`);
                }
                if (value === "opening-hours") {
                  navigate(`/companies/settings/${tenantId}/opening-hours`);
                }
                if (value === "printers") {
                  navigate(`/companies/settings/${tenantId}/printers`);
                }
                if (value === "members") {
                  navigate(`/companies/settings/${tenantId}/members`);
                }
                if (value === "coupons") {
                  navigate(`/companies/settings/${tenantId}/coupons`);
                }
                if (value === "invoices") {
                  navigate(`/companies/settings/${tenantId}/invoices`);
                }
                if (value === "whatsapp") {
                  navigate(`/companies/settings/${tenantId}/whatsapp`);
                }
                if (value === "danger-zone") {
                  navigate(`/companies/settings/${tenantId}/danger-zone`);
                }
              }}
            >
              <Tab key="general" title="Geral" />
              <Tab key="opening-hours" title="Horário de funcionamento" />
              <Tab key="printers" title="Impressoras" />
              <Tab key="members" title="Membros" />
              <Tab key="coupons" title="Cupons" />
              <Tab key="invoices" title="Faturas" />
              <Tab key="whatsapp" title="WhatsApp" />
              <Tab key="danger-zone" title="Zona de Perigo" />
            </Tabs>
          </div>
        </div>
        <Divider />
      </div>

      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
