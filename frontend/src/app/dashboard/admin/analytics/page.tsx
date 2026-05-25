"use client";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const weeklyData = [
  { day: "Mon", tasks: 4, images: 12, accepted: 3 },
  { day: "Tue", tasks: 7, images: 18, accepted: 5 },
  { day: "Wed", tasks: 5, images: 15, accepted: 4 },
  { day: "Thu", tasks: 9, images: 28, accepted: 8 },
  { day: "Fri", tasks: 12, images: 35, accepted: 10 },
  { day: "Sat", tasks: 6, images: 22, accepted: 5 },
  { day: "Sun", tasks: 3, images: 9, accepted: 2 },
];

const generationTypeData = [
  { name: "White BG", value: 245 },
  { name: "Theme BG", value: 312 },
  { name: "Creative", value: 198 },
  { name: "Model", value: 427 },
];

const COLORS = ["hsl(262 80% 60%)", "hsl(220 80% 60%)", "hsl(160 60% 50%)", "hsl(30 90% 55%)"];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground text-sm">Platform performance overview</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Weekly Task Activity</CardTitle></CardHeader>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(262 80% 60%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(262 80% 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }} />
                <Area type="monotone" dataKey="tasks" name="Tasks" stroke="hsl(262 80% 60%)" fill="url(#g1)" strokeWidth={2} />
                <Area type="monotone" dataKey="accepted" name="Accepted" stroke="hsl(142 72% 35%)" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>AI Generations by Type</CardTitle></CardHeader>
          <div className="h-52 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={generationTypeData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {generationTypeData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Daily AI Generation Volume</CardTitle></CardHeader>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }} />
                <Bar dataKey="images" name="Images Generated" fill="hsl(262 80% 60%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
