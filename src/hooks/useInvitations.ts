import { AUTH_URL } from "@/config/api";
import { useCallback, useEffect, useState } from "react";

type Role = "owner" | "manager" | "waiter" | "cashier";
type InvitationStatus = "pending" | "accepted" | "canceled";

export interface Invitation {
  id: string;
  email: string;
  role: Role;
  status: InvitationStatus;
  expiresAt: string;
  organizationId: string;
  [key: string]: unknown;
}

export function useInvitations(organizationId?: string) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchInvitations = useCallback(async () => {
    if (!organizationId) {
      setInvitations([]);
      return;
    }

    setIsPending(true);
    setError(null);
    try {
      const response = await fetch(`${AUTH_URL}/organization/list-invitations`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://zapfood.shop",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch invitations: ${response.statusText}`);
      }

      const data = await response.json();
      // Filtrar invitations apenas da organização ativa se necessário
      const filteredInvitations = Array.isArray(data)
        ? data.filter(
            (inv: Invitation) => inv.organizationId === organizationId
          )
        : [];
      setInvitations(filteredInvitations);
    } catch (err) {
      console.error("Error fetching invitations:", err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
      setInvitations([]);
    } finally {
      setIsPending(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  return {
    data: invitations,
    isPending,
    error,
    refetch: fetchInvitations,
  };
}
