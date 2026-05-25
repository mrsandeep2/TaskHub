"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksService } from "@/services/tasks";
import toast from "react-hot-toast";

export function useTasks(params?: Record<string, string | number>) {
  return useQuery({
    queryKey: ["tasks", params],
    queryFn: () => tasksService.getAll(params),
  });
}

export function useMyTasks() {
  return useQuery({
    queryKey: ["my-tasks"],
    queryFn: () => tasksService.getMyTasks(),
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ["task", id],
    queryFn: () => tasksService.getById(id),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) => tasksService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task created successfully");
    },
    onError: () => toast.error("Failed to create task"),
  });
}

export function useAssignTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      tasksService.assign(id, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task assigned successfully");
    },
    onError: () => toast.error("Failed to assign task"),
  });
}

export function useSubmitTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksService.submit(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["my-tasks"] });
      toast.success("Task submitted for review");
    },
    onError: () => toast.error("Failed to submit task"),
  });
}

export function useAcceptTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksService.accept(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task accepted");
    },
    onError: () => toast.error("Failed to accept task"),
  });
}

export function useRequestRevision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) =>
      tasksService.requestRevision(id, comment),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Revision requested");
    },
    onError: () => toast.error("Failed to request revision"),
  });
}
