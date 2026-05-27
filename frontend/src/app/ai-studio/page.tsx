"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ZoomIn, Maximize2, RefreshCw, Star, Trash2,
  ArrowLeft, Zap, CheckCircle2, AlertCircle, Clock, Send, X, Eye
} from "lucide-react";
import Link from "next/link";
import { useTask, useSubmitTask, useMyTasks, useStartTask, useDeclineTask } from "@/hooks/useTasks";
import { useGenerations, useGenerate, useDeleteGeneration, useMarkFinal, useGenerateAll } from "@/hooks/useGenerations";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { GENERATION_TYPES } from "@/constants";
import type { GenerationType, GeneratedImage } from "@/types";
import { cn } from "@/utils/cn";

// ── Generation type card ──────────────────────────────────────
function GenTypeCard({
  typeKey, label, description, generation, onGenerate, onRegenerate, onDelete, onMarkFinal, onFullscreen, disabled,
}: {
  typeKey: GenerationType;
  label: string;
  description: string;
  generation?: GeneratedImage;
  onGenerate: () => void;
  onRegenerate: () => void;
  onDelete: () => void;
  onMarkFinal: () => void;
  onFullscreen: (url: string) => void;
  disabled?: boolean;
}) {
  const status = generation?.status;
  const isProcessing = status === "queued" || status === "processing";
  const isFailed = status === "failed";
  const isDone = status === "completed";

  return (
    <div
      className={cn(
        "glass-card overflow-hidden group transition-all duration-200",
        generation?.is_final && "ring-2 ring-primary shadow-lg shadow-primary/20",
        disabled && "opacity-75"
      )}
    >
      {/* Image area */}
      <div className="relative aspect-square bg-muted overflow-hidden">
        {isProcessing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted z-10">
            <div className="relative h-12 w-12">
              <div className="absolute inset-0 rounded-full border-2 border-muted-foreground/20" />
              <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">
              {status === "queued" ? "Queued…" : "Processing…"}
            </p>
            <div className="absolute inset-0 shimmer opacity-30" />
          </div>
        )}

        {isFailed && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-xs text-muted-foreground">Failed</p>
          </div>
        )}

        {isDone && generation?.image_url && (
          <>
            <img
              src={generation.image_url}
              alt={label}
              className={cn(
                "w-full h-full object-cover group-hover:scale-105 transition-transform duration-300",
                !disabled && "cursor-zoom-in"
              )}
              onClick={() => !disabled && onFullscreen(generation.image_url)}
            />
            {generation.is_final && (
              <div className="absolute top-2 right-2 z-10">
                <span className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full font-medium shadow">
                  <Star className="h-3 w-3 fill-current" /> Final
                </span>
              </div>
            )}
            <div
              onClick={() => !disabled && onFullscreen(generation.image_url)}
              className={cn(
                "absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 cursor-zoom-in",
                disabled && "hidden"
              )}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFullscreen(generation.image_url);
                }}
                className="h-8 w-8 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRegenerate();
                }}
                className="h-8 w-8 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkFinal();
                }}
                className={cn(
                  "h-8 w-8 rounded-xl backdrop-blur-sm flex items-center justify-center text-white transition-colors",
                  generation.is_final ? "bg-primary/80 hover:bg-primary" : "bg-white/20 hover:bg-white/30"
                )}
              >
                <Star className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="h-8 w-8 rounded-xl bg-white/20 hover:bg-red-500/60 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </>
        )}

        {!generation && !isProcessing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-muted-foreground/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground text-center px-3">Not generated</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <p className="text-xs font-semibold text-foreground truncate mb-1">{label}</p>
        <p className="text-xs text-muted-foreground truncate mb-2">{description}</p>

        {!generation && !isProcessing ? (
          <Button size="sm" className="w-full h-7 text-xs" onClick={onGenerate} disabled={disabled}>
            <Zap className="h-3 w-3 mr-1" /> Generate
          </Button>
        ) : isFailed ? (
          <Button size="sm" variant="outline" className="w-full h-7 text-xs" onClick={onRegenerate} disabled={disabled}>
            <RefreshCw className="h-3 w-3 mr-1" /> Retry
          </Button>
        ) : isDone ? (
          <div className="flex gap-1">
            <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={onRegenerate} disabled={disabled}>
              <RefreshCw className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant={generation?.is_final ? "default" : "outline"}
              className="flex-1 h-7 text-xs"
              onClick={onMarkFinal}
              disabled={disabled}
            >
              <Star className="h-3 w-3" />
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ── Fullscreen overlay ────────────────────────────────────────
function FullscreenView({ url, onClose }: { url: string; onClose: () => void }) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [coords, setCoords] = useState({ x: 50, y: 50 });

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    e.stopPropagation();
    if (isZoomed) {
      setIsZoomed(false);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setCoords({ x, y });
      setIsZoomed(true);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out select-none"
      >
        <div className="relative max-w-full max-h-full overflow-hidden rounded-2xl flex items-center justify-center">
          <motion.img
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ 
              scale: isZoomed ? 2.2 : 1, 
              opacity: 1,
              transformOrigin: isZoomed ? `${coords.x}% ${coords.y}%` : "center center"
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            src={url}
            alt="Preview"
            className={cn(
              "max-w-[90vw] max-h-[85vh] rounded-xl object-contain shadow-2xl transition-shadow duration-300",
              isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
            )}
            onClick={handleImageClick}
          />
        </div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors border border-white/10"
        >
          ✕
        </button>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-xs text-white/80 border border-white/10 font-medium">
          {isZoomed ? "Click image to zoom out" : "Click image to zoom in (HD details)"}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main Studio ───────────────────────────────────────────────
function AIStudioInner() {
  const params = useSearchParams();
  const router = useRouter();
  const taskId = params.get("task") ?? "";
  const [fullscreenUrl, setFullscreenUrl] = useState<string | null>(null);

  const { user, isLoading, isAdmin } = useAuth();
  const { data: myTasksData, isLoading: myTasksLoading } = useMyTasks();
  const { data: taskData, isLoading: taskLoading } = useTask(taskId);
  const { data: generationsData } = useGenerations(taskId);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth/login?redirect=/ai-studio");
    }
  }, [user, isLoading, router]);

  const startTask = useStartTask();
  const declineTask = useDeclineTask();
  const generate = useGenerate();
  const generateAll = useGenerateAll();
  const deleteGen = useDeleteGeneration();
  const markFinal = useMarkFinal();
  const submitTask = useSubmitTask();

  const task = taskData?.data;
  const generations = generationsData?.data ?? [];
  const completedCount = generations.filter((g) => g.status === "completed").length;
  const canSubmit = completedCount >= 8 && task?.status === "in_progress";
  const isGenerating =
    generateAll.isPending ||
    (generations.length > 0 &&
      generations.some((g) => ["queued", "processing"].includes(g.status)));

  if (isLoading || (taskLoading && taskId)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  // Case 1: No Task Selected - Show list of assigned tasks
  if (!taskId) {
    const userTasks = myTasksData?.data ?? [];
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Link
              href={isAdmin ? "/dashboard/admin" : "/dashboard/user"}
              className="h-9 w-9 rounded-xl border border-border flex items-center justify-center hover:bg-accent transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shrink-0">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-display font-bold">AI Studio Tasks</h1>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Assigned Tasks</h2>
            <p className="text-muted-foreground text-xs mt-0.5">
              Select an accepted task to enter the AI Studio or accept pending tasks to get started.
            </p>
          </div>

          {myTasksLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="glass-card p-5 space-y-4 animate-pulse">
                  <div className="aspect-video rounded-xl bg-muted" />
                  <div className="h-5 bg-muted rounded w-2/3" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-8 bg-muted rounded w-full" />
                </div>
              ))}
            </div>
          ) : userTasks.length === 0 ? (
            <div className="text-center py-16 glass-card">
              <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="font-semibold text-foreground">No tasks assigned</p>
              <p className="text-sm text-muted-foreground mt-1">
                You do not have any photography tasks assigned to your account.
              </p>
              <Link href={isAdmin ? "/dashboard/admin" : "/dashboard/user"} className="inline-block mt-4">
                <Button variant="outline" size="sm">Go to Dashboard</Button>
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userTasks.map((t) => (
                <div
                  key={t.id}
                  className="glass-card overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col h-full"
                >
                  <div className="aspect-video bg-muted overflow-hidden relative">
                    <img
                      src={t.product_image_url}
                      alt={t.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <StatusBadge status={t.status} />
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                    <div className="space-y-2">
                      <h3 className="font-bold text-base leading-tight line-clamp-1">{t.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {t.description}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2">
                      {t.status === "assigned" ? (
                        <div className="flex gap-2">
                          <Button
                            className="flex-1 text-xs h-9 gap-1.5"
                            variant="success"
                            loading={startTask.isPending && startTask.variables === t.id}
                            onClick={() => startTask.mutate(t.id)}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Accept
                          </Button>
                          <Button
                            className="flex-1 text-xs h-9 gap-1.5"
                            variant="destructive"
                            loading={declineTask.isPending && declineTask.variables === t.id}
                            onClick={() => declineTask.mutate(t.id)}
                          >
                            <X className="h-3.5 w-3.5" /> Decline
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {(t.status === "in_progress" || t.status === "revision_requested") && (
                            <Button
                              className={cn(
                                "w-full text-xs h-9 gap-1.5 font-medium transition-all duration-300",
                                generateAll.isPending && generateAll.variables === t.id
                                  ? "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-600 hover:to-green-600 text-white cursor-not-allowed opacity-90"
                                  : "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                              )}
                              disabled={generateAll.isPending && generateAll.variables === t.id}
                              onClick={() => generateAll.mutate(t.id)}
                            >
                              {generateAll.isPending && generateAll.variables === t.id ? (
                                <>
                                  <svg className="animate-spin h-3.5 w-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                  </svg>
                                  Img generating wait...
                                </>
                              ) : (
                                <>
                                  <Zap className="h-3.5 w-3.5" /> Generate 8 Images
                                </>
                              )}
                            </Button>
                          )}
                          <Link href={`/ai-studio?task=${t.id}`} className="w-full">
                            <Button variant="outline" className="w-full text-xs h-9 gap-1.5">
                              <Eye className="h-3.5 w-3.5" /> Open Workspace
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // Case 2: Task Selected but Not Accepted
  if (task && task.status === "assigned") {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Link
              href={isAdmin ? `/dashboard/admin/tasks/${taskId}` : `/dashboard/user/tasks/${taskId}`}
              className="h-9 w-9 rounded-xl border border-border flex items-center justify-center hover:bg-accent transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shrink-0">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-display font-bold truncate">AI Studio — {task.title}</h1>
            </div>
          </div>

          <div className="flex items-center justify-center py-12">
            <div className="max-w-md w-full glass-card p-8 text-center space-y-6">
              <div className="h-16 w-16 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto text-primary">
                <Zap className="h-8 w-8 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold tracking-tight">Accept Task to Unlock AI Studio</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  You must accept this task before generating any premium AI product photography.
                </p>
              </div>
              <div className="flex gap-4">
                <Button
                  className="flex-1 gap-2 h-10"
                  variant="success"
                  loading={startTask.isPending}
                  onClick={() => startTask.mutate(taskId)}
                >
                  <CheckCircle2 className="h-4 w-4" /> Accept Task
                </Button>
                <Button
                  className="flex-1 gap-2 h-10"
                  variant="destructive"
                  loading={declineTask.isPending}
                  onClick={() => declineTask.mutate(taskId)}
                >
                  <X className="h-4 w-4" /> Decline Task
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const handleGenerate = (type: GenerationType) => {
    generate.mutate({ taskId, type });
  };

  const getGeneration = (type: GenerationType) =>
    generations.find((g) => g.type === type);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <Link
              href={isAdmin ? `/dashboard/admin/tasks/${taskId}` : `/dashboard/user/tasks/${taskId}`}
              className="h-9 w-9 rounded-xl border border-border flex items-center justify-center hover:bg-accent transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shrink-0">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-display font-bold truncate">
                AI Studio{task ? ` — ${task.title}` : ""}
              </h1>
              {task && <StatusBadge status={task.status} />}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Progress pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-sm font-medium">
              <div className="relative h-4 w-4">
                <svg className="h-4 w-4 -rotate-90" viewBox="0 0 16 16">
                  <circle cx="8" cy="8" r="6" fill="none" stroke="hsl(var(--muted))" strokeWidth="2.5" />
                  <circle
                    cx="8"
                    cy="8"
                    r="6"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2.5"
                    strokeDasharray={`${(completedCount / 8) * 37.7} 37.7`}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <span>{completedCount}/8 complete</span>
            </div>

            {canSubmit && (
              <Button
                size="sm"
                variant="success"
                loading={submitTask.isPending}
                onClick={() => submitTask.mutate(taskId)}
                className="gap-2 h-9 px-4"
              >
                <Send className="h-4 w-4" /> Submit
              </Button>
            )}
          </div>
        </div>

        <div className="flex gap-6 lg:flex-row flex-col">
          {/* Left panel — original */}
          <aside className="w-full lg:w-72 border border-border bg-card/50 rounded-2xl flex flex-col p-5 gap-5 shrink-0">
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                Original Product
              </h3>
              {task ? (
                <div
                  onClick={() => setFullscreenUrl(task.product_image_url)}
                  className="rounded-xl overflow-hidden bg-muted aspect-square relative group cursor-zoom-in"
                >
                  <img
                    src={task.product_image_url}
                    alt={task.title}
                    className="w-full h-full object-contain"
                  />
                  <div
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-zoom-in"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFullscreenUrl(task.product_image_url);
                      }}
                      className="h-10 w-10 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition-colors border border-white/10"
                    >
                      <Maximize2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="aspect-square rounded-xl bg-muted animate-pulse" />
              )}
            </div>

            {task && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  Task Info
                </h3>
                <p className="text-sm font-medium">{task.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{task.description}</p>
              </div>
            )}

            {/* Progress list */}
            <div className="space-y-1.5 border-t border-border pt-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                Progress
              </h3>
              {GENERATION_TYPES.map((gt) => {
                const gen = getGeneration(gt.key as GenerationType);
                return (
                  <div key={gt.key} className="flex items-center gap-2">
                    <div
                      className={cn(
                        "h-4 w-4 rounded-full flex items-center justify-center shrink-0",
                        gen?.status === "completed"
                          ? "bg-green-100 dark:bg-green-900/30"
                          : gen?.status === "processing" || gen?.status === "queued"
                          ? "bg-violet-100 dark:bg-violet-900/30"
                          : "bg-muted"
                      )}
                    >
                      {gen?.status === "completed" ? (
                        <CheckCircle2 className="h-2.5 w-2.5 text-green-600 dark:text-green-400" />
                      ) : gen?.status === "processing" || gen?.status === "queued" ? (
                        <Clock className="h-2.5 w-2.5 text-violet-600 animate-pulse" />
                      ) : gen?.status === "failed" ? (
                        <AlertCircle className="h-2.5 w-2.5 text-destructive" />
                      ) : (
                        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground truncate">{gt.label}</span>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Main grid */}
          <div className="flex-1 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {GENERATION_TYPES.map((gt) => {
                const type = gt.key as GenerationType;
                const gen = getGeneration(type);
                return (
                  <GenTypeCard
                    key={type}
                    typeKey={type}
                    label={gt.label}
                    description={gt.description}
                    generation={gen}
                    onGenerate={() => handleGenerate(type)}
                    onRegenerate={() => handleGenerate(type)}
                    onDelete={() => gen && deleteGen.mutate(gen.id)}
                    onMarkFinal={() => gen && markFinal.mutate(gen.id)}
                    onFullscreen={(url) => setFullscreenUrl(url)}
                    disabled={isGenerating}
                  />
                );
              })}
            </div>

            {/* Generate all button */}
            <div className="flex flex-col items-center gap-2 border-t border-border/55 pt-6">
              <Button
                size="lg"
                className={cn(
                  "gap-2 font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg scale-105 hover:scale-110 active:scale-95",
                  isGenerating
                    ? "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-600 hover:to-green-600 text-white cursor-not-allowed opacity-90 shadow-emerald-500/20"
                    : "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white hover:shadow-violet-500/20"
                )}
                disabled={isGenerating}
                onClick={() => generateAll.mutate(taskId)}
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Img generating wait...
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 fill-current animate-pulse" /> Generate 8 Images (1-Click)
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Generates all 8 premium photography angles using AI Studio
              </p>
            </div>
          </div>
        </div>
      </div>

      {fullscreenUrl && (
        <FullscreenView url={fullscreenUrl} onClose={() => setFullscreenUrl(null)} />
      )}
    </DashboardLayout>
  );
}

export default function AIStudioPage() {
  return (
    <Suspense>
      <AIStudioInner />
    </Suspense>
  );
}
