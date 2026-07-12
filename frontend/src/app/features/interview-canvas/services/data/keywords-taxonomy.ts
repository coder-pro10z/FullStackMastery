/**
 * Technical keyword taxonomy — ~500 curated terms organized by category.
 * Used by BrowserKeywordExtractorService for fast O(n) substring matching.
 *
 * Each entry: [normalizedTerm, category]
 * When a backend is wired up this file becomes optional (API handles taxonomy).
 */
export interface TaxonomyEntry {
  term: string;           // display name
  normalized: string;     // lowercase for matching
  category: string;
  aliases?: string[];     // alternate spellings
}

export const KEYWORD_TAXONOMY: TaxonomyEntry[] = [
  // ── .NET / C# ─────────────────────────────────────────────
  { term: '.NET Core', normalized: '.net core', category: 'Backend', aliases: ['dotnet core', '.net 6', '.net 7', '.net 8'] },
  { term: 'ASP.NET Core', normalized: 'asp.net core', category: 'Backend', aliases: ['asp.net'] },
  { term: 'C#', normalized: 'c#', category: 'Language', aliases: ['csharp'] },
  { term: 'Entity Framework', normalized: 'entity framework', category: 'ORM', aliases: ['ef core', 'entity framework core'] },
  { term: 'LINQ', normalized: 'linq', category: 'Backend' },
  { term: 'Kestrel', normalized: 'kestrel', category: 'Backend' },
  { term: 'SignalR', normalized: 'signalr', category: 'Backend' },
  { term: 'Blazor', normalized: 'blazor', category: 'Frontend' },
  { term: 'Minimal APIs', normalized: 'minimal apis', category: 'Backend' },
  { term: 'gRPC', normalized: 'grpc', category: 'Backend' },
  { term: 'NUnit', normalized: 'nunit', category: 'Testing' },
  { term: 'xUnit', normalized: 'xunit', category: 'Testing' },
  { term: 'Moq', normalized: 'moq', category: 'Testing' },

  // ── Java / Spring ──────────────────────────────────────────
  { term: 'Java', normalized: 'java', category: 'Language' },
  { term: 'Spring Boot', normalized: 'spring boot', category: 'Backend' },
  { term: 'Spring MVC', normalized: 'spring mvc', category: 'Backend' },
  { term: 'Hibernate', normalized: 'hibernate', category: 'ORM' },
  { term: 'Maven', normalized: 'maven', category: 'Build' },
  { term: 'Gradle', normalized: 'gradle', category: 'Build' },
  { term: 'JUnit', normalized: 'junit', category: 'Testing' },

  // ── JavaScript / TypeScript ────────────────────────────────
  { term: 'JavaScript', normalized: 'javascript', category: 'Language', aliases: ['js'] },
  { term: 'TypeScript', normalized: 'typescript', category: 'Language', aliases: ['ts'] },
  { term: 'Node.js', normalized: 'node.js', category: 'Backend', aliases: ['nodejs', 'node js'] },
  { term: 'Express.js', normalized: 'express.js', category: 'Backend', aliases: ['expressjs'] },
  { term: 'NestJS', normalized: 'nestjs', category: 'Backend' },

  // ── Frontend ──────────────────────────────────────────────
  { term: 'Angular', normalized: 'angular', category: 'Frontend' },
  { term: 'React', normalized: 'react', category: 'Frontend', aliases: ['reactjs', 'react.js'] },
  { term: 'Vue.js', normalized: 'vue.js', category: 'Frontend', aliases: ['vuejs', 'vue'] },
  { term: 'Next.js', normalized: 'next.js', category: 'Frontend', aliases: ['nextjs'] },
  { term: 'RxJS', normalized: 'rxjs', category: 'Frontend' },
  { term: 'NgRx', normalized: 'ngrx', category: 'Frontend' },
  { term: 'Tailwind CSS', normalized: 'tailwind', category: 'Frontend', aliases: ['tailwindcss'] },
  { term: 'HTML5', normalized: 'html5', category: 'Frontend', aliases: ['html'] },
  { term: 'CSS3', normalized: 'css3', category: 'Frontend', aliases: ['css'] },
  { term: 'SCSS', normalized: 'scss', category: 'Frontend', aliases: ['sass'] },
  { term: 'Webpack', normalized: 'webpack', category: 'Build' },
  { term: 'Vite', normalized: 'vite', category: 'Build' },

  // ── Databases ─────────────────────────────────────────────
  { term: 'SQL Server', normalized: 'sql server', category: 'Database', aliases: ['mssql', 'microsoft sql server'] },
  { term: 'PostgreSQL', normalized: 'postgresql', category: 'Database', aliases: ['postgres'] },
  { term: 'MySQL', normalized: 'mysql', category: 'Database' },
  { term: 'MongoDB', normalized: 'mongodb', category: 'Database', aliases: ['mongo'] },
  { term: 'Redis', normalized: 'redis', category: 'Database' },
  { term: 'Elasticsearch', normalized: 'elasticsearch', category: 'Database', aliases: ['elastic'] },
  { term: 'DynamoDB', normalized: 'dynamodb', category: 'Database' },
  { term: 'Cosmos DB', normalized: 'cosmos db', category: 'Database', aliases: ['cosmosdb', 'azure cosmos'] },
  { term: 'SQLite', normalized: 'sqlite', category: 'Database' },
  { term: 'Oracle', normalized: 'oracle', category: 'Database' },

  // ── Cloud ─────────────────────────────────────────────────
  { term: 'AWS', normalized: 'aws', category: 'Cloud', aliases: ['amazon web services'] },
  { term: 'Azure', normalized: 'azure', category: 'Cloud', aliases: ['microsoft azure'] },
  { term: 'GCP', normalized: 'gcp', category: 'Cloud', aliases: ['google cloud', 'google cloud platform'] },
  { term: 'S3', normalized: 's3', category: 'Cloud', aliases: ['amazon s3'] },
  { term: 'EC2', normalized: 'ec2', category: 'Cloud' },
  { term: 'Lambda', normalized: 'lambda', category: 'Cloud', aliases: ['aws lambda'] },
  { term: 'Azure Functions', normalized: 'azure functions', category: 'Cloud' },
  { term: 'Azure DevOps', normalized: 'azure devops', category: 'DevOps' },
  { term: 'Azure Service Bus', normalized: 'azure service bus', category: 'Cloud' },
  { term: 'Azure Blob Storage', normalized: 'azure blob', category: 'Cloud' },

  // ── DevOps / Infrastructure ────────────────────────────────
  { term: 'Docker', normalized: 'docker', category: 'DevOps' },
  { term: 'Kubernetes', normalized: 'kubernetes', category: 'DevOps', aliases: ['k8s'] },
  { term: 'Helm', normalized: 'helm', category: 'DevOps' },
  { term: 'Terraform', normalized: 'terraform', category: 'DevOps', aliases: ['iac'] },
  { term: 'CI/CD', normalized: 'ci/cd', category: 'DevOps', aliases: ['cicd', 'continuous integration', 'continuous deployment'] },
  { term: 'GitHub Actions', normalized: 'github actions', category: 'DevOps' },
  { term: 'Jenkins', normalized: 'jenkins', category: 'DevOps' },
  { term: 'Nginx', normalized: 'nginx', category: 'Infrastructure' },
  { term: 'Linux', normalized: 'linux', category: 'Infrastructure', aliases: ['ubuntu', 'bash scripting'] },
  { term: 'Ansible', normalized: 'ansible', category: 'DevOps' },

  // ── Architecture & Patterns ────────────────────────────────
  { term: 'Microservices', normalized: 'microservices', category: 'Architecture', aliases: ['microservice architecture'] },
  { term: 'REST API', normalized: 'rest api', category: 'Architecture', aliases: ['restful api', 'rest', 'restful'] },
  { term: 'GraphQL', normalized: 'graphql', category: 'Architecture' },
  { term: 'Event-Driven', normalized: 'event-driven', category: 'Architecture', aliases: ['event driven architecture', 'eda'] },
  { term: 'CQRS', normalized: 'cqrs', category: 'Architecture' },
  { term: 'Domain-Driven Design', normalized: 'domain-driven design', category: 'Architecture', aliases: ['ddd'] },
  { term: 'SOLID', normalized: 'solid', category: 'Principles', aliases: ['solid principles'] },
  { term: 'Design Patterns', normalized: 'design patterns', category: 'Principles' },
  { term: 'Clean Architecture', normalized: 'clean architecture', category: 'Architecture' },
  { term: 'Repository Pattern', normalized: 'repository pattern', category: 'Architecture' },

  // ── Messaging ─────────────────────────────────────────────
  { term: 'RabbitMQ', normalized: 'rabbitmq', category: 'Messaging' },
  { term: 'Kafka', normalized: 'kafka', category: 'Messaging', aliases: ['apache kafka'] },
  { term: 'Azure Service Bus', normalized: 'service bus', category: 'Messaging' },
  { term: 'MassTransit', normalized: 'masstransit', category: 'Messaging' },

  // ── Security ──────────────────────────────────────────────
  { term: 'JWT', normalized: 'jwt', category: 'Security', aliases: ['json web token'] },
  { term: 'OAuth2', normalized: 'oauth2', category: 'Security', aliases: ['oauth'] },
  { term: 'OpenID Connect', normalized: 'openid connect', category: 'Security', aliases: ['oidc'] },
  { term: 'IdentityServer', normalized: 'identityserver', category: 'Security' },
  { term: 'SSL/TLS', normalized: 'ssl', category: 'Security', aliases: ['tls'] },
  { term: 'OWASP', normalized: 'owasp', category: 'Security' },

  // ── Testing ───────────────────────────────────────────────
  { term: 'Unit Testing', normalized: 'unit testing', category: 'Testing', aliases: ['unit tests'] },
  { term: 'Integration Testing', normalized: 'integration testing', category: 'Testing' },
  { term: 'TDD', normalized: 'tdd', category: 'Testing', aliases: ['test-driven development'] },
  { term: 'BDD', normalized: 'bdd', category: 'Testing', aliases: ['behaviour driven development'] },
  { term: 'Selenium', normalized: 'selenium', category: 'Testing' },
  { term: 'Cypress', normalized: 'cypress', category: 'Testing' },
  { term: 'Jest', normalized: 'jest', category: 'Testing' },
  { term: 'Jasmine', normalized: 'jasmine', category: 'Testing' },
  { term: 'Karma', normalized: 'karma', category: 'Testing' },

  // ── Monitoring & Observability ─────────────────────────────
  { term: 'Datadog', normalized: 'datadog', category: 'Observability' },
  { term: 'Grafana', normalized: 'grafana', category: 'Observability' },
  { term: 'Prometheus', normalized: 'prometheus', category: 'Observability' },
  { term: 'Application Insights', normalized: 'application insights', category: 'Observability' },
  { term: 'Serilog', normalized: 'serilog', category: 'Observability' },
  { term: 'OpenTelemetry', normalized: 'opentelemetry', category: 'Observability', aliases: ['otel'] },

  // ── Data & AI ─────────────────────────────────────────────
  { term: 'Python', normalized: 'python', category: 'Language' },
  { term: 'Machine Learning', normalized: 'machine learning', category: 'AI', aliases: ['ml'] },
  { term: 'AI', normalized: 'artificial intelligence', category: 'AI', aliases: ['ai/ml'] },
  { term: 'Pandas', normalized: 'pandas', category: 'Data' },
  { term: 'NumPy', normalized: 'numpy', category: 'Data' },

  // ── Version Control & Tools ────────────────────────────────
  { term: 'Git', normalized: 'git', category: 'Tools' },
  { term: 'GitHub', normalized: 'github', category: 'Tools' },
  { term: 'GitLab', normalized: 'gitlab', category: 'Tools' },
  { term: 'Jira', normalized: 'jira', category: 'Tools' },
  { term: 'Confluence', normalized: 'confluence', category: 'Tools' },
  { term: 'Postman', normalized: 'postman', category: 'Tools' },
  { term: 'Swagger', normalized: 'swagger', category: 'Tools', aliases: ['openapi'] },

  // ── Soft Skills / Practices ───────────────────────────────
  { term: 'Agile', normalized: 'agile', category: 'Practices' },
  { term: 'Scrum', normalized: 'scrum', category: 'Practices' },
  { term: 'Kanban', normalized: 'kanban', category: 'Practices' },
  { term: 'Code Review', normalized: 'code review', category: 'Practices' },
  { term: 'Performance Optimization', normalized: 'performance optimization', category: 'Practices', aliases: ['query optimization', 'caching'] },
  { term: 'Scalability', normalized: 'scalability', category: 'Practices', aliases: ['scalable'] },
  { term: 'High Availability', normalized: 'high availability', category: 'Practices', aliases: ['ha'] },
];
