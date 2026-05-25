"use client";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/admin";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/utils/format";
import { motion } from "framer-motion";

export default function AuditLogsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: () => adminService.getAuditLogs({ per_page: 50 }),
  });

  const logs = data?.data ?? [];

  const actionColors: Record<string, string> = {
    create: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    update: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    delete: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    assign: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
    submit: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    accept: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground text-sm">Complete record of platform activity</p>
      </div>

      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">No audit logs yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {logs.map((log, i) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-start gap-4 p-4 hover:bg-muted/20 transition-colors"
              >
                <div className="relative mt-1">
                  <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                  {i < logs.length - 1 && (
                    <div className="absolute top-4 left-[3px] w-0.5 h-full -bottom-4 bg-border" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{log.user?.name || "System"}</span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        actionColors[log.action] || "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {log.action}
                    </span>
                    <span className="text-sm text-muted-foreground">{log.entity_type}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatDateTime(log.created_at)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
