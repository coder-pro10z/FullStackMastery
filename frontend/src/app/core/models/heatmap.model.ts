export interface IHeatmapStats {
  totalCommits: number;
  currentStreak: number;
  bestStreak: number;
  activeDays: number;
}

export interface IHeatmapConfig {
  data: Record<string, number>;   // { '2026-04-20': 3, ... }
  layout: 'vertical' | 'horizontal';
  shape: 'square' | 'circle';
  stats: IHeatmapStats;
}

export interface IHeatmapCell {
  date: Date;
  count: number;
  isFuture: boolean;
  color: string;
}
