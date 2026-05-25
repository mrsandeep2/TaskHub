"use client";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

interface StatsCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon: React.ReactNode;
  color?: "purple" | "blue" | "green" | "orange" | "red" | "yellow";
  trend?: { value: number; label: string };
  index?: number;
}

const colorMap = {
  purple: "from-violet-500/10 to-purple-500/10 border-violet-200 dark:border-violet-800",
  blue: "from-blue-500/10 to-cyan-500/10 border-blue-200 dark:border-blue-800",
  green: "from-green-500/10 to-emerald-500/10 border-green-200 dark:border-green-800",
  orange: "from-orange-500/10 to-amber-500/10 border-orange-200 dark:border-orange-800",
  red: "from-red-500/10 to-rose-500/10 border-red-200 dark:border-red-800",
  yellow: "from-yellow-500/10 to-amber-500/10 border-yellow-200 dark:border-yellow-800",
};

const iconColorMap = {
  purple: "text-violet-600 dark:text-violet-400",
  blue: "text-blue-600 dark:text-blue-400",
  green: "text-green-600 dark:text-green-400",
  orange: "text-orange-600 dark:text-orange-400",
  red: "text-red-600 dark:text-red-400",
  yellow: "text-yellow-600 dark:text-yellow-400",
};

export function StatsCard({
  title, value, description, icon, color = "purple", trend, index = 0
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className={cn(
        "glass-card p-5 bg-gradient-to-br",
        colorMap[color]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold font-display tracking-tight">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
          {trend && (
            <p className={cn("text-xs font-medium", trend.value >= 0 ? "text-green-600" : "text-red-500")}>
              {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <div className={cn("h-10 w-10 rounded-xl bg-background/60 flex items-center justify-center", iconColorMap[color])}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
