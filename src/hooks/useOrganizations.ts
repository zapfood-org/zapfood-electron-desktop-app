import { AUTH_URL } from "@/config/api";
import { useCallback, useEffect, useState } from "react";

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  createdAt: string;
  metadata?: string;
  [key: string]: unknown;
}

export function useOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isPending, setIsPending] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOrganizations = useCallback(async () => {
    setIsPending(true);
    setError(null);
    try {
      const response = await fetch(`${AUTH_URL}/organization/list`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://zapfood.shop",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch organizations: ${response.statusText}`);
      }

      const data = await response.json();
      setOrganizations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching organizations:", err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
      setOrganizations([]);
    } finally {
      setIsPending(false);
    }
  }, []);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  return {
    data: organizations,
    isPending,
    error,
    refetch: fetchOrganizations,
  };
}
