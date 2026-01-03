import { AUTH_URL } from "@/config/api";
import { useCallback, useEffect, useState } from "react";

type Role = "owner" | "manager" | "waiter" | "cashier";

interface MemberUser {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export interface Member {
  id: string;
  role: Role;
  user: MemberUser;
  createdAt: string | Date;
  organizationId: string;
}

export function useMembers(organizationId?: string) {
  const [members, setMembers] = useState<Member[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!organizationId) {
      setMembers([]);
      return;
    }

    setIsPending(true);
    setError(null);
    try {
      const response = await fetch(`${AUTH_URL}/organization/list-members`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://zapfood.shop",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch members: ${response.statusText}`);
      }

      const data = await response.json();
      // Filtrar members apenas da organização ativa se necessário
      const filteredMembers = Array.isArray(data)
        ? data.filter((member: Member) => member.organizationId === organizationId)
        : [];
      setMembers(filteredMembers);
    } catch (err) {
      console.error("Error fetching members:", err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
      setMembers([]);
    } finally {
      setIsPending(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return {
    data: members,
    isPending,
    error,
    refetch: fetchMembers,
  };
}
