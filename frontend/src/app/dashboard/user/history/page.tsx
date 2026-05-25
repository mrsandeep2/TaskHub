"use client";
import { useMyTasks } from "@/hooks/useTasks";
import { StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/utils/format";
import { motion } from "framer-motion";

export default function HistoryPage() {
  const { data } = useMyTasks();
  const accepted = (data?.data ?? []).filter((t) => t.status === "accepted");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight">History</h1>
        <p className="text-muted-foreground text-sm">{accepted.length} completed tasks</p>
      </div>
      <div className="space-y-3">
        {accepted.map((task, i) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="glass-card p-4 flex items-center gap-4"
          >
            <div className="h-12 w-12 rounded-xl overflow-hidden bg-muted shrink-0">
              <img src={task.product_image_url} alt={task.title} className="h-full w-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{task.title}</p>
              <p className="text-xs text-muted-foreground">{formatDate(task.accepted_at || task.updated_at)}</p>
            </div>
            <StatusBadge status={task.status} />
          </motion.div>
        ))}
        {accepted.length === 0 && (
          <Card className="text-center py-12">
            <p className="text-muted-foreground text-sm">No completed tasks yet</p>
          </Card>
        )}
      </div>
    </div>
  );
}
