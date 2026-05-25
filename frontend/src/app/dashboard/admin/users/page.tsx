"use client";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/admin";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelative } from "@/utils/format";
import { motion } from "framer-motion";
import { TableRowSkeleton } from "@/components/ui/skeleton";

export default function UsersPage() {
  const { data, isLoading } = useQuery({ queryKey: ["admin-users"], queryFn: () => adminService.getUsers() });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground text-sm mt-0.5">{data?.total ?? 0} registered users</p>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-medium">All Users</h3>
        </div>
        {isLoading ? (
          <div>{Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)}</div>
        ) : (
          <div className="divide-y divide-border">
            {(data?.data ?? []).map((user, i) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <Badge variant={user.role === "admin" ? "info" : "default"} className="capitalize">
                  {user.role}
                </Badge>
                {user.last_active && (
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    Active {formatRelative(user.last_active)}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
