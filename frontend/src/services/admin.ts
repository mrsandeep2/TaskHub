import api from "./api";
import type { DashboardStats, User, AuditLog, PaginatedResponse, ApiResponse } from "@/types";

export const adminService = {
  getStats: () =>
    api.get<ApiResponse<DashboardStats>>("/admin/stats").then((r) => r.data),

  getUsers: () =>
    api.get<PaginatedResponse<User>>("/admin/users").then((r) => r.data),

  getAuditLogs: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<AuditLog>>("/admin/audit-logs", { params }).then((r) => r.data),

  getAnalytics: () =>
    api.get<ApiResponse<Record<string, unknown>>>("/admin/analytics").then((r) => r.data),
};
