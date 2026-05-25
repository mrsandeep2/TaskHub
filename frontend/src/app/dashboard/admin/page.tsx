"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LayoutDashboard, Users, ListTodo, CheckCircle2, RotateCcw, Zap, Clock } from "lucide-react";
import { adminService } from "@/services/admin";
import { tasksService } from "@/services/tasks";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { TaskTable } from "@/components/dashboard/TaskTable";
import { CardSkeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreateTaskModal } from "@/components/tasks/CreateTaskModal";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const mockChartData = [
  { day: "Mon", tasks: 4, generated: 12 },
  { day: "Tue", tasks: 7, generated: 18 },
  { day: "Wed", tasks: 5, generated: 15 },
  { day: "Thu", tasks: 9, generated: 28 },
  { day: "Fri", tasks: 12, generated: 35 },
  { day: "Sat", tasks: 6, generated: 22 },
  { day: "Sun", tasks: 3, generated: 9 },
];

export default function AdminDashboard() {
  const [createOpen, setCreateOpen] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => adminService.getStats(),
  });

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => tasksService.getAll({ per_page: 10 }),
  });

  const { data: usersData } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => adminService.getUsers(),
  });

  const s = stats?.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Overview of platform activity</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <ListTodo className="h-4 w-4 mr-2" /> New Task
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 7 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <StatsCard title="Total Users" value={s?.total_users ?? 0} icon={<Users className="h-5 w-5" />} color="blue" index={0} />
            <StatsCard title="Total Tasks" value={s?.total_tasks ?? 0} icon={<ListTodo className="h-5 w-5" />} color="purple" index={1} />
            <StatsCard title="Pending" value={s?.pending ?? 0} icon={<Clock className="h-5 w-5" />} color="yellow" index={2} />
            <StatsCard title="Accepted" value={s?.accepted ?? 0} icon={<CheckCircle2 className="h-5 w-5" />} color="green" index={3} />
            <StatsCard title="Submitted" value={s?.submitted ?? 0} icon={<LayoutDashboard className="h-5 w-5" />} color="orange" index={4} />
            <StatsCard title="Revisions" value={s?.revision_requests ?? 0} icon={<RotateCcw className="h-5 w-5" />} color="red" index={5} />
            <StatsCard title="AI Generations" value={s?.ai_generation_count ?? 0} icon={<Zap className="h-5 w-5" />} color="purple" index={6} />
          </>
        )}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Activity</CardTitle>
        </CardHeader>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockChartData}>
              <defs>
                <linearGradient id="taskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(262, 80%, 60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(262, 80%, 60%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="genGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(220, 80%, 60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(220, 80%, 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: "13px",
                }}
              />
              <Area type="monotone" dataKey="tasks" name="Tasks" stroke="hsl(262, 80%, 60%)" fill="url(#taskGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="generated" name="AI Images" stroke="hsl(220, 80%, 60%)" fill="url(#genGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Recent tasks */}
      <Card className="p-0 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <CardTitle>Recent Tasks</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary text-xs">View All →</Button>
        </div>
        <TaskTable tasks={tasksData?.data ?? []} isLoading={tasksLoading} />
      </Card>

      <CreateTaskModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        users={usersData?.data ?? []}
      />
    </div>
  );
}
