export interface Company {
  id: string;
  name: string;
  logo: string;
  industry: string;
}

export interface Interview {
  id: string;
  companyId: string;
  roleName: string;
  level: string;
  date: string;
}

export interface Round {
  id: string;
  interviewId: string;
  roundNumber: number;
  focusArea: string;
}

export interface Question {
  id: string;
  roundId: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  solutionMarkdown: string;
  diagramJSON: string;
}

// ── RAW API SHAPES (Adapter Shield Boundary) ──
// The UI MUST NEVER USE THESE DIRECTLY. They are only used by the Service to map to the strict models above.

export interface ApiCompany {
  id: string;
  name: string;
  logo_url?: string;
  industry_type?: string;
}

export interface ApiInterview {
  id: string;
  company_id: string;
  role_name: string;
  level_tier?: string;
  interview_date?: string;
}

export interface ApiRound {
  id: string;
  interview_id: string;
  round_number: number;
  focus_area?: string;
}

export interface ApiQuestion {
  id: string;
  round_id: string;
  title: string;
  difficulty_level?: 'Easy' | 'Medium' | 'Hard';
  category_name?: string;
  solution_md?: string;
  diagram_payload?: string;
}
