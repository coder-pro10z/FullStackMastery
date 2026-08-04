import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CategoryService } from './category.service';
import { ProgressService } from './progress.service';
import { QuestionService } from './question.service';
import { CategoryTreeDto } from '../models/category.models';
import {
  IndexNode, IndexCategory, IndexStats,
  CATEGORY_THEME_MAP, IndexColorTheme
} from '../models/knowledge-index.models';
import { QuestionDto, QuestionQueryParams } from '../models/question.models';

const RECENT_HISTORY_KEY = 'ki_recent_viewed';
const MAX_RECENT = 8;

export interface MasteryModuleDef {
  id: string;
  name: string;
  domain: 'C# & .NET Core' | 'ASP.NET & Web API' | 'SQL & Entity Framework' | 'Angular Frontend' | 'System Design & DevOps';
  colorTheme: IndexColorTheme;
  icon: string;
  keywords: string[];
}

export const MASTERY_30_MODULES: MasteryModuleDef[] = [
  // --- Domain 1: C# & .NET Core ---
  { id: 'm01', name: '01 CSHARP FUNDAMENTALS', domain: 'C# & .NET Core', colorTheme: 'violet', icon: 'code-2',
    keywords: ['c#', 'csharp', 'type system', 'value type', 'reference type', 'struct', 'record', 'generics', 'delegate', 'event', 'extension method', 'pattern matching', 'nullable', 'access modifier'] },
  { id: 'm02', name: '02 ASYNC AWAIT', domain: 'C# & .NET Core', colorTheme: 'violet', icon: 'zap',
    keywords: ['async', 'await', 'task', 'valuetask', 'threadpool', 'configureawait', 'cancellationtoken', 'i/o bound', 'cpu bound', 'deadlock', 'parallel', 'asyncstream'] },
  { id: 'm03', name: '03 GARBAGE COLLECTION', domain: 'C# & .NET Core', colorTheme: 'violet', icon: 'cpu',
    keywords: ['garbage collection', 'gc', 'generation', 'loh', 'large object heap', 'memory', 'heap', 'stack', 'boxing', 'unboxing', 'dispose', 'idisposable', 'finalizer', 'suppressfinalize', 'span', 'memory<t>'] },
  { id: 'm04', name: '04 SOLID', domain: 'C# & .NET Core', colorTheme: 'violet', icon: 'shield',
    keywords: ['solid', 'srp', 'ocp', 'lsp', 'isp', 'dip', 'single responsibility', 'open closed', 'liskov', 'interface segregation', 'dependency inversion'] },
  { id: 'm05', name: '05 DESIGN PATTERNS', domain: 'C# & .NET Core', colorTheme: 'violet', icon: 'git-branch',
    keywords: ['design pattern', 'factory', 'abstract factory', 'singleton', 'observer', 'strategy', 'builder', 'decorator', 'repository', 'unit of work', 'adapter', 'facade', 'command pattern', 'template method'] },
  { id: 'm06', name: '06 INTERFACE VS ABSTRACT', domain: 'C# & .NET Core', colorTheme: 'violet', icon: 'layers',
    keywords: ['interface', 'abstract class', 'abstract method', 'virtual method', 'override', 'default interface method', 'contract', 'multiple inheritance'] },
  { id: 'm07', name: '07 DEPENDENCY INJECTION', domain: 'C# & .NET Core', colorTheme: 'violet', icon: 'box',
    keywords: ['dependency injection', 'di', 'transient', 'scoped', 'singleton', 'iserviceprovider', 'service lifetime', 'servicecollection', 'captive dependency', 'autofac'] },

  // --- Domain 2: ASP.NET Core & Web API ---
  { id: 'm08', name: '08 HOSTING CONFIGURATION', domain: 'ASP.NET & Web API', colorTheme: 'blue', icon: 'server',
    keywords: ['hosting', 'program.cs', 'startup', 'appsettings', 'configuration', 'kestrel', 'environment', 'iconfiguration', 'options pattern', 'builder.build'] },
  { id: 'm09', name: '09 MIDDLEWARE', domain: 'ASP.NET & Web API', colorTheme: 'blue', icon: 'filter',
    keywords: ['middleware', 'request pipeline', 'imiddleware', 'use', 'run', 'map', 'next', 'custom middleware', 'request buffering'] },
  { id: 'm10', name: '10 EXCEPTION HANDLING', domain: 'ASP.NET & Web API', colorTheme: 'blue', icon: 'alert-triangle',
    keywords: ['exception', 'error handling', 'problem details', 'global exception', 'try catch', 'iexceptionhandler', 'exception filter'] },
  { id: 'm11', name: '11 AUTHENTICATION AUTHORIZATION', domain: 'ASP.NET & Web API', colorTheme: 'blue', icon: 'lock',
    keywords: ['authentication', 'authorization', 'jwt', 'oauth', 'claim', 'policy', 'role', 'bearer token', 'identity', 'identityserver', 'openiddict', 'cookie auth'] },
  { id: 'm12', name: '12 REST API DESIGN', domain: 'ASP.NET & Web API', colorTheme: 'blue', icon: 'globe',
    keywords: ['rest', 'api design', 'swagger', 'openapi', 'http verb', 'status code', 'content negotiation', 'versioning', 'hateoas', 'minimal api', 'actionresult'] },

  // --- Domain 3: SQL & Entity Framework ---
  { id: 'm13', name: '13 EFCORE FUNDAMENTALS', domain: 'SQL & Entity Framework', colorTheme: 'amber', icon: 'database',
    keywords: ['ef core', 'entity framework', 'dbcontext', 'migration', 'code first', 'dbset', 'modelbuilder', 'fluent api', 'shadow property'] },
  { id: 'm14', name: '14 EFCORE ADVANCED', domain: 'SQL & Entity Framework', colorTheme: 'amber', icon: 'activity',
    keywords: ['n+1', 'include', 'theninclude', 'change tracker', 'asnotracking', 'compiled query', 'interceptor', 'concurrency', 'optimistic concurrency', 'raw sql', 'table splitting'] },
  { id: 'm15', name: '15 LINQ', domain: 'SQL & Entity Framework', colorTheme: 'amber', icon: 'table',
    keywords: ['linq', 'iqueryable', 'ienumerable', 'deferred execution', 'select', 'where', 'groupby', 'join', 'selectmany', 'expression tree'] },
  { id: 'm16', name: '16 SQL INDEXING', domain: 'SQL & Entity Framework', colorTheme: 'amber', icon: 'list-filter',
    keywords: ['clustered index', 'non-clustered', 'index scan', 'index seek', 'execution plan', 'b-tree', 'filtered index', 'covering index', 'fragmentation'] },
  { id: 'm17', name: '17 SQL CTE', domain: 'SQL & Entity Framework', colorTheme: 'amber', icon: 'grid',
    keywords: ['cte', 'common table expression', 'window function', 'row_number', 'rank', 'dense_rank', 'partition by', 'lead', 'lag', 'over clause', 'recursive cte', 'join', 'inner join', 'left join', 'right join', 'full join'] },

  // --- Domain 4: Angular Frontend ---
  { id: 'm18', name: '18 ANGULAR DI', domain: 'Angular Frontend', colorTheme: 'emerald', icon: 'layers',
    keywords: ['angular di', 'providedin', 'injectable', 'injectiontoken', 'hierarchical injector', 'useclass', 'usefactory', 'usevalue', 'elementinjector'] },
  { id: 'm19', name: '19 RXJS', domain: 'Angular Frontend', colorTheme: 'emerald', icon: 'refresh-cw',
    keywords: ['rxjs', 'observable', 'subject', 'behaviorsubject', 'replaysubject', 'switchmap', 'mergemap', 'concatmap', 'exhaustmap', 'pipe', 'asyncpipe', 'subscribe', 'takeuntil', 'of', 'from'] },
  { id: 'm20', name: '20 ANGULAR LIFECYCLE', domain: 'Angular Frontend', colorTheme: 'emerald', icon: 'clock',
    keywords: ['ngoninit', 'ngonchanges', 'ngondestroy', 'ngafterviewinit', 'ngdocheck', 'ngaftercontentinit', 'lifecycle hook'] },
  { id: 'm21', name: '21 ANGULAR DECORATORS', domain: 'Angular Frontend', colorTheme: 'emerald', icon: 'tag',
    keywords: ['@component', '@directive', '@pipe', '@input', '@output', '@viewchild', '@contentchild', '@hostlistener', '@hostbinding', 'decorator'] },
  { id: 'm22', name: '22 ANGULAR FORMS', domain: 'Angular Frontend', colorTheme: 'emerald', icon: 'check-square',
    keywords: ['reactive forms', 'template-driven', 'formbuilder', 'formgroup', 'formcontrol', 'formarray', 'validators', 'asyncvalidator', 'controlvalueaccessor'] },
  { id: 'm23', name: '23 ANGULAR PERFORMANCE', domain: 'Angular Frontend', colorTheme: 'emerald', icon: 'zap',
    keywords: ['onpush', 'change detection', 'trackby', 'lazy loading', 'defer', 'zone.js', 'signals', 'zoneless', 'hydration', 'bundle size'] },

  // --- Domain 5: System Design & Cloud DevOps ---
  { id: 'm24', name: '24 SECURITY', domain: 'System Design & DevOps', colorTheme: 'rose', icon: 'shield-alert',
    keywords: ['cors', 'xss', 'csrf', 'sql injection', 'hashing', 'bcrypt', 'rate limiting', 'https', 'tls', 'sanitize', 'secret management'] },
  { id: 'm25', name: '25 MONOLITH MICROSERVICES', domain: 'System Design & DevOps', colorTheme: 'cyan', icon: 'cpu',
    keywords: ['microservices', 'monolith', 'bounded context', 'domain driven design', 'ddd', 'service discovery', 'event driven', 'decoupling'] },
  { id: 'm26', name: '26 API GATEWAY', domain: 'System Design & DevOps', colorTheme: 'cyan', icon: 'share-2',
    keywords: ['api gateway', 'ocelot', 'yarp', 'reverse proxy', 'rate limiting gateway', 'request aggregation', 'load balancing gateway'] },
  { id: 'm27', name: '27 CQRS MEDIATR', domain: 'System Design & DevOps', colorTheme: 'cyan', icon: 'git-pull-request',
    keywords: ['cqrs', 'mediatr', 'command', 'query', 'eventual consistency', 'read model', 'write model', 'pipeline behavior', 'domain event'] },
  { id: 'm28', name: '28 SAGA PATTERN', domain: 'System Design & DevOps', colorTheme: 'cyan', icon: 'repeat',
    keywords: ['saga', 'outbox pattern', 'two-phase commit', 'distributed transaction', 'compensating transaction', 'choreo', 'orchestration'] },
  { id: 'm29', name: '29 AZURE', domain: 'System Design & DevOps', colorTheme: 'cyan', icon: 'cloud',
    keywords: ['azure', 'app service', 'blob storage', 'key vault', 'service bus', 'cosmos db', 'azure functions', 'application insights', 'arm template'] },
  { id: 'm30', name: '30 DEVOPS PRODUCTION SUPPORT', domain: 'System Design & DevOps', colorTheme: 'slate', icon: 'tool',
    keywords: ['ci/cd', 'docker', 'kubernetes', 'k8s', 'helm', 'serilog', 'prometheus', 'grafana', 'health check', 'production support', 'logging', 'tracing'] }
];

@Injectable({ providedIn: 'root' })
export class KnowledgeIndexService {
  private readonly categoryService = inject(CategoryService);
  private readonly progressService = inject(ProgressService);
  private readonly questionService = inject(QuestionService);

  private _loaded = false;

  readonly indexTree = signal<IndexNode[]>([]);
  readonly indexStats = signal<IndexStats | null>(null);
  readonly isLoading = signal(false);

  /** Fetch and build the index tree covering all 30 modules & 640 questions */
  async ensureLoaded(): Promise<void> {
    if (this._loaded) return;
    this.isLoading.set(true);

    try {
      const [categories, progress, pagedQuestions] = await Promise.all([
        firstValueFrom(this.categoryService.getTree()).catch(() => []),
        firstValueFrom(this.progressService.getSummary()).catch(() => null),
        firstValueFrom(this.questionService.getQuestions({ pageSize: 1000 })).catch(() => null)
      ]);

      const questions = pagedQuestions?.data ?? [];

      // 1. Group 30 Modules into 5 High-Level Domains
      const domainsMap = new Map<string, IndexCategory>();

      for (const mod of MASTERY_30_MODULES) {
        if (!domainsMap.has(mod.domain)) {
          const domainId = `domain-${mod.domain.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
          domainsMap.set(mod.domain, {
            id: domainId,
            type: 'category',
            label: mod.domain,
            questionCount: 0,
            solvedCount: 0,
            masteryPct: 0,
            children: [],
            parentIds: [],
            depth: 0,
            icon: this.getDomainIcon(mod.domain),
            colorTheme: mod.colorTheme
          });
        }

        const domainNode = domainsMap.get(mod.domain)!;
        const modNode: IndexCategory = {
          id: `mod-${mod.id}`,
          type: 'subcategory',
          label: mod.name,
          questionCount: 0,
          solvedCount: 0,
          masteryPct: 0,
          children: [],
          parentIds: [domainNode.id],
          depth: 1,
          icon: mod.icon,
          colorTheme: mod.colorTheme
        };

        domainNode.children.push(modNode);
      }

      const tree = Array.from(domainsMap.values());

      // 2. Map all 640 questions to their matching 30 Mastery Modules
      this.attachQuestionsTo30Modules(tree, questions);

      // 3. Roll up question counts & solved percentages
      this.rollupTree(tree);

      this.indexTree.set(tree);

      const totalSolved = progress?.totalSolved ?? questions.filter(q => q.isSolved).length;
      const totalQuestions = Math.max(progress?.totalQuestions ?? 0, questions.length, 640);

      this.indexStats.set({
        totalQuestions,
        solvedQuestions: totalSolved,
        masteryPct: totalQuestions > 0 ? Math.round((totalSolved / totalQuestions) * 100) : 0,
        totalCategories: MASTERY_30_MODULES.length,
        bookmarkedCount: questions.filter(q => q.isRevision).length
      });

      this._loaded = true;
    } finally {
      this.isLoading.set(false);
    }
  }

  /** Invalidate cache so next call re-fetches */
  invalidate(): void {
    this._loaded = false;
  }

  /** Build filter params from a selected node */
  buildFilterParams(node: IndexNode): Partial<QuestionQueryParams> {
    if (node.categoryId !== undefined) {
      return { categoryId: node.categoryId };
    }
    // Clean module prefix if present (e.g. "01 CSHARP FUNDAMENTALS" -> "CSHARP FUNDAMENTALS")
    const cleanLabel = node.label.replace(/^\d+\s+/, '');
    return { searchTerm: cleanLabel };
  }

  /** Recently viewed - persisted to localStorage */
  getRecentlyViewed(): IndexNode[] {
    try {
      const raw = localStorage.getItem(RECENT_HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  recordView(node: IndexNode): void {
    try {
      const existing = this.getRecentlyViewed().filter(n => n.id !== node.id);
      const updated = [node, ...existing].slice(0, MAX_RECENT);
      localStorage.setItem(RECENT_HISTORY_KEY, JSON.stringify(updated));
    } catch {
      // ignore localStorage errors
    }
  }

  /** Recursively filter tree - a node is included if it or any descendant matches */
  filterTree(nodes: IndexNode[], query: string): IndexNode[] {
    if (!query.trim()) return nodes;
    const q = query.toLowerCase();
    return nodes
      .map(node => {
        const childMatches = this.filterTree(node.children, query);
        const selfMatches = node.label.toLowerCase().includes(q);
        if (selfMatches || childMatches.length > 0) {
          return { ...node, children: childMatches };
        }
        return null;
      })
      .filter((n): n is IndexNode => n !== null);
  }

  /** Flatten tree to a list of all leaf question nodes */
  flattenToQuestions(nodes: IndexNode[]): IndexNode[] {
    const results: IndexNode[] = [];
    const walk = (ns: IndexNode[]) => {
      for (const n of ns) {
        if (n.type === 'question') results.push(n);
        if (n.children.length) walk(n.children);
      }
    };
    walk(nodes);
    return results;
  }

  /** Flatten tree to all non-question nodes (categories/topics) */
  flattenToCategories(nodes: IndexNode[]): IndexNode[] {
    const results: IndexNode[] = [];
    const walk = (ns: IndexNode[]) => {
      for (const n of ns) {
        if (n.type !== 'question') results.push(n);
        if (n.children.length) walk(n.children);
      }
    };
    walk(nodes);
    return results;
  }

  /** Attach questions across the 30 Modules */
  private attachQuestionsTo30Modules(tree: IndexNode[], questions: QuestionDto[]): void {
    // Get all 30 module subcategory nodes
    const moduleNodes: IndexNode[] = [];
    for (const domainNode of tree) {
      moduleNodes.push(...domainNode.children);
    }

    for (const q of questions) {
      const qNode: IndexNode = {
        id: `q-${q.id}`,
        type: 'question',
        label: q.title || q.questionText,
        questionCount: 1,
        solvedCount: q.isSolved ? 1 : 0,
        masteryPct: q.isSolved ? 100 : 0,
        difficulty: q.difficulty,
        isSolved: q.isSolved,
        isRevision: q.isRevision,
        children: [],
        parentIds: [],
        questionId: q.id,
        depth: 2
      };

      const searchText = `${q.title || ''} ${q.questionText || ''} ${q.categoryName || ''} ${(q.tags || []).join(' ')}`.toLowerCase();

      let matchedModule: IndexNode | null = null;

      // Find best matching module from MASTERY_30_MODULES
      for (const modDef of MASTERY_30_MODULES) {
        if (modDef.keywords.some(kw => searchText.includes(kw))) {
          const modNode = moduleNodes.find(m => m.id === `mod-${modDef.id}`);
          if (modNode) {
            matchedModule = modNode;
            break;
          }
        }
      }

      // Fallback: if no keyword matches, assign to first module in domain matching categoryName or C# Fundamentals
      if (!matchedModule) {
        matchedModule = moduleNodes[0];
      }

      qNode.parentIds = [...matchedModule.parentIds, matchedModule.id];
      matchedModule.children.push(qNode);
    }
  }

  /** Recursively roll up question counts and solved percentages */
  private rollupTree(nodes: IndexNode[]): void {
    for (const node of nodes) {
      if (node.type !== 'question' && node.children.length > 0) {
        this.rollupTree(node.children);

        let totalQ = 0;
        let totalS = 0;

        for (const child of node.children) {
          totalQ += child.questionCount;
          totalS += child.solvedCount;
        }

        node.questionCount = totalQ;
        node.solvedCount = totalS;
        node.masteryPct = totalQ > 0 ? Math.round((totalS / totalQ) * 100) : 0;
      }
    }
  }

  private getDomainIcon(domain: string): string {
    switch (domain) {
      case 'C# & .NET Core': return 'code-2';
      case 'ASP.NET & Web API': return 'server';
      case 'SQL & Entity Framework': return 'database';
      case 'Angular Frontend': return 'layers';
      case 'System Design & DevOps': return 'cloud';
      default: return 'book-open';
    }
  }
}
