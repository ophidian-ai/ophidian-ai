# Prospect-to-Client Onboarding Pipeline -- Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Automate the full pipeline from signed proposal to onboarded client -- account creation, signed PDF, invoicing, project kickoff.

**Architecture:** Hybrid approach. Server-side (Vercel) handles instant client-facing actions triggered by proposal signing. Iris handles deferred internal tasks (ClickUp, folder scaffolding, tracker updates) on next session. Shared onboarding service extracted from existing admin client creation code.

**Tech Stack:** Next.js 16, TypeScript 5, Supabase (Postgres + Auth + RLS), Stripe (invoices + coupons + webhooks), Resend (email), pdf-lib (PDF generation), Vercel (hosting)

**Spec:** `docs/superpowers/specs/2026-03-11-prospect-to-client-onboarding-pipeline-design.md`

**Codebase root:** `engineering/projects/ophidian-ai/`

**Note:** No test framework (vitest/jest) is configured. Steps use manual verification via browser, Supabase dashboard, and Stripe dashboard instead of automated tests. If a test framework is added later, backfill tests per component.

---

## Chunk 1: Database Migration & Types

### Task 1: Create the database migration

**Files:**

- Create: `supabase/migrations/20260311000000_proposal_signing_and_onboarding.sql`

- [ ] **Step 1: Create migration file**

Write the migration SQL. This adds the `revision_requested` enum value, new columns on `proposals`, new columns on `clients`, new tables (`proposal_revisions`, `pending_iris_tasks`), and updated RLS policies.

```sql
-- Add revision_requested to proposal_status enum
ALTER TYPE proposal_status ADD VALUE IF NOT EXISTS 'revision_requested';

-- Add signing and signature columns to proposals
ALTER TABLE proposals
  ADD COLUMN IF NOT EXISTS signing_token_hash text UNIQUE,
  ADD COLUMN IF NOT EXISTS signing_token_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS typed_name text,
  ADD COLUMN IF NOT EXISTS user_agent text,
  ADD COLUMN IF NOT EXISTS document_hash text;

-- Add prospect status and missing columns to clients
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_status_check;
ALTER TABLE clients ADD CONSTRAINT clients_status_check
  CHECK (status IN ('active', 'inactive', 'prospect'));

ALTER TABLE clients ADD COLUMN IF NOT EXISTS contact_name text;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS onboarding_step text;

-- Proposal revisions table
CREATE TABLE IF NOT EXISTS proposal_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  requested_by uuid REFERENCES auth.users(id),
  message text NOT NULL,
  requested_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

ALTER TABLE proposal_revisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY proposal_revisions_select_client ON proposal_revisions
  FOR SELECT USING (
    proposal_id IN (SELECT id FROM proposals WHERE client_id IN (SELECT my_client_ids()))
  );

CREATE POLICY proposal_revisions_insert_client ON proposal_revisions
  FOR INSERT WITH CHECK (
    proposal_id IN (SELECT id FROM proposals WHERE client_id IN (SELECT my_client_ids()) AND status = 'sent')
  );

CREATE POLICY proposal_revisions_admin ON proposal_revisions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Pending Iris tasks table
CREATE TABLE IF NOT EXISTS pending_iris_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  error_message text,
  retry_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE pending_iris_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY pending_iris_tasks_admin ON pending_iris_tasks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Update RLS policy for proposals to allow revision_requested
DROP POLICY IF EXISTS proposals_update_client ON proposals;
CREATE POLICY proposals_update_client ON proposals
  FOR UPDATE USING (client_id IN (SELECT my_client_ids()) AND status = 'sent')
  WITH CHECK (status IN ('approved', 'declined', 'revision_requested'));
```

- [ ] **Step 2: Apply the migration**

Run: `npx supabase db push` from the project root, or apply via Supabase MCP `apply_migration` tool.

Verify in Supabase dashboard:
- `proposals` table has new columns: `signing_token_hash`, `signing_token_expires_at`, `typed_name`, `user_agent`, `document_hash`
- `clients` table has new columns: `contact_name`, `phone`, `onboarding_step`
- `clients.status` accepts `'prospect'`
- `proposal_revisions` table exists with RLS policies
- `pending_iris_tasks` table exists with RLS policies

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260311000000_proposal_signing_and_onboarding.sql
git commit -m "feat: add proposal signing and onboarding migration"
```

### Task 2: Update TypeScript types

**Files:**

- Modify: `src/lib/supabase/types.ts`

- [ ] **Step 1: Add new types and update existing ones**

Add `'revision_requested'` to `ProposalStatus`. Add `'prospect'` to client status. Add new fields to `Proposal` and `Client` interfaces. Add `ProposalContent`, `ProposalRevision`, and `PendingIrisTask` interfaces.

Open `src/lib/supabase/types.ts` and make these changes:

1. Update `ProposalStatus` type (currently line 17):

```typescript
// Before:
export type ProposalStatus = "draft" | "sent" | "approved" | "declined";
// After:
export type ProposalStatus = "draft" | "sent" | "revision_requested" | "approved" | "declined";
```

2. Add to `Proposal` interface (after `approved_by_ip` field, around line 93):

```typescript
  signing_token_hash: string | null;
  signing_token_expires_at: string | null;
  typed_name: string | null;
  user_agent: string | null;
  document_hash: string | null;
```

3. Add to `Client` interface (after existing fields, around line 44):

```typescript
  contact_name: string | null;
  phone: string | null;
  onboarding_step: string | null;
```

4. Update client `status` field type in `Client` interface:

```typescript
// Before:
  status: "active" | "inactive";
// After:
  status: "active" | "inactive" | "prospect";
```

5. Add new interfaces at the end of the file:

```typescript
export interface ProposalContent {
  scope: string;
  timeline: string;
  deliverables: string[];
  discounts: Array<{
    code: string;
    label: string;
    amount: number;
  }>;
  basePrice: number;
  finalPrice: number;
}

export interface ProposalRevision {
  id: string;
  proposal_id: string;
  requested_by: string | null;
  message: string;
  requested_at: string;
  resolved_at: string | null;
}

export interface PendingIrisTask {
  id: string;
  task_type: string;
  payload: Record<string, unknown>;
  status: "pending" | "completed" | "failed";
  error_message: string | null;
  retry_count: number;
  created_at: string;
  completed_at: string | null;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit` from the project root.
Expected: No new type errors. Existing code should still compile since all new fields are nullable/optional.

- [ ] **Step 3: Commit**

```bash
git add src/lib/supabase/types.ts
git commit -m "feat: add proposal signing and onboarding types"
```

---

## Chunk 2: Shared Onboarding Service

### Task 3: Create the signing token utility

**Files:**

- Create: `src/lib/signing-tokens.ts`

- [ ] **Step 1: Write the signing token utility**

This module handles token generation, hashing, and validation. Used by proposal send and proposal sign flows.

```typescript
import crypto from "crypto";

export function generateSigningToken(): {
  token: string;
  hash: string;
  expiresAt: Date;
} {
  const token = crypto.randomBytes(32).toString("hex");
  const hash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  return { token, hash, expiresAt };
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function isTokenExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return true;
  return new Date(expiresAt) < new Date();
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/signing-tokens.ts
git commit -m "feat: add signing token utility"
```

### Task 4: Create the signed PDF generator

**Files:**

- Create: `src/lib/signed-pdf.ts`

- [ ] **Step 1: Install pdf-lib**

Run: `npm install pdf-lib`

- [ ] **Step 2: Write the signed PDF generator**

This module takes proposal content and signature data, generates a PDF with the proposal details and a signature block at the bottom.

```typescript
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

interface SignatureData {
  typedName: string;
  signedAt: string;
  ipAddress: string;
  documentHash: string;
}

interface ProposalPdfData {
  clientName: string;
  companyName: string;
  scope: string;
  timeline: string;
  deliverables: string[];
  basePrice: number;
  discounts: Array<{ label: string; amount: number }>;
  finalPrice: number;
  paymentSchedule: Array<{ milestone: string; amount: number; percentage: number }>;
}

export async function generateSignedPdf(
  proposal: ProposalPdfData,
  signature: SignatureData
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

  const page = doc.addPage([612, 792]); // US Letter
  const { height } = page.getSize();
  let y = height - 50;
  const margin = 50;
  const lineHeight = 16;

  // Helper to draw text
  const drawText = (text: string, options: { bold?: boolean; size?: number; indent?: number } = {}) => {
    const f = options.bold ? boldFont : font;
    const size = options.size || 11;
    const x = margin + (options.indent || 0);
    page.drawText(text, { x, y, size, font: f, color: rgb(0.1, 0.1, 0.1) });
    y -= lineHeight;
  };

  // Header
  drawText("OphidianAI -- Project Proposal", { bold: true, size: 18 });
  y -= 10;
  drawText(`Prepared for: ${proposal.clientName} (${proposal.companyName})`, { size: 12 });
  y -= 20;

  // Scope
  drawText("Scope", { bold: true, size: 14 });
  drawText(proposal.scope);
  y -= 10;

  // Timeline
  drawText("Timeline", { bold: true, size: 14 });
  drawText(proposal.timeline);
  y -= 10;

  // Deliverables
  drawText("Deliverables", { bold: true, size: 14 });
  for (const d of proposal.deliverables) {
    drawText(`  - ${d}`, { indent: 10 });
  }
  y -= 10;

  // Pricing
  drawText("Pricing", { bold: true, size: 14 });
  drawText(`Base Price: $${(proposal.basePrice / 100).toLocaleString()}`);
  for (const discount of proposal.discounts) {
    drawText(`${discount.label}: -$${(discount.amount / 100).toLocaleString()}`);
  }
  drawText(`Total: $${(proposal.finalPrice / 100).toLocaleString()}`, { bold: true });
  y -= 10;

  // Payment Schedule
  drawText("Payment Schedule", { bold: true, size: 14 });
  for (const ps of proposal.paymentSchedule) {
    drawText(`${ps.milestone}: $${(ps.amount / 100).toLocaleString()} (${ps.percentage}%)`);
  }
  y -= 30;

  // Signature Block
  page.drawLine({
    start: { x: margin, y },
    end: { x: 612 - margin, y },
    thickness: 1,
    color: rgb(0.7, 0.7, 0.7),
  });
  y -= 20;

  drawText("ELECTRONIC SIGNATURE", { bold: true, size: 12 });
  y -= 5;
  drawText(`Electronically signed by: ${signature.typedName}`, { bold: true });
  drawText(`Date: ${new Date(signature.signedAt).toLocaleString("en-US", { timeZone: "America/New_York" })}`);
  drawText(`IP Address: ${signature.ipAddress}`);
  drawText(`Document Hash: ${signature.documentHash}`);
  y -= 10;
  drawText("This document was electronically signed under the ESIGN Act.", { size: 9 });

  return doc.save();
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/signed-pdf.ts package.json package-lock.json
git commit -m "feat: add signed PDF generator with pdf-lib"
```

### Task 5: Extract shared onboarding service

**Files:**

- Create: `src/lib/services/onboarding.ts`
- Modify: `src/app/api/admin/clients/route.ts` (refactor to use shared service)

- [ ] **Step 1: Create the onboarding service**

This extracts the client creation logic from the existing admin route into a reusable service. It adds Stripe invoice creation and Iris task queuing.

Reference the existing admin client creation flow at `src/app/api/admin/clients/route.ts` lines 99-272 for patterns to match.

```typescript
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { Resend } from "resend";
import { notifyAdmins } from "@/lib/notifications";
import type { ServiceType } from "@/lib/supabase/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getServiceClient() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export interface OnboardClientParams {
  clientId: string;
  email: string;
  fullName: string;
  company: string;
  phone?: string;
  websiteUrl?: string;
  serviceType: ServiceType;
  monthlyAmount?: number;
  proposalId?: string;
  signedPdfBuffer?: Uint8Array;
  baseAmount: number;
  discountCodes?: string[];
  depositAmount: number;
}

export interface OnboardResult {
  userId: string;
  clientId: string;
  projectId: string;
  stripeCustomerId: string;
  invoiceId: string;
  setupLink: string;
}

export async function onboardClient(params: OnboardClientParams): Promise<OnboardResult> {
  const supabase = getServiceClient();
  const stripe = getStripe();
  const resend = getResend();

  // Track progress for retry
  const updateStep = async (step: string) => {
    await supabase
      .from("clients")
      .update({ onboarding_step: step })
      .eq("id", params.clientId);
  };

  // Step 1: Create auth user (idempotent -- check existing first)
  await updateStep("auth_user");
  const { data: existingUsers } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", params.email)
    .limit(1);

  let userId: string;

  if (existingUsers && existingUsers.length > 0) {
    userId = existingUsers[0].id;
  } else {
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: params.email,
      email_confirm: true,
      user_metadata: {
        full_name: params.fullName,
        company: params.company,
      },
    });
    if (authError) throw new Error(`Auth user creation failed: ${authError.message}`);
    userId = authUser.user.id;

    // Step 2: Create profile
    await updateStep("profile");
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: userId,
      email: params.email,
      full_name: params.fullName,
      role: "client",
      company: params.company,
      phone: params.phone || null,
      website_url: params.websiteUrl || null,
    });
    if (profileError) throw new Error(`Profile creation failed: ${profileError.message}`);
  }

  // Step 3: Update client record
  await updateStep("client_update");
  const { error: clientError } = await supabase
    .from("clients")
    .update({
      profile_id: userId,
      status: "active",
      company_name: params.company,
      contact_email: params.email,
      website_url: params.websiteUrl || null,
    })
    .eq("id", params.clientId);
  if (clientError) throw new Error(`Client update failed: ${clientError.message}`);

  // Step 4: Create client_services
  await updateStep("client_services");
  const { data: serviceData, error: serviceError } = await supabase
    .from("client_services")
    .insert({
      client_id: params.clientId,
      service_type: params.serviceType,
      status: "active",
      monthly_amount: params.monthlyAmount || null,
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (serviceError) throw new Error(`Service creation failed: ${serviceError.message}`);

  // Step 5: Create project
  await updateStep("project");
  const isWebService = params.serviceType.startsWith("web_");
  const { data: projectData, error: projectError } = await supabase
    .from("projects")
    .insert({
      client_id: params.clientId,
      client_service_id: serviceData.id,
      name: `${params.company} Website`,
      status: "active",
      phase: isWebService ? "discovery" : null,
      phase_updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (projectError) throw new Error(`Project creation failed: ${projectError.message}`);

  // Step 6: Create project milestones (for web services)
  if (isWebService) {
    await updateStep("milestones");
    const phases = ["discovery", "design", "development", "review", "live"] as const;
    const milestones = phases.map((phase) => ({
      project_id: projectData.id,
      phase,
      title: phase.charAt(0).toUpperCase() + phase.slice(1),
      description: `${phase.charAt(0).toUpperCase() + phase.slice(1)} phase`,
    }));
    const { error: milestoneError } = await supabase
      .from("project_milestones")
      .insert(milestones);
    if (milestoneError) throw new Error(`Milestone creation failed: ${milestoneError.message}`);
  }

  // Step 7: Generate account setup link
  await updateStep("setup_link");
  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email: params.email,
  });
  if (linkError) throw new Error(`Setup link generation failed: ${linkError.message}`);

  const setupUrl = new URL("/auth/callback", process.env.NEXT_PUBLIC_SITE_URL);
  setupUrl.searchParams.set("token_hash", linkData.properties.hashed_token);
  setupUrl.searchParams.set("type", "recovery");
  setupUrl.searchParams.set("next", "/account-setup");
  const setupLink = setupUrl.toString();

  // Step 8: Send welcome email
  await updateStep("welcome_email");
  await resend.emails.send({
    from: "OphidianAI <iris@ophidianai.com>",
    to: params.email,
    subject: "Welcome to OphidianAI -- Set Up Your Account",
    html: buildWelcomeEmailHtml(params.fullName, params.company, setupLink),
  });

  // Step 9: Create Stripe customer
  await updateStep("stripe_customer");
  const customer = await stripe.customers.create({
    email: params.email,
    name: params.company,
    metadata: { client_id: params.clientId },
  });

  // Step 10: Store stripe_customer_id
  await supabase
    .from("clients")
    .update({ stripe_customer_id: customer.id })
    .eq("id", params.clientId);

  // Step 11: Create Stripe invoice
  await updateStep("stripe_invoice");
  await stripe.invoiceItems.create({
    customer: customer.id,
    amount: params.baseAmount,
    currency: "usd",
    description: `${params.company} -- Project Deposit`,
  });

  const discounts = (params.discountCodes || []).map((coupon) => ({ coupon }));
  const invoice = await stripe.invoices.create({
    customer: customer.id,
    auto_advance: true,
    collection_method: "send_invoice",
    days_until_due: 7,
    discounts: discounts.length > 0 ? discounts : undefined,
    metadata: { client_id: params.clientId, project_id: projectData.id },
  });

  // Finalize and send
  await stripe.invoices.finalizeInvoice(invoice.id);
  await stripe.invoices.sendInvoice(invoice.id);

  // Step 12: Create payments record
  await updateStep("payments_record");
  await supabase.from("payments").insert({
    client_id: params.clientId,
    client_service_id: serviceData.id,
    project_id: projectData.id,
    amount: params.depositAmount,
    milestone_label: "deposit",
    status: "pending",
    stripe_payment_intent_id: invoice.id,
  });

  // Step 13: Queue Iris tasks
  await updateStep("iris_tasks");
  const irisPayload = {
    client_id: params.clientId,
    project_id: projectData.id,
    company_name: params.company,
    service_type: params.serviceType,
  };
  const irisTasks = [
    { task_type: "clickup_board", payload: irisPayload },
    { task_type: "engineering_scaffold", payload: irisPayload },
    { task_type: "tracker_update", payload: irisPayload },
    { task_type: "decision_log", payload: irisPayload },
    { task_type: "briefing_update", payload: irisPayload },
  ];
  await supabase.from("pending_iris_tasks").insert(irisTasks);

  // Step 14: Notify admin
  await updateStep("complete");
  await notifyAdmins({
    type: "client_created",
    title: "New Client Onboarded",
    message: `${params.company} has been onboarded. Account created, invoice sent.`,
    link: `/dashboard/admin/clients`,
  });

  return {
    userId,
    clientId: params.clientId,
    projectId: projectData.id,
    stripeCustomerId: customer.id,
    invoiceId: invoice.id,
    setupLink,
  };
}

function buildWelcomeEmailHtml(name: string, company: string, setupLink: string): string {
  return `
    <div style="background: #0D1B2A; padding: 40px 20px; font-family: system-ui, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background: #1B2838; border-radius: 12px; overflow: hidden;">
        <div style="padding: 30px; text-align: center; border-bottom: 1px solid #2A3A4A;">
          <h1 style="color: #39FF14; margin: 0; font-size: 24px;">OphidianAI</h1>
        </div>
        <div style="padding: 30px; color: #E0E0E0; line-height: 1.6;">
          <p>Hi ${name},</p>
          <p>Welcome to OphidianAI! Your project for <strong>${company}</strong> is now set up and ready to go.</p>
          <p>Click the button below to set up your account and access your project dashboard:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${setupLink}" style="background: #39FF14; color: #0D1B2A; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Set Up Your Account</a>
          </div>
          <p style="color: #888; font-size: 13px;">This link expires in 24 hours. If it expires, contact us for a new one.</p>
        </div>
      </div>
    </div>
  `;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

- [ ] **Step 3: Refactor existing admin client route**

Open `src/app/api/admin/clients/route.ts`. The POST handler (lines 61-275) currently creates auth users, profiles, client records, services, and projects inline. Refactor it to:

1. Keep the existing input validation and admin verification
2. Create the prospect client record (new)
3. Call `onboardClient()` from the shared service
4. Return the same response shape as before

This is a large refactor -- read the existing file carefully before modifying. The key is that the existing admin form creates clients from scratch, while the onboarding service expects an existing client record. The admin route should create the client record first, then delegate to the service.

- [ ] **Step 4: Verify admin client creation still works**

Open browser to `https://ophidianai.com/dashboard/admin/clients`. Attempt to create a test client. Verify the flow completes without errors. Check Supabase for the new records.

- [ ] **Step 5: Commit**

```bash
git add src/lib/services/onboarding.ts src/app/api/admin/clients/route.ts
git commit -m "feat: extract shared onboarding service from admin client creation"
```

---

## Chunk 3: Proposal API Routes

### Task 6: Create proposal creation API (admin)

**Files:**

- Create: `src/app/api/admin/proposals/route.ts`

- [ ] **Step 1: Write the admin proposal CRUD route**

GET returns all proposals (with client info). POST creates a new proposal + prospect client record.

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getServiceClient() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Reuse admin verification pattern from src/app/api/admin/clients/route.ts
async function verifyAdmin(req: NextRequest) {
  const { createServerClient } = await import("@supabase/ssr");
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => req.cookies.getAll().map((c) => ({ name: c.name, value: c.value })) } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") return null;
  return user;
}

export async function GET(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("proposals")
    .select("*, clients(company_name, contact_name, contact_email)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { contact_name, contact_email, company_name, phone, content, payment_schedule } = body;

  if (!contact_name || !contact_email || !company_name) {
    return NextResponse.json({ error: "contact_name, contact_email, and company_name are required" }, { status: 400 });
  }

  const supabase = getServiceClient();

  // Create prospect client record
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .insert({
      name: company_name,
      company_name,
      contact_name,
      contact_email,
      phone: phone || null,
      status: "prospect",
    })
    .select("id")
    .single();

  if (clientError) return NextResponse.json({ error: clientError.message }, { status: 500 });

  // Create proposal
  const { data: proposal, error: proposalError } = await supabase
    .from("proposals")
    .insert({
      client_id: client.id,
      content: content || {},
      payment_schedule: payment_schedule || [],
      status: "draft",
    })
    .select("id")
    .single();

  if (proposalError) return NextResponse.json({ error: proposalError.message }, { status: 500 });

  return NextResponse.json({ client_id: client.id, proposal_id: proposal.id }, { status: 201 });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/admin/proposals/route.ts
git commit -m "feat: add admin proposal CRUD API route"
```

### Task 7: Create proposal send API (admin)

**Files:**

- Create: `src/app/api/admin/proposals/[id]/send/route.ts`

- [ ] **Step 1: Write the send route**

This generates a signing token, updates status to `sent`, and emails the prospect.

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { generateSigningToken } from "@/lib/signing-tokens";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getServiceClient() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Same verifyAdmin as other admin routes
async function verifyAdmin(req: NextRequest) {
  const { createServerClient } = await import("@supabase/ssr");
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => req.cookies.getAll().map((c) => ({ name: c.name, value: c.value })) } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") return null;
  return user;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = getServiceClient();

  // Fetch proposal with client
  const { data: proposal, error } = await supabase
    .from("proposals")
    .select("*, clients(contact_email, contact_name, company_name)")
    .eq("id", id)
    .single();

  if (error || !proposal) return NextResponse.json({ error: "Proposal not found" }, { status: 404 });

  if (proposal.status !== "draft" && proposal.status !== "revision_requested") {
    return NextResponse.json({ error: `Cannot send proposal with status: ${proposal.status}` }, { status: 400 });
  }

  // Generate signing token
  const { token, hash, expiresAt } = generateSigningToken();

  // Update proposal
  const { error: updateError } = await supabase
    .from("proposals")
    .update({
      status: "sent",
      sent_at: new Date().toISOString(),
      signing_token_hash: hash,
      signing_token_expires_at: expiresAt.toISOString(),
    })
    .eq("id", id);

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  // Build proposal review URL
  const reviewUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/proposals/${id}?token=${token}`;

  // Send email
  const resend = new Resend(process.env.RESEND_API_KEY);
  const client = proposal.clients;

  await resend.emails.send({
    from: "OphidianAI <iris@ophidianai.com>",
    to: client.contact_email,
    subject: "Your proposal from OphidianAI is ready for review",
    html: `
      <div style="background: #0D1B2A; padding: 40px 20px; font-family: system-ui, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background: #1B2838; border-radius: 12px; overflow: hidden;">
          <div style="padding: 30px; text-align: center; border-bottom: 1px solid #2A3A4A;">
            <h1 style="color: #39FF14; margin: 0; font-size: 24px;">OphidianAI</h1>
          </div>
          <div style="padding: 30px; color: #E0E0E0; line-height: 1.6;">
            <p>Hi ${client.contact_name},</p>
            <p>Your proposal for <strong>${client.company_name}</strong> is ready for review.</p>
            <p>Click the button below to review the details, request changes, or approve:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${reviewUrl}" style="background: #39FF14; color: #0D1B2A; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Review Proposal</a>
            </div>
            <p style="color: #888; font-size: 13px;">This link expires in 7 days.</p>
          </div>
        </div>
      </div>
    `,
  });

  return NextResponse.json({ success: true, sent_at: new Date().toISOString() });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/admin/proposals/[id]/send/route.ts
git commit -m "feat: add proposal send API with signing token generation"
```

### Task 8: Refactor proposal signing route

**Files:**

- Modify: `src/app/api/proposals/[id]/approve/route.ts` (rename to sign route, or create new)
- Create: `src/app/api/proposals/[id]/sign/route.ts`

- [ ] **Step 1: Create the signing route**

This replaces the existing simple approval with the full signing + onboarding flow. The existing `/api/proposals/[id]/approve/route.ts` can remain for backwards compatibility or be removed.

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { hashToken, isTokenExpired } from "@/lib/signing-tokens";
import { generateSignedPdf } from "@/lib/signed-pdf";
import { onboardClient } from "@/lib/services/onboarding";
import { Resend } from "resend";
import type { ProposalContent } from "@/lib/supabase/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getServiceClient() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { token, typed_name, agreed } = body;

  if (!token || !typed_name || !agreed) {
    return NextResponse.json({ error: "token, typed_name, and agreed are required" }, { status: 400 });
  }

  const supabase = getServiceClient();

  // Validate token
  const tokenHash = hashToken(token);
  const { data: proposal, error } = await supabase
    .from("proposals")
    .select("*, clients(id, contact_email, contact_name, company_name, phone, website_url)")
    .eq("id", id)
    .eq("signing_token_hash", tokenHash)
    .single();

  if (error || !proposal) {
    return NextResponse.json({ error: "Invalid or expired link" }, { status: 403 });
  }

  if (proposal.status !== "sent") {
    return NextResponse.json({ error: "Proposal is not in a signable state" }, { status: 400 });
  }

  if (isTokenExpired(proposal.signing_token_expires_at)) {
    return NextResponse.json({ error: "This link has expired. Please contact OphidianAI for a new one." }, { status: 410 });
  }

  // Record signature
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";
  const documentHash = crypto
    .createHash("sha256")
    .update(JSON.stringify(proposal.content))
    .digest("hex");

  const { error: updateError } = await supabase
    .from("proposals")
    .update({
      status: "approved",
      typed_name,
      approved_at: new Date().toISOString(),
      approved_by_ip: ip,
      user_agent: userAgent,
      document_hash: documentHash,
      signing_token_hash: null,
      signing_token_expires_at: null,
    })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: "Failed to record signature" }, { status: 500 });
  }

  // Generate signed PDF
  const content = proposal.content as ProposalContent;
  const client = proposal.clients;
  const pdfBytes = await generateSignedPdf(
    {
      clientName: client.contact_name,
      companyName: client.company_name,
      scope: content.scope || "",
      timeline: content.timeline || "",
      deliverables: content.deliverables || [],
      basePrice: content.basePrice || 0,
      discounts: (content.discounts || []).map((d) => ({ label: d.label, amount: d.amount })),
      finalPrice: content.finalPrice || 0,
      paymentSchedule: proposal.payment_schedule || [],
    },
    {
      typedName: typed_name,
      signedAt: new Date().toISOString(),
      ipAddress: ip,
      documentHash,
    }
  );

  // Email signed PDF to both parties
  const resend = new Resend(process.env.RESEND_API_KEY);
  const pdfBuffer = Buffer.from(pdfBytes);

  await resend.emails.send({
    from: "OphidianAI <iris@ophidianai.com>",
    to: [client.contact_email, "eric.lefler@ophidianai.com"],
    subject: `Signed Proposal -- ${client.company_name}`,
    html: `<p>The attached proposal has been electronically signed by ${typed_name} on ${new Date().toLocaleDateString()}.</p>`,
    attachments: [
      {
        filename: `${client.company_name.replace(/\s+/g, "-")}-Proposal-Signed.pdf`,
        content: pdfBuffer,
      },
    ],
  });

  // Determine deposit amount from payment schedule
  const schedule = proposal.payment_schedule as Array<{ milestone: string; amount: number; percentage: number }>;
  const deposit = schedule.find((s) => s.milestone === "deposit");
  const depositAmount = deposit ? deposit.amount : content.finalPrice;

  // Determine service type from proposal content
  // Default to web_professional if not specified
  const serviceType = (content as Record<string, unknown>).serviceType as string || "web_professional";

  // Run onboarding pipeline
  const result = await onboardClient({
    clientId: client.id,
    email: client.contact_email,
    fullName: client.contact_name,
    company: client.company_name,
    phone: client.phone || undefined,
    websiteUrl: client.website_url || undefined,
    serviceType: serviceType as import("@/lib/supabase/types").ServiceType,
    proposalId: id,
    signedPdfBuffer: pdfBytes,
    baseAmount: content.basePrice || 0,
    discountCodes: (content.discounts || []).map((d) => d.code),
    depositAmount,
  });

  return NextResponse.json({
    success: true,
    message: "Proposal signed successfully. You will receive your account setup email and invoice shortly.",
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/proposals/[id]/sign/route.ts
git commit -m "feat: add proposal signing route with full onboarding pipeline"
```

### Task 9: Create revision request API

**Files:**

- Create: `src/app/api/proposals/[id]/revise/route.ts`

- [ ] **Step 1: Write the revision request route**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { hashToken, isTokenExpired } from "@/lib/signing-tokens";
import { notifyAdmins } from "@/lib/notifications";
import { Resend } from "resend";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getServiceClient() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { token, message } = body;

  if (!token || !message) {
    return NextResponse.json({ error: "token and message are required" }, { status: 400 });
  }

  const supabase = getServiceClient();

  // Validate token
  const tokenHash = hashToken(token);
  const { data: proposal, error } = await supabase
    .from("proposals")
    .select("*, clients(contact_name, company_name, contact_email)")
    .eq("id", id)
    .eq("signing_token_hash", tokenHash)
    .single();

  if (error || !proposal) {
    return NextResponse.json({ error: "Invalid or expired link" }, { status: 403 });
  }

  if (proposal.status !== "sent") {
    return NextResponse.json({ error: "Proposal is not in a reviewable state" }, { status: 400 });
  }

  if (isTokenExpired(proposal.signing_token_expires_at)) {
    return NextResponse.json({ error: "This link has expired" }, { status: 410 });
  }

  // Update proposal status and nullify token
  await supabase
    .from("proposals")
    .update({
      status: "revision_requested",
      signing_token_hash: null,
      signing_token_expires_at: null,
    })
    .eq("id", id);

  // Store revision request
  await supabase.from("proposal_revisions").insert({
    proposal_id: id,
    message,
  });

  // Notify admin
  const client = proposal.clients;
  await notifyAdmins({
    type: "proposal_revision",
    title: "Proposal Revision Requested",
    message: `${client.contact_name} (${client.company_name}) requested changes: "${message.substring(0, 100)}${message.length > 100 ? "..." : ""}"`,
    link: `/dashboard/admin/proposals/${id}`,
  });

  // Email Eric
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "OphidianAI <notifications@ophidianai.com>",
    to: "eric.lefler@ophidianai.com",
    subject: `Proposal Revision Requested -- ${client.company_name}`,
    html: `
      <p><strong>${client.contact_name}</strong> from <strong>${client.company_name}</strong> has requested changes to their proposal.</p>
      <blockquote style="border-left: 3px solid #39FF14; padding-left: 12px; color: #666;">${message}</blockquote>
      <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/admin/proposals/${id}">Review in Dashboard</a></p>
    `,
  });

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/proposals/[id]/revise/route.ts
git commit -m "feat: add proposal revision request API"
```

### Task 10: Create proposal decline API

**Files:**

- Create: `src/app/api/proposals/[id]/decline/route.ts`

- [ ] **Step 1: Write the decline route**

Same pattern as revise but sets status to `declined` and stores optional reason.

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { hashToken, isTokenExpired } from "@/lib/signing-tokens";
import { notifyAdmins } from "@/lib/notifications";
import { Resend } from "resend";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getServiceClient() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { token, reason } = body;

  if (!token) {
    return NextResponse.json({ error: "token is required" }, { status: 400 });
  }

  const supabase = getServiceClient();
  const tokenHash = hashToken(token);

  const { data: proposal, error } = await supabase
    .from("proposals")
    .select("*, clients(contact_name, company_name)")
    .eq("id", id)
    .eq("signing_token_hash", tokenHash)
    .single();

  if (error || !proposal) {
    return NextResponse.json({ error: "Invalid or expired link" }, { status: 403 });
  }

  if (proposal.status !== "sent") {
    return NextResponse.json({ error: "Proposal is not in a declinable state" }, { status: 400 });
  }

  if (isTokenExpired(proposal.signing_token_expires_at)) {
    return NextResponse.json({ error: "This link has expired" }, { status: 410 });
  }

  await supabase
    .from("proposals")
    .update({
      status: "declined",
      signing_token_hash: null,
      signing_token_expires_at: null,
    })
    .eq("id", id);

  const client = proposal.clients;
  const reasonText = reason ? `: "${reason}"` : "";

  await notifyAdmins({
    type: "proposal_declined",
    title: "Proposal Declined",
    message: `${client.contact_name} (${client.company_name}) declined the proposal${reasonText}`,
    link: `/dashboard/admin/proposals/${id}`,
  });

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "OphidianAI <notifications@ophidianai.com>",
    to: "eric.lefler@ophidianai.com",
    subject: `Proposal Declined -- ${client.company_name}`,
    html: `<p><strong>${client.contact_name}</strong> from <strong>${client.company_name}</strong> has declined the proposal.${reason ? `</p><p>Reason: ${reason}` : ""}</p>`,
  });

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/proposals/[id]/decline/route.ts
git commit -m "feat: add proposal decline API"
```

---

## Chunk 4: Stripe Webhook Extension

### Task 11: Extend Stripe webhook for deposit payments

**Files:**

- Modify: `src/app/api/stripe-webhook/route.ts`

- [ ] **Step 1: Add deposit payment handler**

In the existing webhook handler, find the `invoice.paid` handler (around line 178). Add a check for `metadata.client_id` at the top of the handler to catch deposit/milestone payments before falling through to the subscription-based matching.

Add this block at the beginning of the `invoice.paid` case, before the existing subscription matching logic:

```typescript
// Check for one-off deposit/milestone payments (from onboarding pipeline)
const clientId = invoice.metadata?.client_id;
if (clientId) {
  const projectId = invoice.metadata?.project_id;

  // Find and update pending payment
  const { data: payment } = await supabase
    .from("payments")
    .select("id")
    .eq("client_id", clientId)
    .eq("status", "pending")
    .eq("milestone_label", "deposit")
    .limit(1)
    .single();

  if (payment) {
    await supabase
      .from("payments")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        stripe_payment_intent_id: invoice.payment_intent as string || invoice.id,
      })
      .eq("id", payment.id);

    // Get client info for notification
    const { data: client } = await supabase
      .from("clients")
      .select("company_name")
      .eq("id", clientId)
      .single();

    const companyName = client?.company_name || "Unknown";

    // Notify admin
    await notifyAdmins({
      type: "payment_received",
      title: "Deposit Payment Received",
      message: `${companyName} paid their deposit. Project ready for discovery.`,
      link: `/dashboard/admin/projects`,
    });

    // Email confirmation to Eric
    await resend.emails.send({
      from: "OphidianAI <notifications@ophidianai.com>",
      to: "eric.lefler@ophidianai.com",
      subject: `Deposit Received -- ${companyName}`,
      html: `<p><strong>${companyName}</strong> has paid their project deposit. The project is now ready for discovery.</p>`,
    });
  }

  // Return early -- don't fall through to subscription handling
  return NextResponse.json({ received: true });
}
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add src/app/api/stripe-webhook/route.ts
git commit -m "feat: extend Stripe webhook for deposit payment handling"
```

---

## Chunk 5: Admin Dashboard Pages

### Task 12: Create admin proposals list page

**Files:**

- Create: `src/app/dashboard/admin/proposals/page.tsx`

- [ ] **Step 1: Write the proposals list page**

Follow the pattern of existing admin pages (e.g., the clients page if it exists). Show a table of all proposals with status badges, client info, and action links.

Key UI elements:
- Status filter tabs: All, Draft, Sent, Revision Requested, Approved, Declined
- Table columns: Client, Service, Amount, Status, Sent Date, Last Updated
- Row click navigates to `/dashboard/admin/proposals/[id]`
- "Revision Requested" count badge visible on the page header

Use the existing component patterns from the dashboard (glass morphism, dark theme, OphidianAI brand colors). Reference `src/components/dashboard/sidebar.tsx` for the nav item that's already defined.

This is a client component (`"use client"`) that fetches from `/api/admin/proposals` on mount.

- [ ] **Step 2: Verify the page renders**

Navigate to `https://ophidianai.com/dashboard/admin/proposals` in the browser. Should show the empty table (no proposals yet).

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/admin/proposals/page.tsx
git commit -m "feat: add admin proposals list page"
```

### Task 13: Create admin proposal detail page

**Files:**

- Create: `src/app/dashboard/admin/proposals/[id]/page.tsx`

- [ ] **Step 1: Write the proposal detail page**

Shows the full proposal content with inline editing capability. Includes:
- Proposal content editor (scope, timeline, deliverables, pricing, discounts)
- Revision history panel (right side) showing client messages with timestamps
- Action buttons that change based on status:
  - **Draft**: "Send to Client" button (calls `/api/admin/proposals/[id]/send`)
  - **Sent**: "Waiting for client response" status indicator
  - **Revision Requested**: Edit mode enabled + "Resend to Client" button
  - **Approved**: Read-only view + "Download Signed PDF" link
  - **Declined**: Read-only view with decline reason
- Save button for edits (PATCH to proposal update route)

- [ ] **Step 2: Verify navigation and display**

Create a test proposal via the API or database, then navigate to its detail page. Verify content renders and actions work.

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/admin/proposals/[id]/page.tsx
git commit -m "feat: add admin proposal detail page with edit and send"
```

### Task 14: Create admin proposal creation page

**Files:**

- Create: `src/app/dashboard/admin/proposals/new/page.tsx`

- [ ] **Step 1: Write the creation form page**

Form fields:
- Client name, email, company, phone
- Service type dropdown (web_starter, web_professional, web_ecommerce, seo_cleanup)
- Scope (text area)
- Timeline (text input)
- Deliverables (dynamic list -- add/remove items)
- Base price (number input, in dollars)
- Discounts (checkboxes: Referral Discount $500, Religious Institution $500)
- Payment schedule (auto-calculated from service type and final price)

On submit, POST to `/api/admin/proposals`. On success, redirect to `/dashboard/admin/proposals/[id]`.

- [ ] **Step 2: Verify form submission**

Fill out the form and submit. Verify:
- Prospect client record created in `clients` table with `status: 'prospect'`
- Proposal created in `proposals` table with `status: 'draft'`
- Redirects to detail page

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/admin/proposals/new/page.tsx
git commit -m "feat: add admin proposal creation form"
```

---

## Chunk 6: Client Proposal Page

### Task 15: Create client proposal review/signing page

**Files:**

- Create: `src/app/dashboard/proposals/[id]/page.tsx`

- [ ] **Step 1: Write the client-facing proposal page**

This page is accessible via token (no login required) or via authenticated dashboard.

Key behaviors:
- If `?token=` query param is present, validate against stored hash via fetch to a read API
- If no token, require authenticated session and verify client owns the proposal
- Display full proposal content in a clean, branded layout
- Three action areas at the bottom:

**Sign & Submit section:**
- ESIGN disclosure text
- Checkbox: "I have read and agree to the terms above"
- Text input: "Type your full legal name"
- Green "Sign & Submit" button (disabled until checkbox + name filled)
- On click: POST to `/api/proposals/[id]/sign` with `{ token, typed_name, agreed: true }`

**Request Changes section:**
- "Request Changes" button (neutral styling)
- On click: expands text area + submit button
- POST to `/api/proposals/[id]/revise` with `{ token, message }`
- On success: show confirmation message

**Decline section:**
- "Decline" link (muted styling)
- On click: expands optional reason text area + confirm button
- POST to `/api/proposals/[id]/decline` with `{ token, reason }`
- On success: show confirmation message

**Post-action states:**
- After signing: "Proposal signed successfully. You'll receive your account setup email and invoice shortly."
- After revision request: "Revision request submitted. We'll update the proposal and notify you."
- After decline: "Proposal declined."
- If proposal is already approved/declined: show read-only view with status

- [ ] **Step 2: Create the proposal read API for token validation**

Create `src/app/api/proposals/[id]/route.ts` -- a GET route that accepts `?token=` query param, validates the token, and returns the proposal content (without sensitive fields like `signing_token_hash`).

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { hashToken, isTokenExpired } from "@/lib/signing-tokens";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = req.nextUrl.searchParams.get("token");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  if (token) {
    const tokenHash = hashToken(token);
    const { data: proposal, error } = await supabase
      .from("proposals")
      .select("id, content, payment_schedule, status, sent_at, clients(contact_name, company_name)")
      .eq("id", id)
      .eq("signing_token_hash", tokenHash)
      .single();

    if (error || !proposal) {
      return NextResponse.json({ error: "Invalid or expired link" }, { status: 403 });
    }

    if (isTokenExpired(proposal.sent_at)) {
      // Check signing_token_expires_at instead
    }

    return NextResponse.json(proposal);
  }

  // Authenticated path -- verify user owns this proposal
  // (implementation depends on auth middleware pattern)
  return NextResponse.json({ error: "Token required" }, { status: 401 });
}
```

- [ ] **Step 3: Test the full signing flow**

1. Create a proposal via admin dashboard
2. Send it to a test email
3. Open the review link
4. Verify the proposal renders correctly
5. Test "Sign & Submit" -- verify onboarding pipeline runs
6. Check Supabase for: auth user, profile, client (active), services, project, milestones, payments
7. Check Stripe for: customer, invoice
8. Check email for: signed PDF, welcome email, invoice

- [ ] **Step 4: Test revision and decline flows**

1. Create and send another test proposal
2. Click "Request Changes" -- verify notification sent, status updated
3. Create and send another test proposal
4. Click "Decline" -- verify notification sent, status updated

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/proposals/[id]/page.tsx src/app/api/proposals/[id]/route.ts
git commit -m "feat: add client proposal review and signing page"
```

---

## Chunk 7: Iris Deferred Tasks Skill

### Task 16: Create the client onboarding skill for Iris

**Files:**

- Create: `.claude/skills/client-onboarding/SKILL.md`

- [ ] **Step 1: Write the skill definition**

```markdown
# Client Onboarding (Deferred Tasks)

Process pending Iris tasks queued by the server-side onboarding pipeline.

## When to Use

- During morning briefing when `pending_iris_tasks` has pending/failed items
- When Eric says "process onboarding tasks", "check for new clients", "run deferred tasks"

## How It Works

1. Query `pending_iris_tasks` via Supabase MCP for `status IN ('pending', 'failed') AND retry_count < 3`
2. For each task, execute the corresponding action
3. Mark completed tasks as `completed` with `completed_at` timestamp
4. Mark failed tasks as `failed` with `error_message` and increment `retry_count`

## Task Handlers

### `clickup_board`
- Create a new folder in ClickUp under "Sales & Outreach" (folder ID: 90177398671)
- Name: `{company_name}`
- Create lists: "Discovery", "Design", "Development", "Review", "Launch"
- Use: `node .claude/skills/clickup/scripts/clickup.js`

### `engineering_scaffold`
- Create folder: `engineering/projects/{company_name_slug}/`
- Copy template from `operations/templates/client-project/`
- Update README.md with client details from payload
- Create `point-of-contact/contact.md` from template

### `tracker_update`
- Update `revenue/lead-generation/prospect-tracker.md` -- set status to "Closed Won"
- Update Google Sheet via GWS CLI if applicable

### `decision_log`
- Append to `operations/decisions/log.md`:
  - Decision: "Signed {company_name} as client"
  - Service type, project ID, date

### `briefing_update`
- Add new project to `iris/context/current-priorities.md`

## Query

```sql
SELECT id, task_type, payload, status, retry_count
FROM pending_iris_tasks
WHERE status IN ('pending', 'failed') AND retry_count < 3
ORDER BY created_at ASC;
```

## Completion

After processing all tasks, update each record:

```sql
-- Success:
UPDATE pending_iris_tasks
SET status = 'completed', completed_at = now()
WHERE id = '{task_id}';

-- Failure:
UPDATE pending_iris_tasks
SET status = 'failed', error_message = '{error}', retry_count = retry_count + 1
WHERE id = '{task_id}';
```
```

- [ ] **Step 2: Update morning coffee skill**

Add a section to `.claude/skills/morning-coffee/SKILL.md` that checks for pending Iris tasks and includes them in the briefing output. Add after the existing sections:

```markdown
## Pending Onboarding Tasks

Query `pending_iris_tasks` via Supabase MCP:

```sql
SELECT task_type, payload->>'company_name' as company, retry_count, created_at
FROM pending_iris_tasks
WHERE status IN ('pending', 'failed')
ORDER BY created_at ASC;
```

If results exist, include in briefing under "Action Required":
- "N pending onboarding tasks for [company names]"
- List each task type and retry count
- Invoke client-onboarding skill to process them
```

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/client-onboarding/SKILL.md .claude/skills/morning-coffee/SKILL.md
git commit -m "feat: add Iris client onboarding skill and morning briefing integration"
```

---

## Chunk 8: Final Integration & Verification

### Task 17: Add proposal admin link to sidebar (if needed)

**Files:**

- Modify: `src/components/dashboard/sidebar.tsx` (only if client-facing proposals nav needs adjustment)

- [ ] **Step 1: Verify sidebar nav**

The sidebar already has a "Proposals" link for admin (line 71-75). Verify it points to `/dashboard/admin/proposals`. If the client-facing sidebar needs a "Proposals" link, add it to the client nav items.

- [ ] **Step 2: Commit if changes made**

```bash
git add src/components/dashboard/sidebar.tsx
git commit -m "feat: update sidebar nav for proposals"
```

### Task 18: End-to-end verification

- [ ] **Step 1: Full pipeline test**

Walk through the complete flow:

1. **Create proposal:** Admin dashboard -> New Proposal -> fill form -> save
2. **Send proposal:** Click "Send to Client" -> verify email received
3. **Review proposal:** Click link in email -> verify proposal renders with token access
4. **Sign proposal:** Type name, agree, click "Sign & Submit"
5. **Verify onboarding:**
   - Supabase: auth user, profile, client (active), client_services, project (discovery), milestones, payments (pending)
   - Stripe: customer created, invoice sent with discounts
   - Email: signed PDF received by both parties, welcome email with setup link
6. **Pay deposit:** Pay the Stripe invoice
7. **Verify payment webhook:**
   - Supabase: payments.status = 'paid'
   - Email: deposit confirmation to Eric
8. **Iris tasks:** Run `/client-onboarding` or morning briefing -> verify ClickUp board, engineering folder, tracker update

- [ ] **Step 2: Test revision flow**

1. Create and send a proposal
2. Click "Request Changes" with a message
3. Verify: Eric gets notification + email, proposal status = revision_requested
4. Edit proposal in admin, click "Resend"
5. Verify: new email with new link, old link invalid

- [ ] **Step 3: Test decline flow**

1. Create and send a proposal
2. Click "Decline" with a reason
3. Verify: Eric gets notification + email, proposal status = declined

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete prospect-to-client onboarding pipeline"
```
