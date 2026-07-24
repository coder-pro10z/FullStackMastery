export interface FlowNode {
  id: string;
  label: string;
  sublabel?: string;
  icon?: string;
  parents?: string[];
  status?: 'completed' | 'active' | 'pending';
  type?: 'start' | 'process' | 'decision' | 'end';
}

export interface InterviewSpeechStep {
  stepNumber: number;
  label: string;
  script: string;
  tip?: string;
  codeSnippetRef?: string;
}

export interface InterviewSpeechFlow {
  intro: string;
  steps: InterviewSpeechStep[];
  closingStatement: string;
}

export interface RelatedQuestionReference {
  id: number;
  title: string;
  categoryName: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags?: string[];
}

export interface TheoryAnswerSheet {
  sheetType: 'theory';
  topic: string;
  competencyId: string;
  dayNumber: number;
  date: string;
  difficulty: number;
  importance: number;
  timeTaken: string;
  revisionDate: string;
  definition: string;
  whyItMatters: string[];
  keyConcepts: {
    title: string;
    description: string;
    items?: string[];
  }[];
  howItWorks: {
    title?: string;
    steps: { number: number; label: string; sub?: string }[];
    flowNodes?: FlowNode[];
    diagramDirection?: 'horizontal' | 'vertical';
    diagramTheme?: 'blue' | 'emerald' | 'amber' | 'violet';
    flowDiagram?: {
      client: string;
      container: string;
      service: string;
    };
    note?: string;
  };
  interviewSpeechFlow?: InterviewSpeechFlow;
  relatedQuestions?: RelatedQuestionReference[];
  codeExamples: {
    sectionTitle: string;
    snippets: { title?: string; language: string; code: string }[];
  }[];
  serviceLifetimes: {
    lifetime: string;
    icon: string;
    useWhen: string;
    example: string;
    colorTheme: 'green' | 'blue' | 'purple' | 'amber';
  }[];
  bestPractices: string[];
  interviewQuestions: string[];
  realWorldUseCase: string;
  quickRevision: string;
  thingsToRemember: string[];
  quote: string;
}

export interface SqlAnswerSheet {
  sheetType: 'sql';
  questionId: string;
  difficulty: number;
  topic: string;
  askedIn: string[];
  dateSolved: string;
  sqlConcepts: string[];
  database: string;
  timeTaken: string;
  leetCodeUrl?: string;
  leetCodeNumber?: number;
  leetCodeDifficulty?: 'Easy' | 'Medium' | 'Hard';
  interviewSpeechFlow?: InterviewSpeechFlow;
  relatedQuestions?: RelatedQuestionReference[];
  problemStatement: {
    description: string;
    exampleOutput: { headers: string[]; rows: (string | number)[][] };
  };
  tableStructure: {
    tableName: string;
    columns: { name: string; type: string; constraints: string; description: string }[];
    relationships?: string;
  };
  sampleData: {
    tableName: string;
    headers: string[];
    rows: (string | number)[][];
  };
  approach: {
    points: string[];
    strategies: string[];
  };
  solutions: {
    bruteForce: {
      title: string;
      approachTitle: string;
      code: string;
      pros: string[];
      cons: string[];
    };
    optimal: {
      title: string;
      approachTitle: string;
      code: string;
      whyOptimal: string[];
    };
    alternate: {
      title: string;
      approachTitle: string;
      code: string;
      notes: string;
    };
  };
  lineByLineExplanation: {
    lineNo: number;
    code: string;
    explanation: string;
  }[];
  timeComplexity: {
    time: string;
    space: string;
    description: string;
  };
  followUpQuestions: string[];
  realWorldVariation: {
    description: string;
    hint: string;
  };
  keyTakeaways: string[];
  quote: string;
}

export type AnswerSheetUnion = TheoryAnswerSheet | SqlAnswerSheet;

export interface UserSheetMetadata {
  confidenceRating: number;
  userNotes: string;
  reviews: {
    stage: '1st Review' | '2nd Review' | '3rd Review';
    date?: string;
    completed: boolean;
  }[];
}
