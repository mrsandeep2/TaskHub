"use client";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTask, useAcceptTask, useRequestRevision } from "@/hooks/useTasks";
import { useGenerations } from "@/hooks/useGenerations";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/admin";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, RotateCcw } from "lucide-react";

export default function AdminTaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: taskData } = useTask(id);
  const { data: generationsData } = useGenerations(id);
  const { data: usersData } = useQuery({ queryKey: ["admin-users"], queryFn: () => adminService.getUsers() });
  const accept = useAcceptTask();
  const requestRevision = useRequestRevision();
  const [comment, setComment] = useState("");
  const [showRevision, setShowRevision] = useState(false);

  const task = taskData?.data;
  const generations = (generationsData?.data ?? []).filter((g) => g.status === "completed");

  if (!task) return <div className="animate-pulse space-y-4"><div className="h-8 bg-muted rounded w-1/3" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin/tasks" className="h-9 w-9 rounded-xl border border-border flex items-center justify-center hover:bg-accent transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex items-center gap-3 flex-1">
          <h1 className="text-xl font-display font-bold">{task.title}</h1>
          <StatusBadge status={task.status} />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card>
            <h3 className="font-semibold mb-4 text-xs text-muted-foreground uppercase tracking-widest">Product Image</h3>
            <div className="rounded-xl overflow-hidden bg-muted aspect-square">
              <img src={task.product_image_url} alt={task.title} className="w-full h-full object-contain" />
            </div>
          </Card>
          <Card>
            <h3 className="font-semibold mb-2 text-xs text-muted-foreground uppercase tracking-widest">Task Details</h3>
            <p className="text-sm leading-relaxed">{task.description}</p>
            {task.assigned_user && (
              <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  {task.assigned_user.name.charAt(0)}
                </div>
                <span className="text-sm">{task.assigned_user.name}</span>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          {generations.length > 0 && (
            <Card>
              <h3 className="font-semibold mb-4 text-xs text-muted-foreground uppercase tracking-widest">
                Generated Images ({generations.length}/8)
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {generations.map((g) => (
                  <div key={g.id} className="aspect-square rounded-xl overflow-hidden bg-muted">
                    <img src={g.image_url} alt={g.type} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {task.status === "submitted" && (
            <Card>
              <h3 className="font-semibold mb-4 text-xs text-muted-foreground uppercase tracking-widest">Review Actions</h3>
              {!showRevision ? (
                <div className="flex gap-3">
                  <Button variant="success" className="flex-1 gap-2" loading={accept.isPending} onClick={() => accept.mutate(id)}>
                    <CheckCircle2 className="h-4 w-4" /> Accept
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2" onClick={() => setShowRevision(true)}>
                    <RotateCcw className="h-4 w-4" /> Revision
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Textarea label="Revision Notes" value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="What needs to be changed?" />
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => setShowRevision(false)}>Cancel</Button>
                    <Button className="flex-1" loading={requestRevision.isPending} onClick={() => requestRevision.mutate({ id, comment })}>Send</Button>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
