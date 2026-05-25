import api from "./api";
import type { GeneratedImage, GenerationJob, ApiResponse } from "@/types";
import type { GenerationType } from "@/types";

export const aiService = {
  generate: (taskId: string, type: GenerationType) =>
    api.post<ApiResponse<GenerationJob>>(`/tasks/${taskId}/generate`, { type }).then((r) => r.data),

  getJobStatus: (jobId: string) =>
    api.get<ApiResponse<GenerationJob>>(`/jobs/${jobId}/status`).then((r) => r.data),

  getTaskGenerations: (taskId: string) =>
    api.get<ApiResponse<GeneratedImage[]>>(`/tasks/${taskId}/generations`).then((r) => r.data),

  deleteGeneration: (id: string) =>
    api.delete<ApiResponse<null>>(`/generations/${id}`).then((r) => r.data),

  markFinal: (id: string) =>
    api.put<ApiResponse<GeneratedImage>>(`/generations/${id}/mark-final`).then((r) => r.data),
};
