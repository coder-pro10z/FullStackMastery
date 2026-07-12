import { Component, OnInit, AfterViewInit, HostListener, Inject, PLATFORM_ID, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { LucideAngularModule, Database, Award, Check, Lock, ChevronDown, Unlock, Search, Filter, ListOrdered, GitMerge, Layers, Edit3, Component as ComponentIcon, CornerDownRight, LayoutTemplate, ListTree, Activity, Terminal, GitBranch, FileCode, Shield } from 'lucide-angular';

interface SkillNode {
  id: string;
  title: string;
  icon: string;
  status: 'completed' | 'in-progress' | 'locked';
  desc: string;
  parents: string[];
}

interface SkillPhase {
  phase: string;
  nodes: SkillNode[];
}

@Component({
  selector: 'app-skill-tree',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './skill-tree.component.html',
  styleUrl: './skill-tree.component.scss'
})
export class SkillTreeComponent implements OnInit, AfterViewInit {
  isLoading = true;
  showSpecialization = false;
  
  @ViewChild('connectorSvg') connectorSvg!: ElementRef<SVGElement>;

  coreCurriculum: SkillPhase[] = [
    {
      phase: "Phase 0: Fundamentals",
      nodes: [
        { id: "select", title: "SELECT & FROM", icon: "search", status: "completed", desc: "Basic data retrieval", parents: [] },
        { id: "where", title: "WHERE & NULLs", icon: "filter", status: "completed", desc: "Filtering & edge cases", parents: [] },
        { id: "sorting", title: "ORDER BY & LIMIT", icon: "list-ordered", status: "completed", desc: "Organizing output", parents: [] }
      ]
    },
    {
      phase: "Phase 1: Intermediate SQL",
      nodes: [
        { id: "joins", title: "Multi-Table JOINs", icon: "git-merge", status: "in-progress", desc: "Relational data mapping", parents: ["select", "where"] },
        { id: "grouping", title: "Aggregates & GROUP BY", icon: "layers", status: "locked", desc: "SUM, AVG, COUNT & HAVING", parents: ["where"] },
        { id: "dml", title: "DML & Logic", icon: "edit-3", status: "locked", desc: "INSERT, UPDATE, CASE WHEN", parents: ["sorting"] }
      ]
    },
    {
      phase: "Phase 2: Complex Queries",
      nodes: [
        { id: "ctes", title: "CTEs (WITH)", icon: "component", status: "locked", desc: "Common Table Expressions", parents: ["joins", "grouping"] },
        { id: "subqueries", title: "Advanced Subqueries", icon: "corner-down-right", status: "locked", desc: "Correlated & Nested Logic", parents: ["joins"] },
        { id: "window", title: "Window Functions", icon: "layout-template", status: "locked", desc: "ROW_NUMBER, RANK, LEAD", parents: ["grouping", "dml"] }
      ]
    },
    {
      phase: "Phase 3: DB Engineering",
      nodes: [
        { id: "normalization", title: "Schema Normalization", icon: "database", status: "locked", desc: "1NF to 3NF design", parents: ["ctes", "subqueries"] },
        { id: "indexing", title: "Indexing Strategies", icon: "list-tree", status: "locked", desc: "Clustered vs Non-Clustered", parents: ["subqueries", "window"] },
        { id: "execution", title: "Execution Plans", icon: "activity", status: "locked", desc: "Reading & tuning query costs", parents: ["window"] }
      ]
    }
  ];

  specializationCurriculum: SkillPhase[] = [
    {
      phase: "Level 2: T-SQL Engineer",
      nodes: [
        { id: "tsql-basics", title: "T-SQL Fundamentals", icon: "terminal", status: "locked", desc: "Variables & Data Types", parents: ["indexing", "execution"] },
        { id: "control-flow", title: "Control Flow Logic", icon: "git-branch", status: "locked", desc: "IF/ELSE & WHILE loops", parents: ["tsql-basics"] },
        { id: "stored-procs", title: "Stored Procedures", icon: "file-code", status: "locked", desc: "Encapsulating Business Logic", parents: ["control-flow"] },
        { id: "transactions", title: "Transactions (ACID)", icon: "shield", status: "locked", desc: "COMMIT, ROLLBACK, & Locks", parents: ["stored-procs"] }
      ]
    }
  ];

  allNodesList: SkillNode[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.allNodesList = [
      ...this.coreCurriculum.flatMap(p => p.nodes),
      ...this.specializationCurriculum.flatMap(p => p.nodes)
    ];
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.isLoading = false;
        setTimeout(() => this.drawConnectors(), 100);
      }, 1500);
    }
  }

  ngAfterViewInit() {
    // Connectors are drawn when loading finishes
  }

  @HostListener('window:resize')
  onResize() {
    if (!this.isLoading) {
      window.requestAnimationFrame(() => this.drawConnectors());
    }
  }

  revealSpecialization() {
    this.showSpecialization = true;
    setTimeout(() => this.drawConnectors(), 350);
  }

  getAriaStatus(status: string): string {
    if (status === 'locked') return "Locked. Complete previous lessons.";
    if (status === 'in-progress') return "In Progress. Current lesson.";
    return "Completed.";
  }

  drawConnectors() {
    if (!isPlatformBrowser(this.platformId) || !this.connectorSvg) return;
    
    const svg = this.connectorSvg.nativeElement;
    svg.innerHTML = ''; // Clear previous

    this.allNodesList.forEach(node => {
      if (node.parents && node.parents.length > 0) {
        node.parents.forEach(parentId => {
          const startEl = document.getElementById(`container-${parentId}`);
          const endEl = document.getElementById(`container-${node.id}`);

          if (startEl && endEl && endEl.offsetParent !== null) {
            const startRect = startEl.getBoundingClientRect();
            const endRect = endEl.getBoundingClientRect();
            const svgRect = svg.getBoundingClientRect();

            const x1 = startRect.left + startRect.width / 2 - svgRect.left;
            const y1 = startRect.bottom - svgRect.top - 8;
            const x2 = endRect.left + endRect.width / 2 - svgRect.left;
            const y2 = endRect.top - svgRect.top + 8;

            const midY = y1 + (y2 - y1) / 2;
            const d = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;

            const isActive = node.status !== 'locked';

            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", d);
            path.setAttribute("fill", "none");
            path.setAttribute("stroke", isActive ? "#1A73E8" : "#E0E0E0");
            path.setAttribute("stroke-width", isActive ? "3" : "2");
            path.setAttribute("class", "connector-path animate-draw");

            svg.appendChild(path);
          }
        });
      }
    });
  }
}
