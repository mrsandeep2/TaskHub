"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, Trash2, UserPlus, Edit, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/utils/format";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableRowSkeleton } from "@/components/ui/skeleton";
import type { Task } from "@/types";

interface TaskTableProps {
  tasks: Task[];
  isLoading?: boolean;
  onDelete?: (id: string) => void;
  onAssign?: (task: Task) => void;
}

export function TaskTable({ tasks, isLoading, onDelete, onAssign }: TaskTableProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-0">
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRowSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="font-semibold text-foreground">No tasks yet</p>
        <p className="text-sm text-muted-foreground mt-1">Create your first task to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Task</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Assigned To</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Created</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task, i) => (
            <motion.tr
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors group"
            >
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  {task.product_image_url && (
                    <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted shrink-0">
                      <img src={task.product_image_url} alt="" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-sm">{task.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{task.description}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4">
                {task.assigned_user ? (
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                      {task.assigned_user.name.charAt(0)}
                    </div>
                    <span className="text-sm">{task.assigned_user.name}</span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Unassigned</span>
                )}
              </td>
              <td className="py-3 px-4">
                <StatusBadge status={task.status} />
              </td>
              <td className="py-3 px-4 text-sm text-muted-foreground">
                {formatDate(task.created_at)}
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/dashboard/admin/tasks/${task.id}`}>
                    <Button variant="ghost" size="icon-sm" aria-label="View">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  {!task.assigned_to && (
                    <Button variant="ghost" size="icon-sm" onClick={() => onAssign?.(task)} aria-label="Assign">
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon-sm" onClick={() => onDelete?.(task.id)} aria-label="Delete">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
