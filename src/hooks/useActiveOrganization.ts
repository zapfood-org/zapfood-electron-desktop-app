import { authClient } from "@/lib/auth-client";
import { useMemo } from "react";
import { useParams } from "react-router-dom";

interface Organization {
  id: string;
  name: string;
  slug?: string;
  [key: string]: unknown;
}

export function useActiveOrganization() {
  const { tenantId } = useParams();
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();

  const activeOrg = useMemo(() => {
    // Se ainda está carregando a sessão, retornar null
    if (isSessionPending) {
      return null;
    }

    // Determinar o ID da organização
    const orgId = tenantId || session?.activeOrganizationId;

    if (!orgId) {
      return null;
    }

    // Tentar obter o nome da organização do localStorage (armazenado quando selecionada)
    let orgName = "";
    try {
      const storedName = localStorage.getItem(`zapfood_org_name_${orgId}`);
      if (storedName) {
        orgName = storedName;
      }
    } catch (error) {
      // Ignorar erros de localStorage
      console.error("Erro ao acessar localStorage:", error);
    }

    // Retornar uma organização mínima com o ID e nome (se disponível)
    return {
      id: orgId,
      name: orgName,
      slug: tenantId || undefined,
    } as Organization;
  }, [tenantId, session?.activeOrganizationId, isSessionPending]);

  return {
    data: activeOrg,
    isPending: isSessionPending,
  };
}
