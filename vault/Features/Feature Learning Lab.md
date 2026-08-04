---
id: "Feature Learning Lab"
type: "feature-hub"
domain: "Shared"
layer: "Shared"
module: "LearningLab"
feature:
  - "[[Feature Learning Lab]]"
technology: ".NET 8 | Angular 17"
framework: "ASP.NET Core | Standalone Angular"
language: "C# | TypeScript"
project: "InterviewPrepApp"
namespace: "InterviewPrepApp.Domain.Entities"
api_endpoint: "GET /api/admin/study-guides"
database_table: "Competencies"
depends_on: []
used_by: []
implements: []
calls: []
related_to: []
status: "implemented"
tags:
  - feature/learning-lab
  - domain/skills
---

# Feature: Learning Lab & Skill Tree

## Overview
The Learning Lab provides interactive visual roadmaps, coding widgets, and markdown-based study guides mapped to specific technical skills and core competencies.

## Business Purpose
Enhances technical preparation through visual tree navigation, step-by-step competency logs, code example playgrounds, and diagrams.

---

## 🔗 Architecture Graph Relations

```mermaid
graph TD
    LearningLabHub[Feature Learning Lab] --> LearningLabPage[learning-lab.component]
    LearningLabHub --> SkillTreePage[skill-tree.component]
    LearningLabPage --> KnowledgeIndex[knowledge-index.service]
    SkillTreePage --> CompetencyProgress[competency-progress.service]
    KnowledgeIndex --> AdminStudyGuideImportController[AdminStudyGuideImportController]
    AdminStudyGuideImportController --> Db[ApplicationDbContext]
```

### Frontend Components
* **Pages & Panels**:
  * `[[learning-lab.component]]` — Main landing panel displaying modules, checklists, and guides.
  * `[[skill-tree.component]]` — Interactive structural dependency map showing core categories.
* **Shared UI Widgets**:
  * `[[knowledge-index]]` — Hierarchical checklist for tracking self-ratings of skills.
  * `[[mermaid-viewer]]` — Renders architecture workflows and block diagrams.
* **Services**:
  * `[[knowledge-index.service]]` — Handles fetching progress rates for knowledge structures.
  * `[[competency-progress.service]]` — Manages completion flags for skill nodes.

### Backend Components
* **Controllers**:
  * `[[AdminStudyGuideImportController]]` — Administrative actions supporting study guide loading.
* **Entities**:
  * `[[Competency]]` — High-level topic specification (e.g. ASP.NET Core, Database Tuning).
  * `[[Skill]]` — Granular capability maps (e.g. Middleware registration, Index creation).
  * `[[SkillCategory]]` — Classifications grouping skills together.
  * `[[StudyGuideSection]]` — Text blocks containing instructions, solutions, and diagrams.

### Database Tables
* `[[CompetenciesTable]]` — Stores core competencies keys and tags.
* `[[SkillsTable]]` — Maps skills to parent categories.
* `[[StudyGuideSectionsTable]]` — Stores markdown content blocks.
