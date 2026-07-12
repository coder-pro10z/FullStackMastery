export type OrgSize = 'startup' | 'scaleup' | 'mid-market' | 'enterprise' | 'unknown';

export interface Organization {
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
  createdAt: string;
  updatedAt: string;
}

export type OpportunityStatus =
  | 'bookmarked'      // Saved to watch
  | 'applied'         // Application submitted
  | 'screening'       // Phone/HR screen
  | 'interviewing'    // Active interview loop
  | 'offer'           // Offer received
  | 'accepted'        // Offer accepted
  | 'rejected'        // Rejected
  | 'withdrawn';      // Withdrawn by user

export interface Opportunity {
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
  attachments?: Attachment[];    // Screenshots, PDFs, files
  createdAt: string;
  updatedAt: string;
}

export interface Resume {
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

export type ContactType =
  | 'hr'                  // Human Resources
  | 'talent-acquisition'  // Recruiter / TA specialist
  | 'hiring-manager'      // Direct hiring manager
  | 'internal-referral'   // Someone inside the company who can refer
  | 'external-referral'   // Friend / ex-colleague outside the company
  | 'peer'                // Potential future colleague
  | 'other';

export type ReferralType =
  | 'internal'   // Works at the target company → can submit internal referral
  | 'external';  // Knows someone there → can make an introduction

export type ReferralStatus =
  | 'not_asked'
  | 'asked'
  | 'agreed'
  | 'submitted'   // Referral form submitted inside the company
  | 'confirmed';  // Confirmed it went through

export type ReachStatus =
  | 'not_contacted'
  | 'messaged'
  | 'replied'
  | 'call_scheduled'
  | 'met';

export interface Contact {
  id: string;
  organizationId: string;         // → Organization.id  (org-level)
  scopedOpportunityIds: string[]; // Which opportunities this contact is relevant to

  // ── Identity ──────────────────────────────────────────
  name: string;
  avatarInitials?: string;        // Auto-derived from name
  role?: string;                  // "Technical Recruiter" / "Staff Engineer"
  department?: string;            // "Engineering" / "Talent Acquisition"

  // ── Contact Type (can hold MULTIPLE roles) ────────────
  types: ContactType[];           // e.g. ['hr', 'internal-referral']

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

export type AttachmentType =
  | 'screenshot'   // Image
  | 'email'        // Email copy / text
  | 'document'     // PDF, DOCX
  | 'link'         // External URL
  | 'other';

export interface Attachment {
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

export interface SourceLink {
  id: string;
  title: string;
  url: string;
  snippet?: string;    // Quoted excerpt the user saved
}

export type NoteType =
  | 'general'          // Free-form notes
  | 'interview-prep'   // Structured Q&A prep
  | 'research'         // Company/role research
  | 'follow-up';       // Post-interview follow-up notes

export interface Note {
  id: string;
  opportunityId: string;
  title: string;
  type: NoteType;
  content: string;             // Markdown body
  attachments: string[];       // Reference to Attachment IDs or directly inline images base64 (we'll stick to string array of IDs or just string for content)
  sources: SourceLink[];       // Research references
  linkedQuestionIds: string[]; // → QuestionBank.Question.id
  linkedTopicIds: string[];    // → QuestionBank.Topic.id (or local keyword tags)
  linkedKeywords: string[];    // Free-form or from DB keyword list
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export type QuestionStatus = 'todo' | 'drafted' | 'confident' | 'needs-review';

export interface PrepQuestion {
  id: string;
  opportunityId: string;
  source: 'custom' | 'db';        // Created here vs imported from Question Bank
  dbQuestionId?: string;           // If source === 'db', links to the DB question
  text?: string;                   // If source === 'custom'
  complexity: 'simple' | 'medium' | 'complex';
  category?: string;               // "System Design" / "React" / "Behavioural"
  myAnswer?: string;               // User's drafted answer (markdown)
  answerAttachments: string[];     // IDs to Attachments
  resources: SourceLink[];         // Reference links
  linkedKeywords: string[];
  status: QuestionStatus;
  createdAt: string;
}
