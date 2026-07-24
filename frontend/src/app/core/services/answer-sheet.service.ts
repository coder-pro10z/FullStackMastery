import { Injectable, signal } from '@angular/core';
import { AnswerSheetUnion, SqlAnswerSheet, TheoryAnswerSheet, UserSheetMetadata } from '../models/answer-sheet.models';

@Injectable({
  providedIn: 'root'
})
export class AnswerSheetService {
  // Signals
  isOpen = signal<boolean>(false);
  viewMode = signal<'drawer' | 'fullscreen'>('drawer');
  interviewMode = signal<boolean>(false);
  activeSheet = signal<AnswerSheetUnion | null>(null);
  activeMetadata = signal<UserSheetMetadata>({
    confidenceRating: 0,
    userNotes: '',
    reviews: [
      { stage: '1st Review', completed: false },
      { stage: '2nd Review', completed: false },
      { stage: '3rd Review', completed: false }
    ]
  });

  // Available Sheet IDs list for prev/next navigation
  private sheetOrder: string[] = ['A03', 'S01', 'SC06', 'SC01', 'C01'];

  // Mock Database of Answer Sheets
  private sheetsMap = new Map<string, AnswerSheetUnion>([
    ['A03', MOCK_THEORY_A03],
    ['S01', MOCK_THEORY_S01],
    ['SC06', MOCK_SQL_SC06],
    ['SC01', MOCK_SQL_SC01],
    ['C01', MOCK_THEORY_C01]
  ]);

  openSheet(id: string): void {
    let sheet = this.sheetsMap.get(id);

    // Fallback generator for unmapped competencies
    if (!sheet) {
      sheet = this.generateFallbackSheet(id);
    }

    this.activeSheet.set(sheet);
    this.loadUserMetadata(id);
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  toggleViewMode(): void {
    this.viewMode.update(mode => (mode === 'drawer' ? 'fullscreen' : 'drawer'));
  }

  nextSheet(): void {
    const current = this.activeSheet();
    if (!current) return;
    const currentId = current.sheetType === 'theory' ? current.competencyId : current.questionId;
    const idx = this.sheetOrder.indexOf(currentId);
    if (idx !== -1 && idx < this.sheetOrder.length - 1) {
      this.openSheet(this.sheetOrder[idx + 1]);
    }
  }

  prevSheet(): void {
    const current = this.activeSheet();
    if (!current) return;
    const currentId = current.sheetType === 'theory' ? current.competencyId : current.questionId;
    const idx = this.sheetOrder.indexOf(currentId);
    if (idx > 0) {
      this.openSheet(this.sheetOrder[idx - 1]);
    }
  }

  updateConfidence(rating: number): void {
    this.activeMetadata.update(meta => {
      const updated = { ...meta, confidenceRating: rating };
      this.saveUserMetadata(updated);
      return updated;
    });
  }

  updateNotes(notes: string): void {
    this.activeMetadata.update(meta => {
      const updated = { ...meta, userNotes: notes };
      this.saveUserMetadata(updated);
      return updated;
    });
  }

  toggleReview(index: number): void {
    this.activeMetadata.update(meta => {
      const updatedReviews = [...meta.reviews];
      const target = updatedReviews[index];
      const isDone = !target.completed;
      const today = new Date().toLocaleDateString('en-GB');

      updatedReviews[index] = {
        ...target,
        completed: isDone,
        date: isDone ? today : undefined
      };

      const updated = { ...meta, reviews: updatedReviews };
      this.saveUserMetadata(updated);
      return updated;
    });
  }

  private loadUserMetadata(id: string): void {
    const key = `answer_sheet_meta_${id}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        this.activeMetadata.set(JSON.parse(stored));
        return;
      } catch (e) {
        console.error('Failed to parse answer sheet metadata', e);
      }
    }
    // Default fallback metadata
    this.activeMetadata.set({
      confidenceRating: id === 'A03' ? 4 : id === 'SC06' ? 3 : 0,
      userNotes: '',
      reviews: [
        { stage: '1st Review', completed: false },
        { stage: '2nd Review', completed: false },
        { stage: '3rd Review', completed: false }
      ]
    });
  }

  private saveUserMetadata(meta: UserSheetMetadata): void {
    const current = this.activeSheet();
    if (!current) return;
    const id = current.sheetType === 'theory' ? current.competencyId : current.questionId;
    localStorage.setItem(`answer_sheet_meta_${id}`, JSON.stringify(meta));
  }

  private generateFallbackSheet(id: string): TheoryAnswerSheet {
    const fullTitle = COMPETENCY_TITLES[id] || `Competency ${id}`;
    const shortName = fullTitle.split('(')[0].trim();

    return {
      sheetType: 'theory',
      topic: fullTitle,
      competencyId: id,
      dayNumber: 1,
      date: new Date().toLocaleDateString('en-GB'),
      difficulty: 3,
      importance: 4,
      timeTaken: '1.5 Hours',
      revisionDate: '--/--/----',
      definition: `${shortName} is a fundamental concept required for mastering Full-Stack .NET & Angular development.`,
      whyItMatters: [
        `Promotes maintainable architecture when implementing ${shortName}`,
        `Core competency tested in Senior Full-Stack Technical Interviews`,
        `Directly impacts application execution, reliability, and code quality`
      ],
      keyConcepts: [
        { title: 'Core Mechanics', description: `Understanding how the runtime processes ${shortName}.` },
        { title: 'Architecture Patterns', description: `Structuring components and services around ${shortName} best practices.` }
      ],
      howItWorks: {
        steps: [
          { number: 1, label: 'Client Dispatch', sub: `Initiates ${shortName} request` },
          { number: 2, label: 'Pipeline Processing', sub: 'Executes core business logic' },
          { number: 3, label: 'Execution & Return', sub: 'Returns processed response to caller' }
        ]
      },
      codeExamples: [
        {
          sectionTitle: '5. Example Implementation',
          snippets: [
            {
              title: 'SampleImplementation.cs',
              language: 'csharp',
              code: `public class DemoService : IDemoService\n{\n    public async Task<string> ProcessAsync()\n    {\n        // Business logic execution for ${shortName}\n        return await Task.FromResult("Executed successfully for ${shortName}");\n    }\n}`
            }
          ]
        }
      ],
      serviceLifetimes: [],
      bestPractices: [
        `Keep ${shortName} logic explicit and modular`,
        'Write automated unit tests for edge cases',
        'Follow SOLID principles'
      ],
      interviewQuestions: [
        `What is the primary purpose of ${shortName}?`,
        `How do you handle edge cases in ${shortName}?`,
        `What performance considerations apply to ${shortName}?`
      ],
      realWorldUseCase: `In production applications, ${shortName} is applied across core workflows to handle secure processing and maintain scalable architecture.`,
      quickRevision: `${shortName} helps maintain clean separation of concerns and high testability.`,
      thingsToRemember: [
        'Understand trade-offs and runtime behavior',
        'Always profile performance before optimizing'
      ],
      quote: '"The best way to predict the future is to write clean, maintainable code today."'
    };
  }
}

// ── Complete 75 Permanent Competency Title Index ──────────────────────────────
const COMPETENCY_TITLES: Record<string, string> = {
  // C# Core (C01-C15)
  C01: 'OOP Principles (Encapsulation, Inheritance, Polymorphism, Abstraction)',
  C02: 'Memory Management (Stack vs Heap, Value Types vs Reference Types, Boxing & Unboxing)',
  C03: 'Garbage Collection (GC, Generations 0/1/2, LOH, Dispose vs Finalize)',
  C04: 'Exception Handling (try-catch-finally, Custom Exceptions, throw vs throw ex)',
  C05: 'Async Programming (async/await, Task, Task.Run(), CPU-bound vs I/O-bound)',
  C06: 'Collections (Array, List, Dictionary, HashSet, Queue, Stack, Concurrent Collections)',
  C07: 'LINQ (Deferred vs Immediate Execution, IEnumerable vs IQueryable)',
  C08: 'Delegates & Lambda Expressions',
  C09: 'Events (Publisher-Subscriber Pattern)',
  C10: 'Generics',
  C11: 'Interface vs Abstract Class',
  C12: 'Access Modifiers',
  C13: 'Static Concepts (Static Class, Static Method, Static Constructor, Singleton)',
  C14: 'Extension Methods',
  C15: 'SOLID Principles',

  // ASP.NET Core (A01-A15)
  A01: 'ASP.NET Core vs .NET Framework',
  A02: 'Request Pipeline & Middleware',
  A03: 'Dependency Injection & Service Lifetimes',
  A04: 'IEnumerable vs IQueryable vs IAsyncEnumerable',
  A05: 'Entity Framework Core',
  A06: 'Authentication vs Authorization',
  A07: 'REST APIs & HTTP Status Codes',
  A08: 'Model Binding & Validation',
  A09: 'Repository Pattern & Unit of Work',
  A10: 'Global Exception Handling',
  A11: 'CORS',
  A12: 'Logging & Configuration',
  A13: 'API Performance Optimization',
  A14: 'CQRS & MediatR',
  A15: 'Production API Troubleshooting',

  // SQL Theory (S01-S15)
  S01: 'SQL Joins',
  S02: 'Clustered vs Non-Clustered Index',
  S03: 'Common Table Expressions (CTE)',
  S04: 'Window Functions',
  S05: 'Stored Procedures vs Functions',
  S06: 'Transactions & ACID Properties',
  S07: 'Isolation Levels',
  S08: 'Deadlocks',
  S09: 'Execution Plans',
  S10: 'Query Performance Tuning',
  S11: 'Temp Tables vs Table Variables',
  S12: 'Views',
  S13: 'Keys & Constraints',
  S14: 'Pagination',
  S15: 'Normalization vs Denormalization',

  // SQL Coding (SC01-SC15)
  SC01: 'Find the 2nd Highest Salary',
  SC02: 'Find the Nth Highest Salary',
  SC03: 'Find Duplicate Records',
  SC04: 'Delete Duplicate Records',
  SC05: 'Employees Earning More Than Their Manager',
  SC06: 'Highest Salary in Each Department',
  SC07: 'Department with Maximum Employees',
  SC08: 'Customers with No Orders',
  SC09: 'Running Total',
  SC10: 'Top 3 Salaries per Department',
  SC11: 'Employees Joined in the Last 30 Days',
  SC12: 'Find Missing IDs',
  SC13: 'Swap Column Values',
  SC14: 'Consecutive Duplicate Values',
  SC15: 'SQL Pagination',

  // Angular (NG01-NG15)
  NG01: 'Dependency Injection (DI)',
  NG02: 'Observables vs Promises',
  NG03: 'Component Lifecycle Hooks',
  NG04: 'Change Detection Strategy',
  NG05: 'Reactive Forms',
  NG06: 'Angular Routing & Lazy Loading',
  NG07: 'HTTP Client & Interceptors',
  NG08: 'JWT Authentication & Route Guards',
  NG09: 'Angular Decorators',
  NG10: 'Component Communication',
  NG11: 'Directives & Pipes',
  NG12: 'Standalone Components & Modules',
  NG13: 'State Management (BehaviorSubject / NgRx / Signals)',
  NG14: 'Performance Optimization (trackBy, Lazy Loading, OnPush)',
  NG15: 'Signals vs Observables'
};

// ── Image 1 Mock: Theory Answer Sheet (ASP.NET Core DI) ──────────────────────
const MOCK_THEORY_A03: TheoryAnswerSheet = {
  sheetType: 'theory',
  topic: 'Dependency Injection in ASP.NET Core',
  competencyId: 'A03',
  dayNumber: 12,
  date: '15 May 2025',
  difficulty: 4,
  importance: 5,
  timeTaken: '2.5 Hours',
  revisionDate: '__ / __ / ____',
  definition: 'Dependency Injection (DI) is a design pattern in which an object\'s dependencies are provided (injected) by an external source rather than the object creating them itself. In ASP.NET Core, DI is a built-in feature managed by the framework.',
  whyItMatters: [
    'Promotes loose coupling',
    'Improves testability',
    'Makes code easier to maintain',
    'Follows SOLID Principle (D - Dependency Inversion)',
    'Built-in DI container in ASP.NET Core is lightweight and fast'
  ],
  keyConcepts: [
    { title: 'Service', description: 'A class that provides some functionality.' },
    { title: 'Dependency', description: 'A service that another service depends on.' },
    { title: 'DI Container', description: 'Built-in container that manages object creation and lifetime.' },
    {
      title: 'Lifetimes',
      description: 'Controls when service instances are created and disposed:',
      items: [
        'Transient: New instance every time requested.',
        'Scoped: One instance per HTTP request (default for web apps).',
        'Singleton: One single instance for the entire application lifetime.'
      ]
    }
  ],
  howItWorks: {
    title: '4. How It Works (Behind the Scenes)',
    steps: [
      { number: 1, label: 'Request Service', sub: 'Client controller asks for interface' },
      { number: 2, label: 'Create / Get Service', sub: 'DI Container resolves registered implementation' },
      { number: 3, label: 'Return Instance', sub: 'Injects service instance into constructor' }
    ],
    flowNodes: [
      { id: 'client', label: 'HTTP Controller', sublabel: 'Requests IEmailService', icon: 'globe', status: 'completed' },
      { id: 'container', label: 'IServiceProvider Container', sublabel: 'Resolves Scoped Lifetime', icon: 'cpu', status: 'active' },
      { id: 'service', label: 'EmailService Instance', sublabel: 'Injected into Constructor', icon: 'zap', status: 'completed' }
    ],
    flowDiagram: {
      client: 'Client (Controller / Service)',
      container: 'DI Container (IServiceProvider)',
      service: 'Service (Dependency)'
    }
  },
  interviewSpeechFlow: {
    intro: "Dependency Injection is a design pattern in ASP.NET Core where an object's dependencies are provided by the framework rather than created by the object itself.",
    steps: [
      {
        stepNumber: 1,
        label: "Explain Why We Use It",
        script: "Before DI, classes created their own dependencies, causing tight coupling and making unit testing difficult. DI flips this control so dependencies are injected.",
        tip: "Explicitly reference the Dependency Inversion principle in SOLID."
      },
      {
        stepNumber: 2,
        label: "Describe the Three Service Lifetimes",
        script: "ASP.NET Core has three built-in service lifetimes: Transient creates a new object every time, Scoped creates one instance per HTTP request, and Singleton creates a single instance for the entire app lifetime.",
        tip: "Give DbContext as the classic example of a Scoped service."
      },
      {
        stepNumber: 3,
        label: "Explain Registration and Constructor Injection",
        script: "We register services in Program.cs using builder.Services.AddScoped, and then request them in controllers via constructor injection.",
        tip: "Mention Captive Dependencies (injecting a Scoped service into a Singleton) as an advanced interview answer."
      }
    ],
    closingStatement: "Using DI results in loosely coupled, easily testable, and clean architectural code."
  },
  relatedQuestions: [
    {
      id: 104,
      title: "What are the three service lifetimes in ASP.NET Core Dependency Injection?",
      categoryName: "ASP.NET Core",
      difficulty: "Medium",
      tags: ["Dependency Injection", "Lifetimes", "Architecture"]
    },
    {
      id: 108,
      title: "What is a Captive Dependency and how do you prevent it in .NET?",
      categoryName: "ASP.NET Core",
      difficulty: "Hard",
      tags: ["Dependency Injection", "Memory", "Architecture"]
    }
  ],
  codeExamples: [
    {
      sectionTitle: '5. Example',
      snippets: [
        {
          title: '5.1 Create a Service',
          language: 'csharp',
          code: `// IEmailService.cs\npublic interface IEmailService\n{\n    void SendEmail(string to, string subject, string body);\n}\n\n// EmailService.cs\npublic class EmailService : IEmailService\n{\n    public void SendEmail(string to, string subject, string body)\n    {\n        // Logic to send email\n        Console.WriteLine($"Email sent to {to} with subject {subject}");\n    }\n}`
        },
        {
          title: '5.2 Register Service in Program.cs',
          language: 'csharp',
          code: `builder.Services.AddScoped<IEmailService, EmailService>();`
        },
        {
          title: '5.3 Inject and Use in Controller',
          language: 'csharp',
          code: `public class HomeController : ControllerBase\n{\n    private readonly IEmailService _emailService;\n\n    public HomeController(IEmailService emailService)\n    {\n        _emailService = emailService;\n    }\n\n    [HttpGet("send")]\n    public IActionResult Send()\n    {\n        _emailService.SendEmail("test@example.com", "Hello", "This is DI!");\n        return Ok("Email Sent");\n    }\n}`
        }
      ]
    }
  ],
  serviceLifetimes: [
    {
      lifetime: 'Transient',
      icon: 'zap',
      useWhen: 'When a new instance is required every time.',
      example: 'Logging, Helper Services',
      colorTheme: 'green'
    },
    {
      lifetime: 'Scoped',
      icon: 'refresh-cw',
      useWhen: 'When a single instance is needed per request.',
      example: 'DbContext, Business Services',
      colorTheme: 'blue'
    },
    {
      lifetime: 'Singleton',
      icon: 'shield',
      useWhen: 'When a single instance is needed for the entire application.',
      example: 'Caching, Configuration Services',
      colorTheme: 'purple'
    }
  ],
  bestPractices: [
    'Depend on abstractions, not concretions.',
    'Keep services small and focused.',
    'Use appropriate service lifetime.',
    'Avoid using IServiceProvider directly in code.',
    'Prefer constructor injection.'
  ],
  interviewQuestions: [
    'What is Dependency Injection?',
    'What are the benefits of DI?',
    'What are the different service lifetimes in ASP.NET Core?',
    'How is DI different from Singleton pattern?',
    'How do you inject a service into another service?',
    'Can we inject a service into a private method?',
    'What is constructor injection?'
  ],
  realWorldUseCase: 'In a typical ASP.NET Core application, services like EmailService, PaymentService, UserService are injected into controllers. This makes it easy to replace implementations, write unit tests, and maintain the application.',
  quickRevision: 'DI helps us achieve loose coupling by injecting dependencies from outside and is a core part of ASP.NET Core.',
  thingsToRemember: [
    'Register in Program.cs',
    'Choose correct lifetime',
    'Inject via constructor (preferred)',
    'Depend on abstractions'
  ],
  quote: '"The goal is not to write code that works, the goal is to write code that is maintainable, testable and scalable."'
};

// ── Mock: Theory Answer Sheet S01 (SQL Joins) ────────────────────────────────
const MOCK_THEORY_S01: TheoryAnswerSheet = {
  sheetType: 'theory',
  topic: 'SQL Joins (INNER, LEFT, RIGHT, FULL, CROSS, SELF)',
  competencyId: 'S01',
  dayNumber: 1,
  date: '23/07/2026',
  difficulty: 3,
  importance: 5,
  timeTaken: '1.5 Hours',
  revisionDate: '--/--/----',
  definition: 'SQL Joins combine columns from one or more tables based on a shared column relationship (Foreign Key constraint).',
  whyItMatters: [
    'Fundamental for relational database querying in EF Core, Dapper, and T-SQL',
    'Core competency tested in Senior Full-Stack Technical Interviews',
    'Directly impacts SQL query execution performance, index usage, and memory'
  ],
  keyConcepts: [
    { title: 'INNER JOIN', description: 'Returns records that have matching values in both tables.' },
    { title: 'LEFT (OUTER) JOIN', description: 'Returns all records from the left table, and matched records from right table.' },
    { title: 'RIGHT (OUTER) JOIN', description: 'Returns all records from the right table, and matched records from left table.' },
    { title: 'FULL (OUTER) JOIN', description: 'Returns all records when there is a match in left or right table.' },
    { title: 'CROSS JOIN', description: 'Produces a Cartesian product of both tables (N × M rows).' }
  ],
  howItWorks: {
    title: 'How SQL Joins Execute Behind the Scenes',
    steps: [
      { number: 1, label: 'Query Optimizer Evaluation', sub: 'Evaluates Hash Join, Nested Loops, or Merge Join strategy' },
      { number: 2, label: 'Predicate Matching', sub: 'Filters rows matching ON condition' },
      { number: 3, label: 'Result Set Assembly', sub: 'Projects combined column attributes to caller' }
    ],
    flowNodes: [
      { id: 't1', label: 'Employees Table (Left)', sublabel: '3 Rows (emp_id, name, dept_id)', icon: 'database', status: 'completed' },
      { id: 'engine', label: 'SQL Hash / Nested Loop Join Engine', sublabel: 'ON e.dept_id = d.id', icon: 'git-merge', status: 'active' },
      { id: 't2', label: 'Departments Table (Right)', sublabel: '3 Rows (id, dept_name)', icon: 'database', status: 'completed' }
    ]
  },
  interviewSpeechFlow: {
    intro: "SQL Joins are relational operations that combine matching data across multiple tables using primary and foreign key constraints.",
    steps: [
      {
        stepNumber: 1,
        label: "Explain INNER vs LEFT JOIN Difference",
        script: "INNER JOIN returns only rows with matches in both tables, whereas LEFT JOIN returns all rows from the primary table plus matching rows from the joined table, filling missing matches with NULL.",
        tip: "Explain NULL handling in LEFT JOINs explicitly."
      },
      {
        stepNumber: 2,
        label: "Describe Join Strategies Used by SQL Server Optimizer",
        script: "Under the hood, SQL Server uses three main join physical operators: Nested Loop Join for small datasets, Hash Match for large unindexed datasets, and Merge Join for sorted indexed datasets.",
        tip: "Mentioning Nested Loop vs Hash Join impresses senior interviewers."
      }
    ],
    closingStatement: "Selecting the correct JOIN type and indexing foreign key columns is essential for scalable database performance."
  },
  relatedQuestions: [
    {
      id: 201,
      title: "What is the difference between INNER JOIN and LEFT JOIN in SQL?",
      categoryName: "SQL Theory",
      difficulty: "Easy",
      tags: ["SQL", "Joins", "Database"]
    },
    {
      id: 204,
      title: "Explain Hash Match vs Nested Loop Join in SQL Server Query Plans",
      categoryName: "SQL Performance",
      difficulty: "Hard",
      tags: ["SQL Server", "Execution Plan", "Performance"]
    }
  ],
  codeExamples: [
    {
      sectionTitle: '5. SQL Code Examples',
      snippets: [
        {
          title: 'InnerJoin.sql',
          language: 'sql',
          code: `SELECT e.EmployeeName, d.DepartmentName\nFROM Employees e\nINNER JOIN Departments d ON e.DepartmentID = d.DepartmentID;`
        },
        {
          title: 'LeftJoin.sql',
          language: 'sql',
          code: `SELECT e.EmployeeName, ISNULL(d.DepartmentName, 'Unassigned') AS Dept\nFROM Employees e\nLEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID;`
        }
      ]
    }
  ],
  serviceLifetimes: [],
  bestPractices: [
    'Always index Foreign Key columns used in JOIN conditions',
    'Filter before joining using WHERE or CTEs for large tables',
    'Avoid CROSS JOINs unless explicitly generating Cartesian sets'
  ],
  interviewQuestions: [
    'What is the difference between INNER JOIN and LEFT JOIN?',
    'What happens when a LEFT JOIN finds multiple matching rows in the right table?',
    'What is a Self Join and when would you use it?'
  ],
  realWorldUseCase: 'In e-commerce platforms, joining Orders with Customers and OrderItems allows rendering full invoice receipts in a single fast query.',
  quickRevision: 'INNER JOIN returns matching rows in both tables; LEFT JOIN returns all rows from left table with NULLs for unmatched right rows.',
  thingsToRemember: [
    'Check Foreign Key index coverage',
    'Be careful with NULL checks on outer joins'
  ],
  quote: '"Relational power lies in well-indexed JOIN operations."'
};

// ── Image 2 Mock: SQL Coding Answer Sheet (Highest Salary) ─────────────────
const MOCK_SQL_SC06: SqlAnswerSheet = {
  sheetType: 'sql',
  questionId: 'SC06',
  difficulty: 4,
  topic: 'Highest Salary in Each Department',
  askedIn: ['Amazon', 'Microsoft', 'TCS', 'Infosys'],
  dateSolved: '-- / -- / ----',
  sqlConcepts: ['GROUP BY', 'MAX()', 'JOIN', 'Window Functions (RANK / DENSE_RANK)'],
  database: 'SQL Server (T-SQL)',
  timeTaken: '25 mins',
  leetCodeUrl: 'https://leetcode.com/problems/department-highest-salary/',
  leetCodeNumber: 184,
  leetCodeDifficulty: 'Medium',
  interviewSpeechFlow: {
    intro: "To find the highest salary in each department, we partition the employee data by department and filter for rank equal to 1 using a Window Function like DENSE_RANK().",
    steps: [
      {
        stepNumber: 1,
        label: "Explain Why GROUP BY Alone Is Not Enough",
        script: "A simple GROUP BY with MAX(Salary) gives us department IDs and highest salaries, but loses the employee names. To keep employee names, we need a window function or a subquery.",
        tip: "Point out why naive MAX() query fails to return employee names."
      },
      {
        stepNumber: 2,
        label: "Present the Window Function Approach",
        script: "Using DENSE_RANK() OVER (PARTITION BY DepartmentID ORDER BY Salary DESC), we rank employees within each department. We then wrap this in a subquery and select rows where rnk = 1.",
        tip: "DENSE_RANK handles ties gracefully if multiple employees share the top salary."
      }
    ],
    closingStatement: "This single-pass window function approach is optimal and handles ties cleanly."
  },
  relatedQuestions: [
    {
      id: 201,
      title: "Write a SQL query to find the 2nd highest salary in an Organization",
      categoryName: "SQL Practice",
      difficulty: "Medium",
      tags: ["SQL", "Window Functions", "DENSE_RANK"]
    }
  ],
  problemStatement: {
    description: 'Write a SQL query to find the highest salary in each department. Return department name and the highest salary. If multiple employees have the same highest salary in a department, return all of them.',
    exampleOutput: {
      headers: ['DepartmentName', 'EmployeeName', 'Salary'],
      rows: [
        ['IT', 'John', 90000],
        ['HR', 'Alice', 70000],
        ['Sales', 'Robert', 85000],
        ['Sales', 'Monica', 85000]
      ]
    }
  },
  tableStructure: {
    tableName: 'Employee',
    columns: [
      { name: 'EmployeeID', type: 'INT', constraints: 'PK', description: 'Unique employee id' },
      { name: 'EmployeeName', type: 'VARCHAR(100)', constraints: 'NOT NULL', description: 'Name of the employee' },
      { name: 'DepartmentID', type: 'INT', constraints: 'FK', description: 'Department id' },
      { name: 'DepartmentName', type: 'VARCHAR(100)', constraints: 'NOT NULL', description: 'Name of the department' },
      { name: 'Salary', type: 'INT', constraints: 'NOT NULL', description: 'Salary of the employee' }
    ],
    relationships: 'Employee.DepartmentID -> DepartmentID (Self reference in same table)'
  },
  sampleData: {
    tableName: 'Employee Table',
    headers: ['EmployeeID', 'EmployeeName', 'DepartmentID', 'DepartmentName', 'Salary'],
    rows: [
      [1, 'John', 10, 'IT', 90000],
      [2, 'Mike', 10, 'IT', 70000],
      [3, 'Alice', 20, 'HR', 70000],
      [4, 'Bob', 20, 'HR', 50000],
      [5, 'Robert', 30, 'Sales', 85000],
      [6, 'Monica', 30, 'Sales', 85000],
      [7, 'Steve', 30, 'Sales', 60000]
    ]
  },
  approach: {
    points: [
      'We need the maximum salary for each department.',
      'There can be multiple employees with the same maximum salary in a department.',
      'Window functions are cleaner and more efficient than JOINs with GROUP BY.'
    ],
    strategies: [
      'Using GROUP BY + MAX() (doesn\'t return employee names directly)',
      'Using JOIN with subquery',
      'Using Window Function (RANK / DENSE_RANK)'
    ]
  },
  solutions: {
    bruteForce: {
      title: 'BRUTE FORCE SOLUTION',
      approachTitle: 'Using Correlated Subquery',
      code: `SELECT e1.DepartmentName, e1.EmployeeName, e1.Salary\nFROM Employee e1\nWHERE e1.Salary = (\n  SELECT MAX(e2.Salary)\n  FROM Employee e2\n  WHERE e2.DepartmentID = e1.DepartmentID\n);`,
      pros: ['Easy to understand'],
      cons: ['May be slower on large datasets', 'Subquery executed for each row']
    },
    optimal: {
      title: 'OPTIMAL SOLUTION (RECOMMENDED)',
      approachTitle: 'Using Window Function (RANK)',
      code: `SELECT DepartmentName, EmployeeName, Salary\nFROM (\n  SELECT DepartmentName, EmployeeName, Salary,\n         RANK() OVER (PARTITION BY DepartmentID ORDER BY Salary DESC) AS rnk\n  FROM Employee\n) t\nWHERE rnk = 1\nORDER BY DepartmentName, EmployeeName;`,
      whyOptimal: [
        'Single pass through the data',
        'Handles ties correctly',
        'Scalable for large datasets'
      ]
    },
    alternate: {
      title: 'ALTERNATE SOLUTION',
      approachTitle: 'Using JOIN with Subquery',
      code: `SELECT e.DepartmentName, e.EmployeeName, e.Salary\nFROM Employee e\nJOIN (\n  SELECT DepartmentID, MAX(Salary) AS MaxSalary\n  FROM Employee\n  GROUP BY DepartmentID\n) maxsal\nON e.DepartmentID = maxsal.DepartmentID\nAND e.Salary = maxsal.MaxSalary\nORDER BY e.DepartmentName, e.EmployeeName;`,
      notes: 'Works well but JOIN + Subquery may be slightly heavier than window function.'
    }
  },
  lineByLineExplanation: [
    { lineNo: 1, code: 'SELECT DepartmentName, EmployeeName, Salary', explanation: 'Outer query selects target columns for final output.' },
    { lineNo: 2, code: 'FROM ( SELECT ..., RANK() OVER (...) AS rnk', explanation: 'Inner query calculates rank for each employee partitioned by department.' },
    { lineNo: 3, code: 'PARTITION BY DepartmentID', explanation: 'Ranking restarts for each department.' },
    { lineNo: 4, code: 'ORDER BY Salary DESC', explanation: 'Highest salary gets rank = 1.' },
    { lineNo: 5, code: 'WHERE rnk = 1', explanation: 'Outer query filters rows where rank = 1 (highest salary).' },
    { lineNo: 6, code: 'ORDER BY DepartmentName, EmployeeName', explanation: 'Finally, results are ordered by department and employee name.' }
  ],
  timeComplexity: {
    time: 'O(n log n)',
    space: 'O(n)',
    description: '(n = number of employees). Efficient for large datasets.'
  },
  followUpQuestions: [
    'What if we need the 2nd highest salary in each department?',
    'What if we only need department name and highest salary (no employee names)?',
    'How to break ties and return only one employee per department?',
    'Can you write the same using DENSE_RANK()?'
  ],
  realWorldVariation: {
    description: 'Find the highest salary employees in each department for employees who joined in the last 1 year.',
    hint: 'Add WHERE clause with JOIN Date filter inside inner query.'
  },
  keyTakeaways: [
    'Window functions are your best friend for ranking problems.',
    'Understand PARTITION BY deeply.',
    'Always consider performance for large datasets.',
    'Practice both JOIN + Subquery and Window Function approaches.'
  ],
  quote: '"The best way to predict the future is to write efficient SQL today."'
};

// ── Mock 3: SQL SC01 ───────────────────────────────────────────────────────
const MOCK_SQL_SC01: SqlAnswerSheet = {
  ...MOCK_SQL_SC06,
  questionId: 'SC01',
  topic: 'Find 2nd Highest Salary in Department',
  difficulty: 3,
  timeTaken: '15 mins',
  solutions: {
    ...MOCK_SQL_SC06.solutions,
    optimal: {
      ...MOCK_SQL_SC06.solutions.optimal,
      code: `SELECT DepartmentName, EmployeeName, Salary\nFROM (\n  SELECT DepartmentName, EmployeeName, Salary,\n         DENSE_RANK() OVER (PARTITION BY DepartmentID ORDER BY Salary DESC) AS rnk\n  FROM Employee\n) t\nWHERE rnk = 2;`
    }
  }
};

// ── Mock 4: C# Core C01 ────────────────────────────────────────────────────
const MOCK_THEORY_C01: TheoryAnswerSheet = {
  ...MOCK_THEORY_A03,
  competencyId: 'C01',
  topic: 'C# Memory Management & Garbage Collection',
  definition: 'Garbage Collection (GC) in .NET is an automatic memory management feature that frees memory occupied by objects no longer in use.',
  quickRevision: 'GC manages Heap memory automatically using 3 Generations (Gen 0, Gen 1, Gen 2).'
};
