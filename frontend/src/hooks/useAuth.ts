"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import api from "@/services/api";
import type { User } from "@/types";

export function useAuth() {
  const { user, isLoading, setUser, setLoading, logout } = useAuthStore();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("access_token")
            : null;

        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }

        const res = await api.get<{ data: User }>("/auth/me");
        setUser(res.data.data);
      } catch {
        setUser(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [setUser, setLoading]);

  const signOut = async () => {
    try {
      const { createClient } = await import("@/lib/supabase");
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {}
    finally {
      logout();
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
      }
      window.location.href = "/auth/login";
    }
  };

  return { user, isLoading, signOut, isAdmin: user?.role === "admin" };
}
