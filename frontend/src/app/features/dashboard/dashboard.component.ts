import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { ActivityHeatmapComponent } from '../../shared/components/activity-heatmap/activity-heatmap.component';
import { RadarChartComponent } from './components/radar-chart/radar-chart.component';
import { StreakCounterComponent } from './components/streak-counter/streak-counter.component';
import { ContinueLearningComponent } from './components/continue-learning/continue-learning.component';
import { IStatCard } from '../../core/models/stat-card.model';
import { IHeatmapConfig } from '../../core/models/heatmap.model';
import { DashboardStore } from '../../core/state/dashboard.store';
import { IDevHexagon } from '../../core/models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    StatCardComponent, 
    ActivityHeatmapComponent,
    RadarChartComponent,
    StreakCounterComponent,
    ContinueLearningComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private dashboardStore = inject(DashboardStore);

  private heatmapLayout = signal<'vertical' | 'horizontal'>('vertical');
  private heatmapShape = signal<'square' | 'circle'>('circle');

  readonly isLoading = this.dashboardStore.isLoading;
  readonly errorMsg = this.dashboardStore.errorMsg;
  readonly devHexagon = this.dashboardStore.devHexagon;
  readonly skills = this.dashboardStore.skills;
  readonly targetLabel = computed(() => this.devHexagon()?.target_level ?? 'Full-Stack Architect');
  readonly currentStreak = computed(() => Math.max(this.dashboardStore.primaryMetrics().length * 3, 1));
  readonly bestStreak = computed(() => this.currentStreak() + 9);
  readonly questionsStat = computed<IStatCard>(() => this.buildQuestionsStat(this.devHexagon()));
  readonly topicsStat = computed<IStatCard>(() => this.buildTopicsStat(this.devHexagon()));
  readonly accuracyStat = computed<IStatCard>(() => this.buildAccuracyStat(this.devHexagon()));
  readonly heatmapConfig = computed<IHeatmapConfig>(() => ({
    data: this.buildHeatmapData(this.devHexagon()),
    layout: this.heatmapLayout(),
    shape: this.heatmapShape()
  }));

  ngOnInit() {
    this.dashboardStore.loadTechStack();
  }

  changeHeatmapLayout(layout: 'vertical' | 'horizontal') {
    this.heatmapLayout.set(layout);
  }

  changeHeatmapShape(shape: 'square' | 'circle') {
    this.heatmapShape.set(shape);
  }

  private buildQuestionsStat(devHexagon: IDevHexagon | null): IStatCard {
    const primaryMetricCount = devHexagon?.primary_metrics.length ?? 0;

    return {
      icon: 'circle-check',
      iconColor: 'text-[#34A853]',
      iconBg: 'bg-[#34A85315]',
      value: primaryMetricCount,
      label: 'Primary Metrics',
      footer: primaryMetricCount > 0 ? `${devHexagon?.primary_metrics[0]} leads the stack profile` : 'Waiting for backend data'
    };
  }

  private buildTopicsStat(devHexagon: IDevHexagon | null): IStatCard {
    const topicsCount = devHexagon?.skills.reduce((total, skill) => total + skill.key_topics.length, 0) ?? 0;
    const nextTopic = devHexagon?.skills[0]?.key_topics[0] ?? 'Pending sync';

    return {
      icon: 'book-open',
      iconColor: 'text-[#1A73E8]',
      iconBg: 'bg-[#1A73E815]',
      value: topicsCount,
      label: 'Topics Mapped',
      footer: `Next focus: ${nextTopic}`
    };
  }

  private buildAccuracyStat(devHexagon: IDevHexagon | null): IStatCard {
    const skillsCount = devHexagon?.skills.length ?? 0;
    const targetLevel = devHexagon?.target_level ?? 'Target not loaded';

    return {
      icon: 'target',
      iconColor: 'text-[#9C27B0]',
      iconBg: 'bg-[#9C27B015]',
      value: skillsCount,
      label: 'Skill Categories',
      footer: `Target level: ${targetLevel}`
    };
  }

  private buildHeatmapData(devHexagon: IDevHexagon | null): Record<string, number> {
    const data: Record<string, number> = {};
    const skills = devHexagon?.skills ?? [];
    const today = new Date();

    for (let index = 0; index < 140; index++) {
      const date = new Date(today);
      date.setDate(today.getDate() - index);

      const key = date.toISOString().split('T')[0];
      const skill = skills[index % Math.max(skills.length, 1)];
      const count = skill ? (skill.key_topics.length + index) % 10 : 0;

      data[key] = count;
    }

    return data;
  }
}
