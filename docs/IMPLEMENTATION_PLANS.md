# Project Implementation Plans

This document serves as an ongoing log of architectural and feature implementation plans for the Full Stack Interview Preparation Platform.

---

## Plan 1: Admin Import UI Update (Questions & Answers)
*Date: 2026-07-15*

This plan outlines the required frontend changes to adapt the Admin Import screen to the decoupled Questions and Answers import architecture. The UI currently only explicitly mentions "Questions" and references deprecated fields.

### Proposed Changes

We will modify `admin-import.component.ts` to include a toggle for the "Import Type" (Questions vs. Answers) and conditionally render the correct form fields and instructions.

#### Frontend UI Changes
- **Add State**: Add a new `importMode` signal: `signal<'questions' | 'answers'>('questions')`.
- **UI Toggle**: Add a Segmented Control / Tab switch at the top of the card to select between "Questions" and "Answers".
- **Dynamic Content**:
  - If `questions`: Show "Default Category" picker. Supported formats: `.csv`, `.xlsx`. Instructions: `Title`, `QuestionText`, `Difficulty`, `ExternalId`, `CategorySlug`.
  - If `answers`: Hide "Default Category" picker (answers map to existing questions via `ExternalId`). Supported format: `.json`. Instructions: `ExternalId`, `TechnicalExplanation`, `CodeSnippets`, etc.
- **API Call Mapping**:
  - Update `runImport()` to check the `importMode`. 
  - Call `this.api.importFile()` for Questions.
  - Call `this.api.importAnswers()` for Answers.

### Verification Plan

#### Automated Tests
- `npm run build` to ensure Angular compiles the new component state correctly.
- Ensure TypeScript correctly binds the new API methods.

#### Manual Verification
- Run the Angular app locally, navigate to `/admin/import`.
- Ensure the tabs for "Questions" and "Answers" render correctly.
- Validate that selecting "Answers" removes the "Default Category" requirement.
- Upload a dummy `questions.csv` using the Questions tab and run a Dry Run.
- Upload a dummy `answers.json` using the Answers tab and run a Dry Run.

---

## Plan 2: Custom JSON Schema Support (Bulk Question Import)
*Date: 2026-07-15*

This plan outlines the required backend changes to natively support the bulk-import of questions using a custom `question.schema.json` format, which differs from the internal `ImportQuestionRowDto` property names.

### Proposed Changes

We will update the `AdminImportController` to intercept the JSON deserialization and map specific schema keys to the internal `ImportQuestionRowDto`.

#### Backend Changes
- Introduce a private `QuestionSchemaDto` class with `[JsonPropertyName]` attributes matching the custom schema (e.g., `question_id`, `question`, `category`).
- Update `ParseJson()` to deserialize into this new class.
- Map the parsed `QuestionSchemaDto` objects into `ImportQuestionRowDto`:
  - `ExternalId` = `question_id`
  - `QuestionText` = `question`
  - `CategorySlug` = `category`
  - `Difficulty` = `difficulty`
  - `Tags` = `tags`

### Verification Plan

#### Automated Tests
- Build the backend using `dotnet build` to ensure the mapping syntax is correct.

#### Manual Verification
- Start the backend API.
- Use the Frontend Import UI to upload the 600+ question JSON file with the **Dry Run** toggle checked.
- Verify that the backend successfully parses all questions, correctly identifies the categories, and throws no missing field errors.

---

## Plan 3: Data Seed Transformation (questions.json)
*Date: 2026-07-15*

This plan outlines how to transform the 7,400+ line `questions.json` file to align its `category` fields with the actual seeded categories, and intelligently populate `related_questions` and `related_concepts`.

### Seeded Categories Available
`fundamentals`, `oops`, `solid`, `backend`, `middleware`, `caching`, `api-design`, `request-pipeline`, `error-handling`, `logging`, `http-caching`, `cache-headers`, `cdn`, `rest`, `graphql`, `grpc`, `database`, `sql`, `nosql`, `orm`, `security`, `authentication`, `authorization`, `dotnet`, `aspnet-core`, `ef-core`, `angular`, `system-design`, `hld`, `lld`, `scalability`, etc.

### Proposed Changes

We will create a Node.js utility script (`scripts/transform_seed_data.js`) to parse and overwrite `data/seeds/questions.json`.

#### Execution Steps
1. **Category Mapping**: 
   - The script will evaluate `domain_id` and `primary_slide_id` for each question and replace `"category": "Core"` with a valid database slug.
2. **Populate Related Questions**: 
   - Group all questions by their `primary_slide_id`.
   - For every question in that group, extract the `question_id`s of *all other* questions in the same group and insert them into the `"related_questions": []` array.
3. **Populate Related Concepts**:
   - Dynamically map `primary_slide_id` to a Concept ID format (e.g., `CONCEPT_SAGA_PATTERN`) and inject it into `"related_concepts": []`.

### Verification Plan
1. Run the Node script: `node scripts/transform_seed_data.js`.
2. Inspect `questions.json` to verify categories and arrays.
3. Perform a Dry Run import in the Admin UI.

---

## Plan 4: Standardize Difficulty Terminology in Bulk Import
*Date: 2026-07-15*

This plan outlines how to resolve the Dry Run warnings caused by a mismatch in difficulty terminology between the JSON seed file and the C# backend.

### The Issue

The C# backend expects `Difficulty.cs` enum values: `Easy`, `Medium`, `Hard`.
The `questions.json` file uses: `Beginner`, `Intermediate`, `Advanced`.

### Proposed Changes

We will modify the Node.js transformation script to map and overwrite the legacy difficulty strings directly inside the `questions.json` file.

#### 1. Update Schema Definition
- **File**: `data/schemas/question.schema.json`
- **Action**: Update the `difficulty` enum from `["Beginner", "Intermediate", "Advanced"]` to `["Easy", "Medium", "Hard"]`.

#### 2. Update Transformation Script
- **File**: `data/seeds/transform_seed_data.js`
- **Action**: Add a difficulty mapping object:
  - `Beginner` -> `Easy`
  - `Intermediate` -> `Medium`
  - `Advanced` -> `Hard`
- Apply the mapping to every question before saving.

### Verification Plan
1. Re-run `node transform_seed_data.js`.
2. Do another Dry Run import in the Angular Admin UI.
3. Verify that the Dry Run passes with zero warnings about unknown difficulty.

---

## Plan 5: Standardize Question Titles and Text
*Date: 2026-07-16*

This plan details how we will clean up the legacy `Q <DOMAIN> <TOPIC>?` format currently polluting the question fields in our `questions.json` seed data, utilizing UI tags and Title Case formatting.

### Proposed Changes

#### 1. Update Schema Definition
- **File**: `data/schemas/question.schema.json`
- **Action**: Add a new `"title"` property to the schema representing the short label for the UI.

#### 2. Update Transformation Script
- **File**: `data/seeds/transform_seed_data.js`
- **Action**:
  - Add a Tag Mapping dictionary (e.g. `SQL` -> `SQL`, `NG` -> `Angular`, `CSHARP` -> `C#`).
  - Inject a Regex parser (`/^Q\s+([A-Z0-9]+)\s+(.*?)\??$/i`) to extract the domain prefix and the core text.
  - Apply Title Case formatting to the core text, ensuring the word `"vs"` is properly lowercased.
  - Overwrite `question` with `[Title]?`.
  - Push the mapped tag into the question's `"tags"` array.

#### 3. Update Backend Mapping
- **File**: `backend/src/InterviewPrepApp.Api/Controllers/Admin/AdminImportController.cs`
- **Action**: Add `[JsonPropertyName("title")]` to `QuestionSchemaDto.Title`.

### Verification Plan
1. Re-run `node transform_seed_data.js`.
2. Inspect the JSON file to ensure "vs" is lowercased, tags are added, and titles are separated.
3. Perform a Dry Run import to ensure the Title and Tags successfully pass into the database payload.

---

## Plan 6: UPSERT Import & Premium Confirmation Modal
*Date: 2026-07-16*

This plan outlines how to modify the bulk import pipeline to support UPSERTs (updating existing questions instead of skipping them) and seamlessly integrating a Premium Confirmation Modal in the Angular Admin UI to warn the user before overwriting existing data.

### Proposed Changes

#### 1. Backend: Validation Logic Update
- **File**: `backend/src/InterviewPrepApp.Application/Validators/IQuestionImportValidator.cs` & `backend/src/InterviewPrepApp.Infrastructure/Services/QuestionImportValidator.cs`
- **Action**: Add `IsUpdate` to the `ValidatedQuestionRecord`. Do not skip database duplicates; instead, flag them as updates.

#### 2. Backend: Question Service UPSERT Engine
- **File**: `backend/src/InterviewPrepApp.Infrastructure/Services/AdminQuestionService.cs`
- **Action**: Update `ImportAsync()` to separate Inserts and Updates. Fetch existing DB questions for updates, map the new title/text/category/difficulty, sync tags in memory, and increment the `Updated` count within the result payload.

#### 3. Frontend: Interactive Confirmation Modal
- **File**: `frontend/src/app/features/admin/admin-import/admin-import.component.ts`
- **Action**: Intercept non-Dry Run clicks. Execute a silent background Dry Run. If updates or inserts are detected, spawn a premium glass-morphism confirmation modal to request explicit user approval before executing the true DB import.

### Verification Plan
1. Re-run an import of `questions.json` using the Admin UI.
2. Verify the background Dry Run perfectly detects Updates.
3. Confirm the Premium Modal appears with accurate insertion and update metrics.
4. Accept the modal and verify the database syncs without duplicate collisions.

---
