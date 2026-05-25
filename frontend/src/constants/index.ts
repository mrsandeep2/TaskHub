export const GENERATION_TYPES = [
  { key: "white_background", label: "White Background", description: "Clean product on pure white" },
  { key: "theme_background_1", label: "Theme Background A", description: "Contextual scene matching product" },
  { key: "theme_background_2", label: "Theme Background B", description: "Alternative themed setting" },
  { key: "creative_1", label: "Creative Background A", description: "Artistic, editorial look" },
  { key: "creative_2", label: "Creative Background B", description: "Dramatic artistic composition" },
  { key: "model_front", label: "Model — Front", description: "Model wearing from front" },
  { key: "model_side", label: "Model — Side (45°)", description: "Model at 45° angle" },
  { key: "model_closeup", label: "Model — Close-up", description: "Detail shot on model" },
] as const;

export const TASK_STATUS_CONFIG = {
  pending: { label: "Pending", color: "status-pending" },
  assigned: { label: "Assigned", color: "status-assigned" },
  in_progress: { label: "In Progress", color: "status-in_progress" },
  submitted: { label: "Submitted", color: "status-submitted" },
  accepted: { label: "Accepted", color: "status-accepted" },
  revision_requested: { label: "Revision Requested", color: "status-revision_requested" },
} as const;

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
