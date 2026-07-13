const fs = require('fs');
const path = require('path');

const filesToUpdate = {
  'docs/Architecture/ENGINEERING_PLAYBOOK.md': '> **Navigation:** [← Back to README](../../README.md) · [Architecture](../Architecture/) · [Domain](../Domain/) · [Features](../Features/) · [API](../API/) · [ADR](../ADR/)\n> **Related:** [TRD](TRD.md) · [TDD_STRATEGY](TDD_STRATEGY.md)\n\n',
  'docs/Architecture/TRD.md': '> **Navigation:** [← Back to README](../../README.md) · [Architecture](../Architecture/) · [Domain](../Domain/) · [Features](../Features/) · [API](../API/) · [ADR](../ADR/)\n> **Related:** [ENGINEERING_PLAYBOOK](ENGINEERING_PLAYBOOK.md) · [PRD](../Domain/PRD.md)\n\n',
  'docs/Architecture/TDD_STRATEGY.md': '> **Navigation:** [← Back to README](../../README.md) · [Architecture](../Architecture/) · [Domain](../Domain/) · [Features](../Features/) · [API](../API/) · [ADR](../ADR/)\n> **Related:** [ImportModule_ValidationPlan](../Features/ImportModule_ValidationPlan.md)\n\n',
  'docs/Architecture/supabase-migration.md': '> **Navigation:** [← Back to README](../../README.md) · [Architecture](../Architecture/) · [Domain](../Domain/) · [Features](../Features/) · [API](../API/) · [ADR](../ADR/)\n\n',
  'docs/Architecture/DESIGN_UPDATE_PLAN.md': '> **Navigation:** [← Back to README](../../README.md) · [Architecture](../Architecture/) · [Domain](../Domain/) · [Features](../Features/) · [API](../API/) · [ADR](../ADR/)\n> **Related:** [Improvements](../Improvements.md) · [TRACKER](../TRACKER.md)\n\n',
  
  'docs/Domain/PRD.md': '> **Navigation:** [← Back to README](../../README.md) · [Architecture](../Architecture/) · [Domain](../Domain/) · [Features](../Features/) · [API](../API/) · [ADR](../ADR/)\n> **Related:** [TRD](../Architecture/TRD.md) · [APPLICATION_FLOW](../Workflows/APPLICATION_FLOW.md)\n\n',
  'docs/Domain/PORTFOLIO_BRIEF.md': '> **Navigation:** [← Back to README](../../README.md) · [Architecture](../Architecture/) · [Domain](../Domain/) · [Features](../Features/) · [API](../API/) · [ADR](../ADR/)\n\n',

  'docs/Features/ADMIN.md': '> **Navigation:** [← Back to README](../../README.md) · [Architecture](../Architecture/) · [Domain](../Domain/) · [Features](../Features/) · [API](../API/) · [ADR](../ADR/)\n> **Related:** [ImportQuestionPlan](../Workflows/ImportQuestionPlan.md)\n\n',
  'docs/Features/CheatSheet.md': '> **Navigation:** [← Back to README](../../README.md) · [Architecture](../Architecture/) · [Domain](../Domain/) · [Features](../Features/) · [API](../API/) · [ADR](../ADR/)\n> **Related:** [PRD](../Domain/PRD.md) · [TRD](../Architecture/TRD.md)\n\n',
  'docs/Features/QUIZ.md': '> **Navigation:** [← Back to README](../../README.md) · [Architecture](../Architecture/) · [Domain](../Domain/) · [Features](../Features/) · [API](../API/) · [ADR](../ADR/)\n> **Related:** [PRD](../Domain/PRD.md) · [TRD](../Architecture/TRD.md)\n\n',
  'docs/Features/ImportModule_ValidationPlan.md': '> **Navigation:** [← Back to README](../../README.md) · [Architecture](../Architecture/) · [Domain](../Domain/) · [Features](../Features/) · [API](../API/) · [ADR](../ADR/)\n> **Related:** [ImportQuestionPlan](../Workflows/ImportQuestionPlan.md) · [TDD_STRATEGY](../Architecture/TDD_STRATEGY.md)\n\n',

  'docs/Workflows/APPLICATION_FLOW.md': '> **Navigation:** [← Back to README](../../README.md) · [Architecture](../Architecture/) · [Domain](../Domain/) · [Features](../Features/) · [API](../API/) · [ADR](../ADR/)\n> **Related:** [PRD](../Domain/PRD.md)\n\n',
  'docs/Workflows/ImportQuestionPlan.md': '> **Navigation:** [← Back to README](../../README.md) · [Architecture](../Architecture/) · [Domain](../Domain/) · [Features](../Features/) · [API](../API/) · [ADR](../ADR/)\n> **Related:** [ImportModule_ValidationPlan](../Features/ImportModule_ValidationPlan.md)\n\n',
  'docs/Workflows/Gemini_Backend.md': '> **Navigation:** [← Back to README](../../README.md) · [Architecture](../Architecture/) · [Domain](../Domain/) · [Features](../Features/) · [API](../API/) · [ADR](../ADR/)\n> **Related:** [ENGINEERING_PLAYBOOK](../Architecture/ENGINEERING_PLAYBOOK.md)\n\n',
  'docs/Workflows/Gemini_Frontend.md': '> **Navigation:** [← Back to README](../../README.md) · [Architecture](../Architecture/) · [Domain](../Domain/) · [Features](../Features/) · [API](../API/) · [ADR](../ADR/)\n> **Related:** [ENGINEERING_PLAYBOOK](../Architecture/ENGINEERING_PLAYBOOK.md)\n\n',

  'docs/UI/FRONTDOOR_Readme.md': '> **Navigation:** [← Back to README](../../README.md) · [Architecture](../Architecture/) · [Domain](../Domain/) · [Features](../Features/) · [API](../API/) · [ADR](../ADR/)\n> **Related:** [Frontend-Handbook](../../frontend/src/assets/docs/Frontend-Handbook.md)\n\n',
};

for (const [filePath, header] of Object.entries(filesToUpdate)) {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    fs.writeFileSync(fullPath, header + content, 'utf8');
    console.log(`Prepended header to ${filePath}`);
  } else {
    console.error(`File not found: ${filePath}`);
  }
}
