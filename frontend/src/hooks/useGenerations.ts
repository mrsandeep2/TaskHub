"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { aiService } from "@/services/ai";
import type { GenerationType } from "@/types";
import toast from "react-hot-toast";

export function useGenerations(taskId: string) {
  return useQuery({
    queryKey: ["generations", taskId],
    queryFn: () => aiService.getTaskGenerations(taskId),
    enabled: !!taskId,
    refetchInterval: (query) => {
      const data = query.state.data?.data;
      if (!data) return false;
      const hasProcessing = data.some((g) =>
        ["queued", "processing"].includes(g.status)
      );
      return hasProcessing ? 2000 : false;
    },
  });
}

export function useGenerate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, type }: { taskId: string; type: GenerationType }) =>
      aiService.generate(taskId, type),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["generations", vars.taskId] });
      toast.success("Generation started");
    },
    onError: () => toast.error("Failed to start generation"),
  });
}

export function useDeleteGeneration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => aiService.deleteGeneration(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["generations"] });
      toast.success("Image deleted");
    },
    onError: () => toast.error("Failed to delete image"),
  });
}

export function useMarkFinal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => aiService.markFinal(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["generations"] });
      toast.success("Marked as final");
    },
    onError: () => toast.error("Failed to mark as final"),
  });
}
