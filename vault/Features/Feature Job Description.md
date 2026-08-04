---
id: "Feature Job Description"
type: "feature-hub"
domain: "Frontend"
layer: "Frontend"
module: "JobDescription"
feature:
  - "[[Feature Job Description]]"
technology: "Angular 17"
framework: "Standalone Angular"
language: "TypeScript"
project: "frontend"
namespace: ""
api_endpoint: ""
database_table: ""
depends_on: []
used_by: []
implements: []
calls: []
related_to: []
status: "implemented"
tags:
  - feature/job-description
  - domain/applications
---

# Feature: Job Description & Org Workspace

## Overview
The Job Description workspace (also known as the Organization Workspace) tracks job applications, resumes, networking contacts, and preparation notes.

## Business Purpose
Allows candidates to align their prep work to specific companies, upload tailored resumes, trace company organizational structures, list HR/technical contacts, and organize prep questions specific to targeted roles.

---

## 🔗 Architecture Graph Relations

```mermaid
graph TD
    JobDescHub[Feature Job Description] --> JobDescPage[job-description.component]
    JobDescPage --> ResumeVault[resume-vault.component]
    JobDescPage --> OrgWorkspace[organization-workspace.component]
    OrgWorkspace --> OrgService[organization.service]
    OrgWorkspace --> ContactService[contact.service]
    OrgWorkspace --> ResumeService[resume.service]
```

### Frontend Components
* **Pages & Tabs**:
  * `[[job-description.component]]` — Main landing layout mapping active organizations and job leads.
  * `[[resume-vault.component]]` — Repository dashboard tracking parsed resume files and scores.
  * `[[organization-workspace.component]]` — Workplace console managing details for targeted hiring organizations.
* **Services**:
  * `[[organization.service]]` — Manages metadata mapping organization details.
  * `[[contact.service]]` — Handles networking details (referrals, hiring managers, engineers).
  * `[[resume.service]]` — Coordinates resume document lists and uploads.

### Backend Components
* *Currently implemented client-side with potential API integrations pending in subsequent phases.*
