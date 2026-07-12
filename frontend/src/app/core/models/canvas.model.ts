export interface ICanvasChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface ICanvasKeywordItem {
  id: string;
  term: string;
  def: string;
  useCase: string;
  impl: string;
  checked: boolean;
  matchStatus?: 'match' | 'missing' | 'nice-to-have';
  category?: string;
}

export interface ICanvasChecklistState {
  jdItems: ICanvasChecklistItem[];
  resumeItems: ICanvasChecklistItem[];
}

export interface IPitchStrategyState {
  introChecked: boolean;
  aboutChecked: boolean;
  customChecked: boolean;
  introText: string;
  aboutText: string;
  customTitle: string;
  customText: string;
}

export type PitchStrategyTextField = 'introText' | 'aboutText' | 'customTitle' | 'customText';
export type PitchStrategyCheckField = 'introChecked' | 'aboutChecked' | 'customChecked';

export interface ICanvasQaItem {
  id: string;
  q: string;
  motive: string;
  hint: string;
  a: string;
  showHint: boolean;
  showAnswer: boolean;
  checked: boolean;
}

export interface ICanvasState {
  title: string;
  checklist: ICanvasChecklistState;
  pitchStrategy: IPitchStrategyState;
  qaItems: ICanvasQaItem[];
  keywords: ICanvasKeywordItem[];
}
