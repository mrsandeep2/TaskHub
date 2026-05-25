# TaskHub — AI Product Photography Platform

TaskHub is a production-grade SaaS platform combining **Task Management** with an **AI-Powered Product Photography Studio**. It allows administrators to assign tasks and designers to generate studio-quality product photos using Stability AI (SDXL image-to-image) while preserving product consistency.

### 🔗 Live Project Links
* **Live Web Application:** [https://task-hub-omega-seven.vercel.app](https://task-hub-omega-seven.vercel.app)
* **Live API Backend:** [https://taskhub-production-94ae.up.railway.app](https://taskhub-production-94ae.up.railway.app)
* **Backend Health Status:** [https://taskhub-production-94ae.up.railway.app/health](https://taskhub-production-94ae.up.railway.app/health)

---

## 🏗️ System Architecture

```mermaid
graph TD
    Client[Next.js 14 Frontend<br/>Vercel] -->|API Requests| API[Flask REST API<br/>Railway]
    API -->|Read/Write| DB[(Supabase Postgres)]
    API -->|Async Job| Redis[(Redis Queue)]
    Redis -->|Process Job| Worker[Celery Worker]
    Worker -->|Image Generation| Stability[Stability AI API]
    Worker -->|Background Removal| Rembg[rembg Library]
    Worker -->|Upload Output| Storage[(Supabase Storage)]
    Worker -->|Update Status| DB
```

---

## 🔄 How It Works (Workflow Lifecycle)

The platform is designed around a collaborative workflow between **Administrators** (who manage tasks) and **Designers/Users** (who generate the photography).

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    actor Designer
    participant System as TaskHub System (Flask & Celery)
    
    Admin->>System: Create task & upload product image
    System-->>Designer: Assign task & send email notification
    Designer->>System: Open AI Studio & generate 8 photos
    System->>System: Run background removal & SDXL img2img pipeline
    Designer->>System: Choose final photo selections & Submit task
    System-->>Admin: Send review notification
    alt Approved
        Admin->>System: Accept Task (Complete)
    else Revisions Requested
        Admin->>System: Request Revision with feedback
        System-->>Designer: Move task back to 'In Progress'
    end
```

### Step-by-Step Workflow:
1. **Task Creation:** Admin uploads a raw product photo, writes guidelines, assigns it to a designer, and the system sends an email alert.
2. **AI Generation:** The designer opens the **AI Studio** for that task, generating 8 different variations (e.g. white background, model wearing, lifestyle scene).
3. **Fidelity Preservation:** The backend removes the background (`rembg`) and runs Stability AI SDXL (`img2img` at `0.30`-`0.40` strength) to keep the product identical while shifting the surroundings.
4. **Submission:** The designer selects the best images as final outputs and submits them to the admin.
5. **Review & Approval:** The admin compares the original vs. final images side-by-side. The admin can either **Accept** the task or **Request Revision** with feedback comments to send it back to the designer.

---

## 🌟 Key Features

* **Task Management & Workflow:** Clear status transitions (`pending` ➔ `assigned` ➔ `in_progress` ➔ `submitted` ➔ `accepted`/`revision_requested`).
* **AI Photography Studio:** Automatically generates 8 distinct product photography variations (white background, themed scenes, creative angles, and model wear).
* **Product Consistency Pipeline:** Implements image-to-image (img2img) at low strength and background removal (`rembg`) to preserve exact product outlines.
* **Admin Review System:** Interactive dashboard to compare original vs. generated photos and accept or request revisions.
* **Secure Auth Integration:** Implements Google and GitHub OAuth 2.0 via Supabase with custom JWT validation.
* **Email Notifications:** Transactional emails for task assignment and submission status using the Resend SDK.

---

## 🛠️ Technology Stack

* **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Zustand, React Query, Framer Motion
* **Backend API:** Python, Flask, Celery, Redis
* **Database & Auth:** Supabase (PostgreSQL, Storage, Row Level Security)
* **AI Integration:** Stability AI & `rembg` (background removal)
* **Mailing Service:** Resend API
