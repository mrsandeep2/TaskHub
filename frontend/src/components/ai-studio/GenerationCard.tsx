"use client";
import { motion } from "framer-motion";
import { RefreshCw, Trash2, Star, Maximize, Loader2, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import type { GeneratedImage } from "@/types";

interface GenerationCardProps {
  generation?: GeneratedImage;
  type: string;
  label: string;
  isGenerating?: boolean;
  onGenerate: () => void;
  onRegenerate: () => void;
  onDelete: () => void;
  onMarkFinal: () => void;
  onFullscreen?: () => void;
}

export function GenerationCard({
  generation, type, label, isGenerating,
  onGenerate, onRegenerate, onDelete, onMarkFinal, onFullscreen
}: GenerationCardProps) {
  const status = generation?.status;
  const isProcessing = status === "queued" || status === "processing" || isGenerating;
  const isFailed = status === "failed";
  const isCompleted = status === "completed";

  return (
    <div className={cn(
      "glass-card overflow-hidden group",
      generation?.is_final && "ring-2 ring-primary"
    )}>
      {/* Image area */}
      <div className="relative aspect-square bg-muted">
        {isProcessing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-2 border-muted-foreground/20" />
              <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-foreground">
                {status === "queued" ? "Queued" : "Processing"}
              </p>
              <p className="text-xs text-muted-foreground">AI is generating...</p>
            </div>
            {/* Shimmer overlay */}
            <div className="absolute inset-0 shimmer opacity-40" />
          </div>
        )}

        {isFailed && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-xs text-muted-foreground">Generation failed</p>
          </div>
        )}

        {isCompleted && generation?.image_url && (
          <>
            <img
              src={generation.image_url}
              alt={label}
              className="w-full h-full object-cover"
            />
            {generation.is_final && (
              <div className="absolute top-2 right-2">
                <span className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full font-medium">
                  <Star className="h-3 w-3" /> Final
                </span>
              </div>
            )}
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button size="icon-sm" variant="secondary" onClick={onFullscreen} aria-label="Fullscreen">
                <Maximize className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon-sm" variant="secondary" onClick={onRegenerate} aria-label="Regenerate">
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon-sm" variant="secondary" onClick={onMarkFinal} aria-label="Mark final">
                <Star className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon-sm" variant="secondary" onClick={onDelete} aria-label="Delete">
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>
          </>
        )}

        {!generation && !isProcessing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-muted-foreground/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground text-center px-2">Not generated yet</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <p className="text-xs font-medium text-foreground truncate mb-2">{label}</p>
        {!generation && !isProcessing ? (
          <Button size="sm" className="w-full text-xs h-7" onClick={onGenerate}>
            Generate
          </Button>
        ) : isFailed ? (
          <Button size="sm" variant="outline" className="w-full text-xs h-7" onClick={onRegenerate}>
            <RefreshCw className="h-3 w-3 mr-1" /> Retry
          </Button>
        ) : isCompleted ? (
          <div className="flex gap-1">
            <Button size="sm" variant="outline" className="flex-1 text-xs h-7" onClick={onRegenerate}>
              <RefreshCw className="h-3 w-3" />
            </Button>
            <Button size="sm" variant={generation?.is_final ? "default" : "outline"} className="flex-1 text-xs h-7" onClick={onMarkFinal}>
              <Star className="h-3 w-3" />
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
