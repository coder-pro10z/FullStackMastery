# Job Hunt Command Center — System Design Plan

> Transforming `/job-description` from a simple JD paste box into the **central nervous system** of a job hunt — where every opportunity, contact, resume version, and prep note lives in one connected workspace.

---

## 1. The Big Picture — What Are We Building?

A **per-opportunity workspace** system. Every job opportunity gets its own "dossier" — a self-contained folder that aggregates everything the user needs to land that specific role:

```
Job Hunt Command Center
│
├── 📁 Opportunity: "Senior Frontend Eng — Google"
│   ├── 🔗 JD link + scraped/pasted text
│   ├── 📄 Resume (pinned version from Resume Vault)
│   ├── 📸 Screenshots (JD, email, offer, etc.)
│   ├── 👥 Contacts (HR · Recruiter · Referral)
│   ├── 🧠 Prep Notes (text · notebooks · screenshots)
│   └── ❓ Questions (custom + linked from Question Bank)
│
├── 📁 Opportunity: "Staff Engineer — Stripe"
│   └── ...
│
└── 🗃️  Resume Vault (shared across all opportunities)
    ├── resume_v1_general.pdf
    ├── resume_v2_frontend_focus.pdf
    └── resume_v3_startup.pdf
```

---

## 2. Core Entities & Data Model

### 2.0 Organization (First-Class Entity)

A company/organization is a **shared, reusable entity** — not just a string field on an opportunity.
One org can have many opportunities, many contacts (HR, TA, referrals), and contacts can overlap roles.

```typescript
interface Organization {
  id: string;                   // uuid
  name: string;                 // "Google"
  domain?: string;              // "google.com" (for logo lookup)
  industry?: string;            // "Tech", "Finance"
  size?: OrgSize;
  linkedInUrl?: string;
  websiteUrl?: string;
  careersPageUrl?: string;
  notes?: string;               // General org-level notes
  tags: string[];               // ["FAANG", "remote-friendly"]
  contacts: Contact[];          // ALL contacts at this org (HR + TA + Referrals)
  opportunities: string[];      // → Opportunity.id[]
  createdAt: string;
  updatedAt: string;
}

type OrgSize = 'startup' | 'scaleup' | 'mid-market' | 'enterprise' | 'unknown';
```

> **Key insight:** A contact belongs to the **Organization**, not the Opportunity.
> An HR or TA person at Google can give an *internal referral* — they are simultaneously
> a recruiter contact AND a referral source for any opportunity at that org.

---

### 2.1 Opportunity (Root Entity)

The top-level container. Now linked to an `Organization` (required).

```typescript
interface Opportunity {
  id: string;                    // uuid
  organizationId: string;        // → Organization.id  ← links to the org
  title: string;                 // "Senior Frontend Engineer"
  team?: string;                 // "Google Chrome" / "Ads Platform"
  status: OpportunityStatus;
  priority: 'low' | 'medium' | 'high';
  appliedAt?: string;            // ISO date
  deadlineAt?: string;           // Application deadline
  jdText?: string;               // Raw pasted JD text (markdown-friendly)
  jdLink?: string;               // Original posting URL
  tags: string[];                // ["remote", "L5", "FAANG"]
  pinnedResumeId?: string;       // → Resume.id
  attachments: Attachment[];     // Screenshots, PDFs, files
  // Contacts are accessed via Organization — see Contact.scopedOpportunityIds
  notes: Note[];                 // Free-form prep notes
  questions: PrepQuestion[];     // Custom + linked DB questions
  createdAt: string;
  updatedAt: string;
}

type OpportunityStatus =
  | 'bookmarked'      // Saved to watch
  | 'applied'         // Application submitted
  | 'screening'       // Phone/HR screen
  | 'interviewing'    // Active interview loop
  | 'offer'           // Offer received
  | 'accepted'        // Offer accepted
  | 'rejected'        // Rejected
  | 'withdrawn';      // Withdrawn by user
```

### 2.2 Resume (Vault Entry)

Lives in a global Resume Vault — pinned per-opportunity.

```typescript
interface Resume {
  id: string;
  label: string;           // "v3 — Frontend Focus (May 2026)"
  fileDataUrl?: string;    // base64 for small PDFs, or blob URL
  fileName?: string;       // "praveen_resume_v3.pdf"
  externalLink?: string;   // Google Drive / Notion link
  notes?: string;          // "Tailored for product companies"
  isDefault: boolean;      // Pinned as primary
  createdAt: string;
  updatedAt: string;
}
```

### 2.3 Contact (Org-Scoped — HR / Recruiter / Referral)

Contacts **belong to an Organization**, not a single opportunity.
A contact can be relevant to *multiple* opportunities at the same org.
Critically — an HR or TA person can simultaneously act as a **referral source**
for an internal opening.

```typescript
interface Contact {
  id: string;
  organizationId: string;         // → Organization.id  (org-level)
  scopedOpportunityIds: string[]; // Which opportunities this contact is relevant to
                                  // (empty = relevant to all at this org)

  // ── Identity ──────────────────────────────────────────
  name: string;
  avatarInitials?: string;        // Auto-derived from name
  role?: string;                  // "Technical Recruiter" / "Staff Engineer"
  department?: string;            // "Engineering" / "Talent Acquisition"

  // ── Contact Type (can hold MULTIPLE roles) ────────────
  types: ContactType[];           // e.g. ['hr', 'internal-referral']
                                  // An HR/TA can ALSO be an internal referral

  // ── Reach Info ────────────────────────────────────────
  email?: string;
  phone?: string;
  linkedInUrl?: string;
  connectionSource?: string;      // "JSConf 2025" / "College batch" / "Cold outreach"

  // ── Referral specifics (if types includes referral) ───
  referralType?: ReferralType;
  referralStatus?: ReferralStatus;
  referredAt?: string;            // When referral was submitted

  // ── Outreach tracking ─────────────────────────────────
  reachStatus: ReachStatus;
  lastContactedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

type ContactType =
  | 'hr'                  // Human Resources
  | 'talent-acquisition'  // Recruiter / TA specialist
  | 'hiring-manager'      // Direct hiring manager
  | 'internal-referral'   // Someone inside the company who can refer
  | 'external-referral'   // Friend / ex-colleague outside the company
  | 'peer'                // Potential future colleague
  | 'other';

type ReferralType =
  | 'internal'   // Works at the target company → can submit internal referral
  | 'external';  // Knows someone there → can make an introduction

type ReferralStatus =
  | 'not_asked'
  | 'asked'
  | 'agreed'
  | 'submitted'   // Referral form submitted inside the company
  | 'confirmed';  // Confirmed it went through

type ReachStatus =
  | 'not_contacted'
  | 'messaged'
  | 'replied'
  | 'call_scheduled'
  | 'met';
```

> **Example scenario:**
> Priya at Google is a **Technical Recruiter** (`talent-acquisition`).
> She also agrees to submit a referral for you to the Chrome team opening.
> Her `types` array = `['talent-acquisition', 'internal-referral']`.
> `referralType` = `'internal'`, `referralStatus` = `'submitted'`.
> She appears in *both* the Contacts tab and the Referrals view for that opportunity.



### 2.4 Attachment (Screenshots, Files, Emails)

Flexible media attachments on an Opportunity.

```typescript
interface Attachment {
  id: string;
  opportunityId: string;
  type: AttachmentType;
  label: string;             // "Initial email from recruiter"
  dataUrl?: string;          // base64 image / file
  externalUrl?: string;      // External link (email thread, Drive, etc.)
  mimeType?: string;
  sizeBytes?: number;
  createdAt: string;
}

type AttachmentType =
  | 'screenshot'   // Image
  | 'email'        // Email copy / text
  | 'document'     // PDF, DOCX
  | 'link'         // External URL
  | 'other';
```

### 2.5 Note (Prep Notebook)

Rich prep notes attached to an Opportunity. Can embed text, markdown, images, links, and references.

```typescript
interface Note {
  id: string;
  opportunityId: string;
  title: string;
  type: NoteType;
  content: string;             // Markdown body
  attachments: Attachment[];   // Inline screenshots / files
  sources: SourceLink[];       // Research references
  linkedQuestionIds: string[]; // → QuestionBank.Question.id
  linkedTopicIds: string[];    // → QuestionBank.Topic.id (or local keyword tags)
  linkedKeywords: string[];    // Free-form or from DB keyword list
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

type NoteType =
  | 'general'          // Free-form notes
  | 'interview-prep'   // Structured Q&A prep
  | 'research'         // Company/role research
  | 'follow-up';       // Post-interview follow-up notes

interface SourceLink {
  id: string;
  title: string;
  url: string;
  snippet?: string;    // Quoted excerpt the user saved
}
```

### 2.6 PrepQuestion (Custom Interview Questions)

Questions attached to an Opportunity — can be user-created OR pulled from the EduDash Question Bank.

```typescript
interface PrepQuestion {
  id: string;
  opportunityId: string;
  source: 'custom' | 'db';        // Created here vs imported from Question Bank
  dbQuestionId?: string;           // If source === 'db', links to the DB question
  text?: string;                   // If source === 'custom'
  complexity: 'simple' | 'medium' | 'complex';
  category?: string;               // "System Design" / "React" / "Behavioural"
  myAnswer?: string;               // User's drafted answer (markdown)
  answerAttachments: Attachment[]; // Screenshots of whiteboards, diagrams
  resources: SourceLink[];         // Reference links
  linkedKeywords: string[];
  status: QuestionStatus;
  createdAt: string;
}

type QuestionStatus = 'todo' | 'drafted' | 'confident' | 'needs-review';
```

---

## 3. Entity Relationship Diagram

```
 ┌──────────────────────────────────────────────────────┐
 │                  RESUME VAULT (global)               │
 │  Resume[]  ←─────────────────────────────────────┐   │
 └──────────────────────────────────────────────────│── ┘
                                                    │ pinnedResumeId
 ┌──────────────────────────────────────────────────────────────────────────┐
 │                         ORGANIZATION                                     │
 │  id · name · domain · industry · size · linkedInUrl · careersPageUrl     │
 │  notes · tags                                                            │
 └──┬──────────────────────────────┬─────────────────────────────────────── ┘
    │ contacts[]                   │ opportunities[]
    ▼                              ▼
 ┌──────────────────────┐  ┌───────────────────────────────────────────────┐
 │  CONTACT             │  │  OPPORTUNITY                                  │
 │                      │  │  id · organizationId · title · team           │
 │  types[]             │  │  status · priority · jdText · jdLink          │
 │   hr                 │  │  tags · pinnedResumeId                        │
 │   talent-acquisition │  └──┬──────────────┬─────────────────────────── ─┘
 │   hiring-manager     │     │              │
 │   internal-referral ─┼─────┘  (scoped)   │
 │   external-referral  │              ┌────┴──────────────────────┐
 │   peer               │              │                           │
 │                      │          Note[]               PrepQuestion[]
 │  referralType:       │              │                           │
 │   internal ←─ TA/HR  │              ├─ SourceLink[]             ├─ Attachment[]
 │   external ←─ friend │              ├─ Attachment[]             ├─ SourceLink[]
 │                      │              ├─ linkedQuestionIds ───────────────────────┐
 └──────────────────────┘              └─ linkedKeywords                           │
                                                                                   ▼
                                                               ┌───────────────────────────┐
                                                               │    QUESTION BANK DB        │
                                                               │  Question · Topic          │
                                                               │  Keyword · Category        │
                                                               └───────────────────────────┘
```

### Key Relationships

| From | To | Type | Note |
|------|----|------|------|
| Organization | Opportunity | 1 → many | One company, many job openings |
| Organization | Contact | 1 → many | All people at this company |
| Contact | Opportunity | many → many | Via `scopedOpportunityIds` |
| HR/TA Contact | internal-referral | same entity | `types` array holds both roles |
| Opportunity | Resume | many → 1 | Pinned from shared Vault |
| Note | Question Bank | many → many | Via `linkedQuestionIds` |
| PrepQuestion | Question Bank | 1 → 1 | `dbQuestionId` foreign key |



---

## 4. Screen Architecture (UX Flow)

### 4.1 Top-Level Layout — Three Panels

```
┌─────────────────────────────────────────────────────────────────────────┐
│ App Sidebar    │  LEFT PANEL          │  RIGHT PANEL                     │
│                │  ─────────────────   │  ─────────────────────────────   │
│  Job Desc ◀   │  Organizations       │  Selected Org or Opportunity      │
│                │  ┌──────────────┐   │  ┌───────────────────────────┐   │
│                │  │ 🏢 Google    │   │  │  Tabs:                    │   │
│                │  │  3 openings  │   │  │  Overview · Contacts      │   │
│                │  │  2 contacts  │──▶│  │  Notes · Questions        │   │
│                │  ├──────────────┤   │  │  Resume Vault             │   │
│                │  │ 🏢 Stripe    │   │  └───────────────────────────┘   │
│                │  │  1 opening   │   │                                   │
│                │  └──────────────┘   │                                   │
│                │  [+ New Org/Opp]    │                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Left Panel — Two Views

**View A: Organizations list** (default)
- Search bar
- Org cards: name, industry, opening count, contact count, status summary dot
- Click → expands to show opportunities under that org
- `[+ Add Organization]` button

**View B: Opportunities list** (flat list toggle)
- All opportunities across all orgs
- Filter by status · priority · org
- Group by: Organization / Status / Priority

### 4.3 Right Panel — Context-Sensitive

Selecting an **Organization** shows the **Org Workspace** (2 tabs):
- **Overview** — org details, careers page link, notes, tags
- **Contacts** — ALL contacts at this org, with type badges (HR · TA · Internal Referral · External)

Selecting an **Opportunity** shows the **Opportunity Workspace** (5 tabs):

#### Tab 1: Overview
- JD text (markdown rendered) + original link
- Status pipeline stepper
- Tags, deadline, priority
- Pinned Resume (shows selected version + "Change" button)
- Attachments grid (screenshots, emails, files)

#### Tab 2: Contacts
- Pulled from the **parent Organization's contact list**, filtered by `scopedOpportunityIds`
- Toggle: "This opportunity" / "All at [Org]"
- Contact cards show ALL their types — an HR person who is also a referral shows **both badges**:
  ```
  ┌──────────────────────────────────────────────────┐
  │ 👤 Priya Sharma                                  │
  │ Technical Recruiter · Google Talent Acquisition  │
  │ ┌──────────────┐  ┌─────────────────────────┐   │
  │ │ 🏷 TA/HR     │  │ 🔗 Internal Referral     │   │
  │ └──────────────┘  └─────────────────────────┘   │
  │ Referral: Agreed → [Mark Submitted]              │
  │ Reach: Replied · Last contact: 3 days ago        │
  │ 📧 priya@google.com  💼 LinkedIn                 │
  └──────────────────────────────────────────────────┘
  ```
- Referral pipeline (for contacts with referral type):
  `Not Asked → Asked → Agreed → Submitted → Confirmed`

#### Tab 3: Notes (unchanged from before)
#### Tab 4: Questions (unchanged from before)
#### Tab 5: Resume Vault (unchanged from before)



---

## 5. Storage Strategy

> Since there is no backend API yet, everything is stored in `localStorage`. The schema is designed to migrate cleanly to a REST API.

```typescript
// localStorage keys
const STORAGE = {
  OPPORTUNITIES:  'edudash_opportunities',    // Opportunity[]
  RESUME_VAULT:   'edudash_resume_vault',     // Resume[]
};
```

**Size consideration:** Images stored as base64 can be large. Strategy:
- Screenshots are compressed to max 800px wide at JPEG 70% quality before storage
- Warn user if localStorage usage exceeds ~3MB
- Future: swap to IndexedDB for binary blobs

---

## 6. Connection to Existing EduDash Features

| EduDash Feature | How It Connects |
|-----------------|-----------------|
| **Question Bank** | "Import from DB" modal in Questions tab — search and pull questions directly |
| **Topics / Categories** | Questions and Notes can tag themselves with DB topic IDs |
| **Keywords** | Notes and Questions reference DB keywords for prep alignment |
| **Interview Canvas** | Opportunity workspace links to the Interview Canvas with the JD pre-loaded |
| **Skill Tree** | Opportunity tags can surface which skills to prioritise in Skill Tree |

---

## 7. Navigation & Routing

```
/job-description                              → Command Center (org list + empty workspace)
/job-description/org/:orgId                   → Organization workspace (details + contacts)
/job-description/org/:orgId/contacts          → Org contacts tab
/job-description/:opportunityId               → Opportunity workspace (Overview tab)
/job-description/:opportunityId/contacts      → Contacts tab (scoped to opportunity)
/job-description/:opportunityId/notes         → Notes tab
/job-description/:opportunityId/questions     → Questions tab
/job-description/vault                        → Resume Vault
```

> **Decision:** Deep child routes used for bookmarkability. Each tab is a distinct URL.


---

## 8. Component Architecture

```
job-description/
├── job-description.component.ts         ← Root shell (left panel list + right panel outlet)
│
├── opportunity-list/
│   └── opportunity-list.component.ts    ← Filtered, sorted card list
│
├── opportunity-workspace/
│   └── opportunity-workspace.component.ts ← Tab container for one opportunity
│
├── tabs/
│   ├── overview/
│   │   └── overview-tab.component.ts   ← JD, status, resume pin, attachments
│   ├── contacts/
│   │   └── contacts-tab.component.ts   ← Contact cards + add form
│   ├── notes/
│   │   ├── notes-tab.component.ts      ← Note list + editor
│   │   └── note-editor.component.ts    ← Rich markdown editor with DB linking
│   ├── questions/
│   │   ├── questions-tab.component.ts  ← Question list + filters
│   │   └── question-card.component.ts  ← Expandable question with answer editor
│   └── resume-vault/
│       └── resume-vault.component.ts   ← Global resume list
│
├── shared/
│   ├── attachment-grid.component.ts    ← Reusable screenshot/file grid
│   ├── source-link-panel.component.ts  ← Research references list
│   ├── db-link-modal.component.ts      ← Modal: search + import from Question Bank
│   └── status-stepper.component.ts     ← Pipeline stage stepper
│
├── services/
│   ├── opportunity.service.ts          ← CRUD for Opportunity + localStorage
│   └── resume-vault.service.ts         ← CRUD for Resume Vault + localStorage
│
└── models/
    └── opportunity.models.ts           ← All TypeScript interfaces
```

---

## 9. UI/UX Design Principles (per Handbook)

| Principle | Application |
|-----------|------------|
| **8px grid** | All spacing via Tailwind scale values |
| **Blue = student actions** | Save, Add, Import buttons |
| **Violet = admin/power features** | DB linking, advanced filters |
| **Lucide only** | `briefcase`, `building-2` (org), `file-text`, `users`, `book-open`, `link`, `paperclip`, `mail`, `phone`, `share-2` (LinkedIn proxy), `git-merge` (referral pipeline) |
| **Cards with shadow-level-1** | `.edudash-card` for org, opportunity, and contact cards |
| **Skeleton loading** | `animate-pulse` on list while loading from localStorage |
| **No spinners** | Pulse skeletons only |
| **OnPush everywhere** | All components use `ChangeDetectionStrategy.OnPush` |
| **Signals** | State via `signal()` / `computed()` — no BehaviorSubjects |


---

## 10. Status Colour System

| Status | Colour | Tailwind |
|--------|--------|---------|
| Bookmarked | Slate | `bg-slate-100 text-slate-600` |
| Applied | Blue | `bg-blue-100 text-blue-700` |
| Screening | Indigo | `bg-indigo-100 text-indigo-700` |
| Interviewing | Violet | `bg-violet-100 text-violet-700` |
| Offer | Amber | `bg-amber-100 text-amber-700` |
| Accepted | Emerald | `bg-emerald-100 text-emerald-700` |
| Rejected | Red | `bg-red-100 text-red-600` |
| Withdrawn | Slate | `bg-slate-100 text-slate-400 line-through` |

---

## 11. Phased Build Plan

### Phase 1 — Organization + Opportunity Manager (Foundation)
- [ ] Data models + interfaces (`opportunity.models.ts`)
- [ ] `OrganizationService` + `OpportunityService` with localStorage CRUD
- [ ] `OrganizationListComponent` — org cards with opportunity sub-list
- [ ] `OpportunityListComponent` — flat cross-org list with filters
- [ ] `OverviewTabComponent` — JD text/link, status stepper, attachments grid
- [ ] Routes: `/job-description`, `/job-description/org/:orgId`, `/job-description/:id`

### Phase 2 — Contacts (Org-Scoped, Multi-Type, Referral Pipeline)
- [ ] `ContactsTabComponent` — contact cards with multi-type badges
- [ ] `ContactCardComponent` — shows all types (TA + Internal Referral together)
- [ ] `ContactFormComponent` — add/edit drawer with type multi-select
- [ ] `ReferralPipelineComponent` — Not Asked → Asked → Agreed → Submitted → Confirmed
- [ ] Org-level contacts list (all contacts at org) + opportunity-scoped filter toggle

### Phase 3 — Notes & Notebooks
- [ ] `NotesTabComponent` — note list + markdown editor
- [ ] Inline image paste/drop into notes
- [ ] Source links panel
- [ ] Link to DB Questions / Topics (read-only reference)

### Phase 4 — Questions & DB Integration
- [ ] `QuestionsTabComponent` — question cards with complexity grouping
- [ ] `DbLinkModal` — search Question Bank and import questions
- [ ] Answer editor (markdown) with attachment support
- [ ] Status tracking (Todo → Confident)

### Phase 5 — Resume Vault
- [ ] `ResumeVaultService`
- [ ] `ResumeVaultComponent` — version list with pin-to-opportunity
- [ ] File upload (base64) + external link support
- [ ] Resume pinned to opportunity shows in Overview tab

### Phase 6 — Polish & Integration
- [ ] Connect to Interview Canvas (pass JD + org context)
- [ ] Skill Tree tag surfacing from opportunity tags
- [ ] Export opportunity dossier as markdown summary
- [ ] IndexedDB migration for binary file storage


---

## 12. Open Questions for Review

> [!IMPORTANT]
> **Org vs Opportunity first:** Should the user create an Organization first, then add Opportunities under it? Or should they be able to add an Opportunity directly (auto-creating the org if needed)? Recommend: **Opportunity-first** — auto-create org from company name, let them enrich the org profile later.

> [!IMPORTANT]
> **Contact scope — when adding a contact to an org, does it automatically apply to all opportunities at that org?** Or must the user explicitly scope it? Recommend: **Org-wide by default, opportunity-scoped optionally** via `scopedOpportunityIds`.

> [!NOTE]
> **File storage:** localStorage (simple, ~5MB limit) vs IndexedDB (complex, no limit). Recommend IndexedDB from Phase 1 for screenshots and resumes.

> [!NOTE]
> **Question Bank API:** The DB linking requires read access. Should `AdminApiService` be reused, or a separate student-level `QuestionBankService`?

> [!NOTE]
> **Which phase to build first?** Recommend starting with Phase 1 + Phase 2 together (org/opportunity manager + contacts with referral pipeline) since they are tightly coupled. Agree?

---

> **Last Updated:** 2026-05-27
> **Status:** Awaiting approval to begin Phase 1
