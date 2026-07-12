export interface ICodeBlock {
  code: string;
  language: string;       // 'csharp', 'sql', 'typescript', etc.
  filename?: string;      // Optional file tab label
  showLineNumbers: boolean;
}
