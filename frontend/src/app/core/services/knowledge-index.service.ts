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

// Keyword rules for mapping questions to subcategories if categoryId is broad
const SUBCATEGORY_KEYWORDS: Record<string, string[]> = {
  'ASP.NET Core': ['asp.net', 'aspnet', 'controller', 'middleware', 'kestrel', 'actionresult', 'routing'],
  'Entity Framework Core': ['entity framework', 'ef core', 'ef', 'dbcontext', 'migration', 'iqueryable', 'include', 'change tracker'],
  'Components': ['component', 'directive', 'viewchild', 'input', 'output', 'lifecycle', 'ngoninit'],
  'RxJS': ['rxjs', 'observable', 'subject', 'switchmap', 'mergemap', 'pipe', 'asyncpipe', 'subscribe'],
  'API Design': ['api design', 'rest', 'swagger', 'openapi', 'http verb', 'endpoint', 'status code'],
  'Caching': ['cache', 'caching', 'redis', 'in-memory', 'cdn', 'etag', 'cache-control'],
  'Database': ['sql', 'join', 'index', 'transaction', 'acid', 'normalization', 'procedure', 'table'],
  'Middleware': ['middleware', 'request pipeline', 'pipeline', 'cors', 'error handling'],
  'Security': ['security', 'jwt', 'oauth', 'auth', 'claim', 'cors', 'xss', 'csrf', 'encryption'],
  'OOPS': ['oops', 'object oriented', 'polymorphism', 'inheritance', 'encapsulation', 'abstraction', 'interface', 'abstract class'],
  'SOLID': ['solid', 'srp', 'ocp', 'lsp', 'isp', 'dip', 'single responsibility', 'dependency inversion'],
  'High-Level Design': ['high-level', 'hld', 'architecture', 'microservices', 'load balancer', 'queue', 'kafka', 'rabbitmq'],
  'Low-Level Design': ['low-level', 'lld', 'design pattern', 'factory', 'singleton', 'repository', 'strategy'],
  'Scalability': ['scalability', 'scaling', 'sharding', 'replica', 'partition', 'throughput']
};

@Injectable({ providedIn: 'root' })
export class KnowledgeIndexService {
  private readonly categoryService = inject(CategoryService);
  private readonly progressService = inject(ProgressService);
  private readonly questionService = inject(QuestionService);

  private _loaded = false;

  readonly indexTree = signal<IndexNode[]>([]);
  readonly indexStats = signal<IndexStats | null>(null);
  readonly isLoading = signal(false);

  /** Fetch and build the index tree. Cached after first call. */
  async ensureLoaded(): Promise<void> {
    if (this._loaded) return;
    this.isLoading.set(true);

    try {
      const [categories, progress, pagedQuestions] = await Promise.all([
        firstValueFrom(this.categoryService.getTree()),
        firstValueFrom(this.progressService.getSummary()).catch(() => null),
        firstValueFrom(this.questionService.getQuestions({ pageSize: 1000 })).catch(() => null)
      ]);

      const questions = pagedQuestions?.data ?? [];

      // 1. Build initial Category Nodes tree
      const tree = categories.map((cat, i) =>
        this.mapCategoryToNode(cat, [], 0, i)
      );

      // 2. Map questions to categories & subcategories
      this.attachQuestionsToTree(tree, questions);

      // 3. Roll up question counts & solved percentages
      this.rollupTree(tree);

      this.indexTree.set(tree);

      const totalSolved = progress?.totalSolved ?? questions.filter(q => q.isSolved).length;
      const totalQuestions = progress?.totalQuestions ?? questions.length;

      this.indexStats.set({
        totalQuestions,
        solvedQuestions: totalSolved,
        masteryPct: totalQuestions > 0 ? Math.round((totalSolved / totalQuestions) * 100) : 0,
        totalCategories: categories.length,
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
    return { searchTerm: node.label };
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

  /** Attach questions to category & subcategory nodes using categoryId & keyword matching */
  private attachQuestionsToTree(tree: IndexNode[], questions: QuestionDto[]): void {
    const flattenNodes = (nodes: IndexNode[]): IndexNode[] => {
      let list: IndexNode[] = [];
      for (const node of nodes) {
        if (node.type !== 'question') {
          list.push(node);
          if (node.children.length) {
            list = list.concat(flattenNodes(node.children));
          }
        }
      }
      return list;
    };

    const categoryNodes = flattenNodes(tree);

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
        depth: 0
      };

      let attached = false;

      // 1. Direct CategoryId Match
      const directMatch = categoryNodes.find(c => c.categoryId === q.categoryId);
      if (directMatch) {
        qNode.parentIds = [...directMatch.parentIds, directMatch.id];
        qNode.depth = directMatch.depth + 1;
        directMatch.children.push({ ...qNode });
        attached = true;
      }

      // 2. Keyword & Tag Fallback Matching for subcategories
      const searchText = `${q.title || ''} ${q.questionText || ''} ${(q.tags || []).join(' ')}`.toLowerCase();

      for (const catNode of categoryNodes) {
        const keywords = SUBCATEGORY_KEYWORDS[catNode.label];
        if (keywords && keywords.some(kw => searchText.includes(kw))) {
          // Avoid duplicate attachment if already attached as direct match to this exact node
          if (directMatch?.id !== catNode.id) {
            const childQNode: IndexNode = {
              ...qNode,
              parentIds: [...catNode.parentIds, catNode.id],
              depth: catNode.depth + 1
            };
            catNode.children.push(childQNode);
            attached = true;
          }
        }
      }

      // 3. Root Fallback if unattached
      if (!attached && tree.length > 0) {
        const fallback = tree[0];
        qNode.parentIds = [fallback.id];
        qNode.depth = fallback.depth + 1;
        fallback.children.push(qNode);
      }
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

  /** Map CategoryTreeDto to IndexNode recursively */
  private mapCategoryToNode(
    cat: CategoryTreeDto,
    parentIds: string[],
    depth: number,
    index: number
  ): IndexCategory {
    const id = `cat-${cat.id}`;
    const childParentIds = [...parentIds, id];
    const children: IndexNode[] = (cat.subCategories ?? []).map((sub, i) =>
      this.mapCategoryToNode(sub, childParentIds, depth + 1, i)
    );

    const themeKey = Object.keys(CATEGORY_THEME_MAP).find(k =>
      cat.name.toLowerCase().includes(k.toLowerCase())
    );
    const theme = themeKey ? CATEGORY_THEME_MAP[themeKey] : this.defaultTheme(index);

    return {
      id,
      type: depth === 0 ? 'category' : 'subcategory',
      label: cat.name,
      questionCount: 0,
      solvedCount: 0,
      masteryPct: 0,
      children,
      parentIds,
      categoryId: cat.id,
      depth,
      icon: theme.icon,
      colorTheme: theme.colorTheme
    };
  }

  private defaultTheme(index: number): { icon: string; colorTheme: IndexColorTheme } {
    const themes: { icon: string; colorTheme: IndexColorTheme }[] = [
      { icon: 'book-open', colorTheme: 'blue' },
      { icon: 'cpu', colorTheme: 'violet' },
      { icon: 'layers', colorTheme: 'emerald' },
      { icon: 'database', colorTheme: 'amber' },
      { icon: 'shield', colorTheme: 'rose' },
      { icon: 'zap', colorTheme: 'cyan' },
    ];
    return themes[index % themes.length];
  }
}
