export type UserRole = "admin" | "user";
export type TaskStatus =
  | "pending"
  | "assigned"
  | "in_progress"
  | "submitted"
  | "accepted"
  | "revision_requested";
export type GenerationStatus = "queued" | "processing" | "completed" | "failed";
export type GenerationType =
  | "white_background"
  | "theme_background_1"
  | "theme_background_2"
  | "creative_1"
  | "creative_2"
  | "model_front"
  | "model_side"
  | "model_closeup";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: UserRole;
  created_at: string;
  last_active?: string;
  app_metadata?: {
    provider?: string;
    [key: string]: any;
  };
}

export interface Task {
  id: string;
  title: string;
  description: string;
  product_image_url: string;
  status: TaskStatus;
  assigned_to?: string;
  assigned_user?: User;
  created_by: string;
  created_at: string;
  updated_at: string;
  review_comment?: string;
  submitted_at?: string;
  accepted_at?: string;
}

export interface GeneratedImage {
  id: string;
  task_id: string;
  type: GenerationType;
  image_url: string;
  status: GenerationStatus;
  is_final: boolean;
  job_id?: string;
  created_at: string;
  error_message?: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user?: User;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface DashboardStats {
  total_users: number;
  total_tasks: number;
  pending: number;
  submitted: number;
  accepted: number;
  revision_requests: number;
  ai_generation_count: number;
}

export interface GenerationJob {
  job_id: string;
  status: GenerationStatus;
  progress?: number;
  result_url?: string;
  error?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
