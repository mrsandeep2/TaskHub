"use client";
import { useState } from "react";
import { useTasks, useAcceptTask, useRequestRevision } from "@/hooks/useTasks";
import { useGenerations } from "@/hooks/useGenerations";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { CheckCircle2, RotateCcw, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Task } from "@/types";

function ReviewPanel({ task }: { task: Task }) {
  const [comment, setComment] = useState("");
  const [showRevision, setShowRevision] = useState(false);
  const { data: generationsData } = useGenerations(task.id);
  const accept = useAcceptTask();
  const requestRevision = useRequestRevision();
  const generations = generationsData?.data?.filter(g => g.status === "completed") ?? [];

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Original Product</h3>
        <div className="rounded-2xl overflow-hidden bg-muted aspect-square max-w-xs">
          <img src={task.product_image_url} alt={task.title} className="w-full h-full object-contain" />
        </div>
        <div className="space-y-1">
          <p className="font-semibold">{task.title}</p>
          <p className="text-sm text-muted-foreground">{task.description}</p>
          {task.assigned_user && <p className="text-xs text-muted-foreground">By: {task.assigned_user.name}</p>}
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Generated Images ({generations.length}/8)
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {generations.map(g => (
            <div key={g.id} className="aspect-square rounded-xl overflow-hidden bg-muted">
              <img src={g.image_url} alt={g.type} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
        <div className="space-y-3 pt-2">
          {!showRevision ? (
            <div className="flex gap-3">
              <Button variant="success" className="flex-1 gap-2" loading={accept.isPending} onClick={() => accept.mutate(task.id)}>
                <CheckCircle2 className="h-4 w-4" /> Accept
              </Button>
              <Button variant="outline" className="flex-1 gap-2" onClick={() => setShowRevision(true)}>
                <RotateCcw className="h-4 w-4" /> Request Revision
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Textarea label="Revision Notes" value={comment} onChange={e => setComment(e.target.value)} placeholder="Describe what needs to be changed..." rows={3} />
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowRevision(false)}>Cancel</Button>
                <Button className="flex-1" loading={requestRevision.isPending} onClick={() => requestRevision.mutate({ id: task.id, comment })}>
                  Send Revision
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReviewsPage() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { data, isLoading } = useTasks({ status: "submitted" });
  const tasks = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight">Reviews</h1>
        <p className="text-muted-foreground text-sm">{tasks.length} submissions awaiting review</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Submissions</h3>
          {tasks.length === 0 && !isLoading && (
            <Card className="text-center py-8">
              <CheckCircle2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No pending reviews</p>
            </Card>
          )}
          {tasks.map(task => (
            <motion.button
              key={task.id}
              onClick={() => setSelectedTask(task)}
              className={`w-full text-left glass-card p-4 hover:shadow-md transition-all duration-200 ${selectedTask?.id === task.id ? "ring-2 ring-primary" : ""}`}
            >
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted shrink-0">
                  <img src={task.product_image_url} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{task.title}</p>
                  <p className="text-xs text-muted-foreground">{task.assigned_user?.name}</p>
                  <StatusBadge status={task.status} />
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
            </motion.button>
          ))}
        </div>

        <div className="lg:col-span-2">
          {selectedTask ? (
            <Card>
              <ReviewPanel task={selectedTask} />
            </Card>
          ) : (
            <Card className="flex items-center justify-center h-64 text-center">
              <div>
                <CheckCircle2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium">Select a submission to review</p>
                <p className="text-sm text-muted-foreground mt-1">Click on a task from the list</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
