"use client";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { X, Upload, ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTask } from "@/hooks/useTasks";
import type { User } from "@/types";

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  users: User[];
}

export function CreateTaskModal({ open, onClose, users }: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createTask = useCreateTask();

  const onDrop = useCallback((files: File[]) => {
    const f = files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Title is required";
    if (!description.trim()) e.description = "Description is required";
    if (!file) e.file = "Product image is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const fd = new FormData();
    fd.append("title", title);
    fd.append("description", description);
    fd.append("product_image", file!);
    if (assignedTo) fd.append("assigned_to", assignedTo);
    await createTask.mutateAsync(fd);
    handleClose();
  };

  const handleClose = () => {
    setTitle(""); setDescription(""); setAssignedTo(""); setFile(null); setPreview(""); setErrors({});
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-lg glass-card p-6 space-y-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Create New Task</h2>
                <p className="text-sm text-muted-foreground">Add a product photography task</p>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={handleClose}><X className="h-4 w-4" /></Button>
            </div>

            <Input label="Task Title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Diamond Ring Collection" error={errors.title} />
            <Textarea label="Instructions" value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the photography requirements..." error={errors.description} rows={3} />

            {/* File upload */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Product Image</label>
              {preview ? (
                <div className="relative rounded-xl overflow-hidden bg-muted aspect-video">
                  <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                  <button
                    onClick={() => { setFile(null); setPreview(""); }}
                    className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragActive ? "border-primary bg-accent" : "border-border hover:border-primary/50 hover:bg-accent/50"}`}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Drop image here or click to upload</p>
                      <p className="text-xs text-muted-foreground mt-0.5">PNG, JPG, WEBP up to 10MB</p>
                    </div>
                  </div>
                </div>
              )}
              {errors.file && <p className="text-xs text-destructive">{errors.file}</p>}
            </div>

            {/* Assign user */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Assign To (optional)</label>
              <select
                value={assignedTo}
                onChange={e => setAssignedTo(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              >
                <option value="">Unassigned</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={handleClose}>Cancel</Button>
              <Button className="flex-1" loading={createTask.isPending} onClick={handleSubmit}>Create Task</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
