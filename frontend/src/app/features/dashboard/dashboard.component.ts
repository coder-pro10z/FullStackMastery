import { Component, computed, inject, OnInit, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { ActivityHeatmapComponent } from '../../shared/components/activity-heatmap/activity-heatmap.component';
import { RadarChartComponent } from './components/radar-chart/radar-chart.component';
import { StreakCounterComponent } from './components/streak-counter/streak-counter.component';
import { ContinueLearningComponent } from './components/continue-learning/continue-learning.component';
import { IStatCard } from '../../core/models/stat-card.model';
import { IHeatmapConfig, IHeatmapStats } from '../../core/models/heatmap.model';
import { DashboardStore } from '../../core/state/dashboard.store';
import { IDevHexagon } from '../../core/models/dashboard.model';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    StatCardComponent, 
    ActivityHeatmapComponent,
    RadarChartComponent,
    StreakCounterComponent,
    ContinueLearningComponent,
    LucideAngularModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private dashboardStore = inject(DashboardStore);

  private heatmapLayout = signal<'vertical' | 'horizontal'>('vertical');
  private heatmapShape = signal<'square' | 'circle'>('circle');
  private manualContributions = signal<Record<string, number>>({});

  readonly isLoading = this.dashboardStore.isLoading;
  readonly errorMsg = this.dashboardStore.errorMsg;
  readonly devHexagon = this.dashboardStore.devHexagon;
  readonly skills = this.dashboardStore.skills;
  readonly targetLabel = computed(() => this.devHexagon()?.target_level ?? 'Full-Stack Architect');
  readonly questionsStat = computed<IStatCard>(() => this.buildQuestionsStat(this.devHexagon()));
  readonly topicsStat = computed<IStatCard>(() => this.buildQAStat(this.dashboardStore.dashboardStats()));
  readonly accuracyStat = computed<IStatCard>(() => this.buildAccuracyStat(this.devHexagon()));
  readonly heatmapConfig = computed<IHeatmapConfig>(() => {
    const rawData = this.buildHeatmapData(this.devHexagon(), this.manualContributions());
    return {
      data: rawData,
      layout: this.heatmapLayout(),
      shape: this.heatmapShape(),
      stats: this.calculateStats(rawData)
    };
  });

  ngOnInit() {
    this.dashboardStore.loadTechStack();
    
    try {
      const localDataStr = localStorage.getItem('user_contributions');
      if (localDataStr) {
        this.manualContributions.set(JSON.parse(localDataStr));
      }
    } catch (e) {
      console.error('Failed to parse local contributions', e);
    }
  }

  @HostListener('window:activity-logged')
  onActivityLogged() {
    try {
      const localDataStr = localStorage.getItem('user_contributions');
      if (localDataStr) {
        this.manualContributions.set(JSON.parse(localDataStr));
      }
    } catch (e) {
      console.error('Failed to sync local contributions', e);
    }
  }

  addContribution() {
    const d = new Date();
    const today = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    this.manualContributions.update(current => {
      const next = { ...current };
      next[today] = (next[today] || 0) + 1;
      
      try {
        localStorage.setItem('user_contributions', JSON.stringify(next));
      } catch (e) {
        console.error('Failed to save contribution', e);
      }
      
      return next;
    });
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

  private buildQAStat(stats: any): IStatCard {
    const count = stats?.questionsWithAnswersCount ?? 0;

    return {
      icon: 'book-open',
      iconColor: 'text-[#1A73E8]',
      iconBg: 'bg-[#1A73E815]',
      value: count,
      label: 'Q&A Pairs Mapped',
      footer: count > 0 ? 'Ready for study mode' : 'Next focus: Pending sync'
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

  private buildHeatmapData(devHexagon: IDevHexagon | null, manual: Record<string, number>): Record<string, number> {
    const data: Record<string, number> = {};
    const skills = devHexagon?.skills ?? [];
    const today = new Date();

    for (let index = 0; index < 140; index++) {
      const date = new Date(today);
      date.setDate(today.getDate() - index);

      const d = new Date(date);
      const key = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
      const skill = skills[index % Math.max(skills.length, 1)];
      const count = skill ? (skill.key_topics.length + index) % 10 : 0;

      data[key] = count;
    }

    // Merge manual overrides
    for (const [key, count] of Object.entries(manual)) {
      data[key] = (data[key] || 0) + count;
    }

    return data;
  }

  private calculateStats(data: Record<string, number>): IHeatmapStats {
    let totalCommits = 0;
    let activeDays = 0;
    
    // Sort dates from newest to oldest
    const dates = Object.keys(data).sort((a, b) => b.localeCompare(a));
    
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;
    
    const d = new Date();
    const today = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    
    let foundCurrentStreakEnd = false;

    for (let i = 0; i < dates.length; i++) {
      const dateKey = dates[i];
      const count = data[dateKey];
      
      totalCommits += count;
      if (count > 0) activeDays++;
      
      if (count > 0) {
        tempStreak++;
        if (tempStreak > bestStreak) bestStreak = tempStreak;
      } else {
        if (!foundCurrentStreakEnd && dateKey !== today) {
          currentStreak = tempStreak;
          foundCurrentStreakEnd = true;
        }
        tempStreak = 0;
      }
    }
    
    if (!foundCurrentStreakEnd) {
      currentStreak = tempStreak;
    }
    
    return {
      totalCommits,
      currentStreak,
      bestStreak,
      activeDays
    };
  }
}
