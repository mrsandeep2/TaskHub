"use client";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ZoomIn, Maximize2, RefreshCw, Star, Trash2,
  ArrowLeft, Zap, CheckCircle2, AlertCircle, Clock, Send
} from "lucide-react";
import Link from "next/link";
import { useTask, useSubmitTask } from "@/hooks/useTasks";
import { useGenerations, useGenerate, useDeleteGeneration, useMarkFinal } from "@/hooks/useGenerations";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { GENERATION_TYPES } from "@/constants";
import type { GenerationType, GeneratedImage } from "@/types";
import { cn } from "@/utils/cn";

// ── Generation type card ──────────────────────────────────────
function GenTypeCard({
  typeKey, label, description, generation, onGenerate, onRegenerate, onDelete, onMarkFinal, onFullscreen,
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
}) {
  const status = generation?.status;
  const isProcessing = status === "queued" || status === "processing";
  const isFailed = status === "failed";
  const isDone = status === "completed";

  return (
    <div
      className={cn(
        "glass-card overflow-hidden group transition-all duration-200",
        generation?.is_final && "ring-2 ring-primary shadow-lg shadow-primary/20"
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
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {generation.is_final && (
              <div className="absolute top-2 right-2 z-10">
                <span className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full font-medium shadow">
                  <Star className="h-3 w-3 fill-current" /> Final
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
              <button
                onClick={() => onFullscreen(generation.image_url)}
                className="h-8 w-8 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={onRegenerate}
                className="h-8 w-8 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={onMarkFinal}
                className={cn(
                  "h-8 w-8 rounded-xl backdrop-blur-sm flex items-center justify-center text-white transition-colors",
                  generation.is_final ? "bg-primary/80 hover:bg-primary" : "bg-white/20 hover:bg-white/30"
                )}
              >
                <Star className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={onDelete}
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
          <Button size="sm" className="w-full h-7 text-xs" onClick={onGenerate}>
            <Zap className="h-3 w-3 mr-1" /> Generate
          </Button>
        ) : isFailed ? (
          <Button size="sm" variant="outline" className="w-full h-7 text-xs" onClick={onRegenerate}>
            <RefreshCw className="h-3 w-3 mr-1" /> Retry
          </Button>
        ) : isDone ? (
          <div className="flex gap-1">
            <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={onRegenerate}>
              <RefreshCw className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant={generation?.is_final ? "default" : "outline"}
              className="flex-1 h-7 text-xs"
              onClick={onMarkFinal}
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
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
      >
        <motion.img
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          src={url}
          alt="Preview"
          className="max-w-full max-h-full rounded-2xl object-contain shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        >
          ✕
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main Studio ───────────────────────────────────────────────
function AIStudioInner() {
  const params = useSearchParams();
  const taskId = params.get("task") ?? "";
  const [fullscreenUrl, setFullscreenUrl] = useState<string | null>(null);

  const { data: taskData, isLoading: taskLoading } = useTask(taskId);
  const { data: generationsData } = useGenerations(taskId);
  const generate = useGenerate();
  const deleteGen = useDeleteGeneration();
  const markFinal = useMarkFinal();
  const submitTask = useSubmitTask();

  const task = taskData?.data;
  const generations = generationsData?.data ?? [];
  const completedCount = generations.filter((g) => g.status === "completed").length;
  const canSubmit = completedCount >= 8 && task?.status === "in_progress";

  if (!taskId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
            <Zap className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="font-semibold">No task selected</p>
          <p className="text-sm text-muted-foreground">Open AI Studio from a task page</p>
          <Link href="/dashboard/user">
            <Button variant="outline" size="sm">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleGenerate = (type: GenerationType) => {
    generate.mutate({ taskId, type });
  };

  const getGeneration = (type: GenerationType) =>
    generations.find((g) => g.type === type);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="h-16 border-b border-border bg-background/80 backdrop-blur-xl flex items-center px-6 gap-4 sticky top-0 z-40">
        <Link
          href={`/dashboard/user/tasks/${taskId}`}
          className="h-8 w-8 rounded-xl border border-border flex items-center justify-center hover:bg-accent transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shrink-0">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-sm truncate">
              AI Studio{task ? ` — ${task.title}` : ""}
            </h1>
          </div>
          {task && <StatusBadge status={task.status} />}
        </div>

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
            className="gap-2"
          >
            <Send className="h-4 w-4" /> Submit
          </Button>
        )}
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — original */}
        <aside className="w-72 border-r border-border bg-card/50 flex flex-col p-4 gap-4 overflow-y-auto shrink-0">
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              Original Product
            </h3>
            {task ? (
              <div className="rounded-xl overflow-hidden bg-muted aspect-square relative group">
                <img
                  src={task.product_image_url}
                  alt={task.title}
                  className="w-full h-full object-contain"
                />
                <button
                  onClick={() => setFullscreenUrl(task.product_image_url)}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Maximize2 className="h-6 w-6 text-white" />
                </button>
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
          <div className="space-y-1.5">
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
        <main className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
                />
              );
            })}
          </div>

          {/* Generate all button */}
          <div className="mt-6 flex justify-center">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                GENERATION_TYPES.forEach((gt) => {
                  const gen = getGeneration(gt.key as GenerationType);
                  if (!gen || gen.status === "failed") {
                    handleGenerate(gt.key as GenerationType);
                  }
                });
              }}
            >
              <Zap className="h-4 w-4" /> Generate All Missing
            </Button>
          </div>
        </main>
      </div>

      {fullscreenUrl && (
        <FullscreenView url={fullscreenUrl} onClose={() => setFullscreenUrl(null)} />
      )}
    </div>
  );
}

export default function AIStudioPage() {
  return (
    <Suspense>
      <AIStudioInner />
    </Suspense>
  );
}
