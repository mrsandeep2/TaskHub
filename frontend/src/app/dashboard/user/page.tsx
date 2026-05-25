"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Clock, CheckCircle2, RotateCcw, Eye } from "lucide-react";
import Link from "next/link";
import { useMyTasks } from "@/hooks/useTasks";
import { StatusBadge } from "@/components/ui/badge";
import { CardSkeleton } from "@/components/ui/skeleton";

const STATUS_TABS: { value: string; label: string; icon: React.ReactNode }[] = [
  { value: "", label: "All", icon: null },
  { value: "assigned", label: "To Do", icon: <Clock className="h-3.5 w-3.5" /> },
  { value: "in_progress", label: "In Progress", icon: <Zap className="h-3.5 w-3.5" /> },
  { value: "submitted", label: "Submitted", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  { value: "accepted", label: "Accepted", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  { value: "revision_requested", label: "Revision", icon: <RotateCcw className="h-3.5 w-3.5" /> },
];

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState("");
  const { data, isLoading } = useMyTasks();
  const tasks = (data?.data ?? []).filter(t => !activeTab || t.status === activeTab);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight">My Tasks</h1>
        <p className="text-muted-foreground text-sm">{data?.total ?? 0} tasks assigned to you</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Task cards */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="glass-card p-4 space-y-3">
            <div className="aspect-video rounded-lg bg-muted animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
          </div>)}
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-16">
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="font-semibold">No tasks here</p>
          <p className="text-sm text-muted-foreground mt-1">
            {activeTab ? "No tasks with this status" : "You have no assigned tasks yet"}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className="aspect-video bg-muted overflow-hidden">
                {task.product_image_url ? (
                  <img src={task.product_image_url} alt={task.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Zap className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-sm line-clamp-2">{task.title}</p>
                  <StatusBadge status={task.status} />
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                {task.review_comment && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-2.5">
                    <p className="text-xs text-orange-700 dark:text-orange-400">{task.review_comment}</p>
                  </div>
                )}
                <Link
                  href={`/dashboard/user/tasks/${task.id}`}
                  className="flex items-center justify-center gap-2 h-8 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-accent transition-colors w-full"
                >
                  <Eye className="h-3.5 w-3.5" /> Open Task
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
