export interface IStatCard {
  icon: string;          // Lucide icon name (e.g., 'circle-check')
  iconColor: string;     // Tailwind text color (e.g., 'text-[#34A853]')
  iconBg: string;        // Tailwind bg color (e.g., 'bg-[#34A85315]')
  value: string | number;         // Display value (e.g., '142', '87%')
  label: string;         // Metric name (e.g., 'Questions Solved')
  footer: string;        // Subtext (e.g., '12 questions to next milestone')
}
