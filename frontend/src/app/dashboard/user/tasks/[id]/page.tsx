"use client";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Zap, CheckCircle2, Clock, Send } from "lucide-react";
import Link from "next/link";
import { useTask, useSubmitTask } from "@/hooks/useTasks";
import { useGenerations } from "@/hooks/useGenerations";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GENERATION_TYPES } from "@/constants";

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: taskData, isLoading } = useTask(id);
  const { data: generationsData } = useGenerations(id);
  const submitTask = useSubmitTask();

  const task = taskData?.data;
  const generations = generationsData?.data ?? [];
  const completedCount = generations.filter((g) => g.status === "completed").length;
  const canSubmit = completedCount >= 8 && task?.status === "in_progress";

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3" />
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="aspect-square bg-muted rounded-2xl" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!task) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/user"
          className="h-9 w-9 rounded-xl border border-border flex items-center justify-center hover:bg-accent transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1 flex items-center gap-3">
          <h1 className="text-xl font-display font-bold">{task.title}</h1>
          <StatusBadge status={task.status} />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left — product */}
        <div className="space-y-4">
          <Card>
            <h3 className="font-semibold mb-4 text-xs text-muted-foreground uppercase tracking-widest">
              Product Image
            </h3>
            <div className="rounded-xl overflow-hidden bg-muted aspect-square">
              <img
                src={task.product_image_url}
                alt={task.title}
                className="w-full h-full object-contain"
              />
            </div>
          </Card>

          {task.review_comment && (
            <Card className="border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/10">
              <h4 className="font-medium text-sm text-orange-700 dark:text-orange-400 mb-2">
                Revision Requested
              </h4>
              <p className="text-sm text-orange-600 dark:text-orange-300">{task.review_comment}</p>
            </Card>
          )}
        </div>

        {/* Right — progress */}
        <div className="space-y-4">
          <Card>
            <h3 className="font-semibold mb-3 text-xs text-muted-foreground uppercase tracking-widest">
              Instructions
            </h3>
            <p className="text-sm leading-relaxed">{task.description}</p>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-widest">
                Generation Progress
              </h3>
              <span className="text-sm font-bold">{completedCount}/8</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mb-4">
              <div
                className="bg-gradient-to-r from-violet-600 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(completedCount / 8) * 100}%` }}
              />
            </div>
            <div className="space-y-2">
              {GENERATION_TYPES.map((gt) => {
                const gen = generations.find((g) => g.type === gt.key);
                return (
                  <div key={gt.key} className="flex items-center gap-3">
                    <div
                      className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${
                        gen?.status === "completed"
                          ? "bg-green-100 dark:bg-green-900/30"
                          : gen?.status === "processing" || gen?.status === "queued"
                          ? "bg-violet-100 dark:bg-violet-900/30"
                          : "bg-muted"
                      }`}
                    >
                      {gen?.status === "completed" ? (
                        <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />
                      ) : gen?.status === "processing" || gen?.status === "queued" ? (
                        <Clock className="h-3 w-3 text-violet-600 animate-pulse" />
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{gt.label}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          <Link href={`/ai-studio?task=${id}`}>
            <Button
              className="w-full gap-2"
              disabled={task.status === "accepted"}
            >
              <Zap className="h-4 w-4" /> Open AI Studio
            </Button>
          </Link>

          {canSubmit && (
            <Button
              className="w-full gap-2"
              variant="success"
              loading={submitTask.isPending}
              onClick={() =>
                submitTask.mutateAsync(id).then(() => router.push("/dashboard/user"))
              }
            >
              <Send className="h-4 w-4" /> Submit for Review
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
