export interface IHeatmapConfig {
  data: Record<string, number>;   // { '2026-04-20': 3, ... }
  layout: 'vertical' | 'horizontal';
  shape: 'square' | 'circle';
}

export interface IHeatmapCell {
  date: Date;
  count: number;
  isFuture: boolean;
  color: string;
}
