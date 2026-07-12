export interface ITechStackResponse {
  dev_hexagon: IDevHexagon;
}

export interface IDevHexagon {
  version: string;
  role: string;
  target_level: string;
  primary_metrics: string[];
  skills: ISkillCategory[];
}

export interface ISkillCategory {
  category: string;
  high_level_goal: string;
  interview_gotcha: string;
  key_topics: string[];
}
