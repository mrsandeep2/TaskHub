import api from "./api";
import type { Task, PaginatedResponse, ApiResponse } from "@/types";

export const tasksService = {
  getAll: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<Task>>("/tasks", { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get<ApiResponse<Task>>(`/tasks/${id}`).then((r) => r.data),

  create: (data: FormData) =>
    api.post<ApiResponse<Task>>("/tasks", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data),

  update: (id: string, data: Partial<Task>) =>
    api.put<ApiResponse<Task>>(`/tasks/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/tasks/${id}`).then((r) => r.data),

  assign: (id: string, userId: string) =>
    api.post<ApiResponse<Task>>(`/tasks/${id}/assign`, { user_id: userId }).then((r) => r.data),

  start: (id: string) =>
    api.put<ApiResponse<Task>>(`/tasks/${id}/start`).then((r) => r.data),

  submit: (id: string) =>
    api.post<ApiResponse<Task>>(`/tasks/${id}/submit`).then((r) => r.data),

  accept: (id: string) =>
    api.put<ApiResponse<Task>>(`/tasks/${id}/accept`).then((r) => r.data),

  requestRevision: (id: string, comment: string) =>
    api.put<ApiResponse<Task>>(`/tasks/${id}/request-revision`, { comment }).then((r) => r.data),

  getMyTasks: () =>
    api.get<PaginatedResponse<Task>>("/my-tasks").then((r) => r.data),
};
