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
