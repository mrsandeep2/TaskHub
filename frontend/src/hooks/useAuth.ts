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
        const res = await api.get<{ data: User }>("/auth/me");
        setUser(res.data.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [setUser, setLoading]);

  const signOut = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      logout();
      window.location.href = "/auth/login";
    }
  };

  return { user, isLoading, signOut, isAdmin: user?.role === "admin" };
}
