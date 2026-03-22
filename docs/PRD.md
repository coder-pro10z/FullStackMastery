Product Requirements Document (PRD)
The PRD acts as the North Star for the product. It outlines what you are building and why it matters to the user and the business. It does not dictate how the engineering team should write the code.

Primary Author: Product Manager (PM).

Target Audience: The entire team (Designers, Engineers, QA, Marketing, and Stakeholders).

Key Components:

Problem Statement: The specific user pain point being solved.

User Personas: Who the product or feature is for.

User Stories & Flows: How the user will interact with the feature.

Business Goals & Success Metrics: What defines success (e.g., higher conversion rate, reduced churn).

Scope & Constraints: What is included in this release and what is explicitly excluded (out of scope).
---

Here is the complete **Product Requirements Document (PRD)** for your Full Stack .NET + Angular Interview Preparation Platform.

This document defines the "What" and the "Why" for Phase 1 (The MVP), ensuring that if you were to hand this to a designer or another engineer, they would instantly understand the value and scope of the product.

---

# 📄 Product Requirements Document (PRD)

**Product Name:** Full Stack .NET & Angular Interview Prep Platform
**Phase:** 1.0 (Functional MVP)
**Primary Author:** Product Manager
**Target Audience:** Engineering, Design, QA, Stakeholders

---

### 1. Problem Statement

**The User Pain Point:** Software engineers preparing for Full Stack .NET and Angular interviews currently face a highly fragmented learning experience. Existing platforms (like LeetCode) over-index on raw Data Structures and Algorithms (DSA), while neglecting framework-specific core concepts, system design, and scenario-based architecture questions. Candidates waste hours compiling their own Notion documents and Excel sheets instead of actually studying.

**The Solution:** A centralized, distraction-free web platform providing curated, categorized question banks specifically tailored to .NET backend and Angular frontend roles, complete with progress tracking and revision tools.

---

### 2. User Personas

**Persona 1: The Ambitious Candidate (End-User)**

* **Profile:** Junior to Mid-level software developer actively applying for Full Stack roles.
* **Goals:** Wants to quickly identify their knowledge gaps, practice real-world scenario questions, and track their preparation progress over a 4-to-8 week period.
* **Frustrations:** Overwhelmed by unstructured tutorials; unsure what concepts are actually asked in modern interviews.

**Persona 2: The Platform Admin (Internal)**

* **Profile:** You (the product owner/content curator).
* **Goals:** Wants to rapidly add new interview questions, categorize them, and update answers without writing SQL scripts or deploying code.
* **Frustrations:** Manually entering hundreds of questions one by one through a tedious web form.

---

### 3. User Stories & Flows

**Flow 1: The Candidate's Study Session**

* **Story:** *As a candidate, I want to filter questions by role and difficulty so I can focus my limited study time on my weakest areas.*
* **Step-by-Step:**
1. User logs in and lands on the Dashboard.
2. User views the "Progress Cards" to see they have solved 10/100 Easy questions.
3. User clicks the Sidebar to select `Fundamentals -> OOPS`.
4. User uses the Filter Bar to select `Role: Backend` and `Difficulty: Medium`.
5. User reads a scenario question, clicks to reveal the answer, and clicks the **"Mark as Solved"** toggle. The Progress Card updates immediately.



**Flow 2: The Revision Workflow**

* **Story:** *As a candidate, I want to bookmark difficult questions so I can review them the day before my interview.*
* **Step-by-Step:**
1. User encounters a hard question they couldn't answer.
2. User clicks the **"Bookmark/Revision"** toggle on the question card.
3. User can later filter the dashboard to show *only* bookmarked questions.



**Flow 3: The Admin Bulk Upload**

* **Story:** *As an admin, I want to upload a structured Excel sheet of questions so I can populate the platform's database in seconds.*
* **Step-by-Step:**
1. Admin logs into the Admin Dashboard.
2. Admin drags and drops an `.xlsx` file containing hundreds of formatted questions.
3. The system validates the file.
4. Admin sees a success toast: *"Successfully imported 150 questions."* The questions instantly appear for candidates.



---

### 4. Business Goals & Success Metrics

**Business Goals (Phase 1):**

* Validate the core value proposition by acquiring the first 100 active users.
* Create a robust, scalable database architecture that can support the Phase 2/Phase 3 AI features.

**Success Metrics (KPIs):**

* **Activation Rate:** Percentage of users who solve at least 5 questions on their first day.
* **Retention (WAU):** Weekly Active Users returning to continue their study tracks.
* **Admin Efficiency:** 100% success rate on valid Excel uploads without server crashes or 500 errors.

---

### 5. Scope & Constraints

**Included in Scope (Phase 1 MVP):**

* Secure User Authentication (JWT-based Login/Register).
* Infinitely nested Category Sidebar (e.g., Fundamentals -> OOPS -> Abstraction).
* Question Table with expanding rows for Answers/Scenarios.
* Filtering by Category, Role (Frontend/Backend), and Difficulty (Easy/Medium/Hard).
* User Progress Tracking (Solved toggles, Revision bookmarks, and Dashboard Stats).
* Admin Dashboard for `.xlsx` bulk uploads with strict file validation.
* Responsive Dark Mode UI using Tailwind CSS.

**Explicitly Out of Scope (For Phase 2 & 3):**

* 🚫 **AI Interview Copilot:** AI voice/text evaluation of user answers.
* 🚫 **Resume Analyzer:** Uploading PDFs for ATS scoring.
* 🚫 **Monetization/Payments:** Paywalls or Stripe integration.
* 🚫 **Social Features:** Leaderboards, comments, or user forums.
* 🚫 **Code Execution:** An integrated IDE to run C# or TypeScript code in the browser (like LeetCode's compiler).
