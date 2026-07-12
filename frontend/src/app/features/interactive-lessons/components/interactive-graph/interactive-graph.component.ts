import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import * as d3 from 'd3';

interface KnowledgeNode {
  label: string;
  title: string;
  text: string;
  question: string;
  answer: boolean;
  feedbackCorrect: string;
  feedbackIncorrect: string;
}

@Component({
  selector: 'app-interactive-graph',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './interactive-graph.component.html',
  styleUrl: './interactive-graph.component.scss'
})
export class InteractiveGraphComponent implements OnInit, AfterViewInit {
  @ViewChild('d3Canvas') d3Canvas!: ElementRef<HTMLDivElement>;

  knowledgeBase: Record<string, KnowledgeNode> = {
    "Parent": {
      label: "Module Overview", 
      title: "The Core Concept",
      text: "The central node is the anchor of this learning module. It connects all peripheral ideas together. Understanding this core is essential before moving to the branches. Notice how the visual hierarchy clearly establishes this as the starting point.",
      question: "Is it necessary to understand the Parent node before the children?", 
      answer: true,
      feedbackCorrect: "Correct! The parent provides necessary context for the sub-topics.",
      feedbackIncorrect: "Incorrect. Skipping the core concept makes the branches harder to grasp."
    },
    "CHILD 1": {
      label: "Sub-Topic 01", 
      title: "Dynamics & Flow",
      text: "Child 1 focuses on the dynamics of the system. Notice how breaking information into small, digestible chunks (like these cards) reduces cognitive load and prevents the fatigue usually caused by 'walls of text'.",
      question: "Does chunking information increase cognitive load?", 
      answer: false,
      feedbackCorrect: "Exactly. Chunking actually decreases cognitive load.",
      feedbackIncorrect: "Not quite. Large blocks of text increase load; chunking reduces it."
    },
    "CHILD 2": {
      label: "Sub-Topic 02", 
      title: "Visual Hierarchy",
      text: "By making the Parent node larger and applying a distinct, saturated color, we establish a clear visual hierarchy. The user instinctively knows where to look first without needing explicit textual instructions.",
      question: "Visual hierarchy can be established through size and color alone.", 
      answer: true,
      feedbackCorrect: "Spot on! Size and color are primary tools for guiding the eye.",
      feedbackIncorrect: "Actually, size and color are incredibly powerful hierarchy tools."
    },
    "CHILD 3": {
      label: "Sub-Topic 03", 
      title: "Active Recall",
      text: "Instead of passively reading, this interface forces you to click and interact. The mini-quizzes embedded directly into the reading flow are a practical application of 'Active Recall', which significantly boosts memory retention.",
      question: "Is active recall considered a passive learning strategy?", 
      answer: false,
      feedbackCorrect: "Correct. It requires active effort, unlike just reading.",
      feedbackIncorrect: "Incorrect. Active recall requires forcing your brain to retrieve information."
    },
    "CHILD 4": {
      label: "Sub-Topic 04", 
      title: "Spatial Memory",
      text: "Placing concepts in a physical space on a screen (like an orbiting graph) helps the human brain map and remember relationships much better than scrolling through linear text.",
      question: "Can spatial layouts improve relationship memory?", 
      answer: true,
      feedbackCorrect: "Yes! We naturally remember 'where' things are located.",
      feedbackIncorrect: "Actually, spatial mapping is highly effective for memory."
    },
    "CHILD 5": {
      label: "Sub-Topic 05", 
      title: "The Feedback Loop",
      text: "Immediate feedback is crucial for digital learning. When you click a quiz button below, knowing instantly if you are right or wrong reinforces the memory pathway right at the moment of peak engagement.",
      question: "Is delayed feedback generally better than immediate feedback?", 
      answer: false,
      feedbackCorrect: "Correct! Immediate feedback helps correct misunderstandings instantly.",
      feedbackIncorrect: "Incorrect. Immediate feedback is generally much more effective."
    }
  };

  currentActiveNode = "Parent";
  userChoice: boolean | null = null;
  feedbackMessage = '';
  isCorrect = false;
  isBrowser = false;
  resizeTimer: any;

  get currentNodeData(): KnowledgeNode {
    return this.knowledgeBase[this.currentActiveNode];
  }

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      setTimeout(() => this.initGraph(), 100);
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (!this.isBrowser) return;
    clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => this.initGraph(), 200);
  }

  selectNode(nodeId: string, nodeElement?: any) {
    this.currentActiveNode = nodeId;
    this.userChoice = null;
    this.feedbackMessage = '';

    if (!this.isBrowser) return;

    // Update Visual Selection in D3
    d3.selectAll("circle")
      .attr("stroke", (d: any) => d.id === "Parent" ? "none" : "#E2E8F0")
      .attr("stroke-width", 1);
      
    d3.select(`.node-circle-${nodeId.replace(/\\s/g, '')}`)
      .attr("stroke", "#10B981")
      .attr("stroke-width", 3);
  }

  submitAnswer(choice: boolean) {
    this.userChoice = choice;
    const isCorrect = choice === this.currentNodeData.answer;
    this.isCorrect = isCorrect;
    
    if (isCorrect) {
      this.feedbackMessage = `✅ ${this.currentNodeData.feedbackCorrect}`;
    } else {
      this.feedbackMessage = `❌ ${this.currentNodeData.feedbackIncorrect}`;
    }
  }

  private initGraph() {
    if (!this.d3Canvas?.nativeElement) return;

    const container = this.d3Canvas.nativeElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const nodes = [
      { id: "Parent", radius: 55, color: "#4F46E5", textColor: "#FFFFFF" },
      { id: "CHILD 1", radius: 35, color: "#FFFFFF", textColor: "#202124" },
      { id: "CHILD 2", radius: 35, color: "#FFFFFF", textColor: "#202124" },
      { id: "CHILD 3", radius: 35, color: "#FFFFFF", textColor: "#202124" },
      { id: "CHILD 4", radius: 35, color: "#FFFFFF", textColor: "#202124" },
      { id: "CHILD 5", radius: 35, color: "#FFFFFF", textColor: "#202124" }
    ];
    
    const links = [
      { source: "Parent", target: "CHILD 1" },
      { source: "Parent", target: "CHILD 2" },
      { source: "Parent", target: "CHILD 3" },
      { source: "Parent", target: "CHILD 4" },
      { source: "Parent", target: "CHILD 5" }
    ];

    d3.select(container).selectAll("svg").remove();

    const svg = d3.select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height]);

    const defs = svg.append("defs");
    const filter = defs.append("filter")
      .attr("id", "drop-shadow")
      .attr("height", "130%");
    filter.append("feDropShadow")
      .attr("dx", "0")
      .attr("dy", "4")
      .attr("stdDeviation", "4")
      .attr("flood-color", "#000000")
      .attr("flood-opacity", "0.08");

    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(width < 600 ? 120 : 180))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius((d: any) => d.radius + 15));

    const link = svg.append("g")
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke", "#E2E8F0")
      .attr("stroke-width", 3);

    const node = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .enter().append("g")
      .style("cursor", "pointer")
      .call(d3.drag<SVGGElement, any>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x; d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x; d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null; d.fy = null;
          }))
      .on("click", (event, d) => this.selectNode(d.id, event.currentTarget))
      .on("mouseover", function() { d3.select(this).select("circle").attr("stroke", "#4F46E5").attr("stroke-width", 2); })
      .on("mouseout", (event, d) => { 
          if(d.id !== this.currentActiveNode) {
              d3.select(event.currentTarget).select("circle").attr("stroke", d.id === "Parent" ? "none" : "#E2E8F0").attr("stroke-width", 1); 
          }
      });

    node.append("circle")
      .attr("r", d => d.radius)
      .attr("fill", d => d.color)
      .attr("stroke", d => d.id === "Parent" ? "none" : "#E2E8F0")
      .attr("stroke-width", 1)
      .attr("class", d => `node-circle-${d.id.replace(/\s/g, '')}`)
      .style("filter", "url(#drop-shadow)")
      .style("transition", "all 0.3s ease");

    node.append("text")
      .text(d => d.id)
      .attr("text-anchor", "middle")
      .attr("dy", ".3em")
      .attr("fill", d => d.textColor)
      .style("font-family", "'Inter', sans-serif")
      .style("font-size", d => d.id === "Parent" ? "14px" : "11px")
      .style("font-weight", "700")
      .style("pointer-events", "none");

    simulation.on("tick", () => {
      node.attr("transform", (d: any) => {
          d.x = Math.max(d.radius, Math.min(width - d.radius, d.x));
          d.y = Math.max(d.radius, Math.min(height - d.radius, d.y));
          return `translate(${d.x},${d.y})`;
      });
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);
    });

    d3.select(`.node-circle-Parent`)
      .attr("stroke", "#10B981")
      .attr("stroke-width", 4);
  }
}
