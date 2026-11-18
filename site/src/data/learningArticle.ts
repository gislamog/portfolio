/**
 * Static content for the "Run your own AI locally" article, ported from the
 * retired static board. Every answer below is a placeholder the user has not
 * written yet — do not fill these in; they're intentionally [To answer.].
 */

export interface ModelTile {
  id: string;
  name: string;
  maker: string;
  size: string;
  href: string;
  /** Accent color driving the tile's --m custom property. */
  accent: string;
}

export const MODEL_TILES: ModelTile[] = [
  { id: 'llama', name: 'Llama', maker: 'Meta', size: '1.3–2 GB', href: 'https://ollama.com/library/llama3.2', accent: '#1877f2' },
  { id: 'deepseek', name: 'DeepSeek', maker: 'DeepSeek', size: '4.7 GB', href: 'https://ollama.com/library/deepseek-r1', accent: '#5b4bdb' },
  { id: 'gemma', name: 'Gemma', maker: 'Google', size: '0.8–17 GB', href: 'https://ollama.com/library/gemma3', accent: '#1f9d6a' },
  { id: 'mistral', name: 'Mistral', maker: 'Mistral AI', size: '4.1 GB', href: 'https://ollama.com/library/mistral', accent: '#c2560c' },
];

/** One line of the Ollama cheat-sheet terminal, in display order. */
export interface CheatLine {
  comment?: string;
  command?: string;
  sub?: string;
  arg?: string;
  quoted?: string;
}

export const OLLAMA_CHEAT_SHEET: CheatLine[] = [
  { comment: 'Models you’ve downloaded' },
  { command: 'ollama', sub: 'list' },
  {},
  { comment: 'Models currently loaded in memory' },
  { command: 'ollama', sub: 'ps' },
  {},
  { comment: 'Download without starting a chat' },
  { command: 'ollama', sub: 'pull', arg: '<model>' },
  {},
  { comment: 'Delete a model to free disk space' },
  { command: 'ollama', sub: 'rm', arg: '<model>' },
  {},
  { comment: 'One-shot prompt' },
  { command: 'ollama', sub: 'run', arg: '<model>', quoted: '"…"' },
];

/** A "question" jump-link in the article intro, pointing at an answer heading below. */
export interface QuestionLink {
  id: string;
  question: string;
}

export const INTRO_QUESTIONS = {
  firstPara: [
    { id: 'q-uses', question: 'What can we actually do with it?' },
    { id: 'q-limits', question: 'What are its limitations?' },
    { id: 'q-automate', question: 'What will we automate, and how much can be accomplished through AI prompting?' },
  ] satisfies QuestionLink[],
  terminology: [
    { id: 'q-parameters', question: 'What does the word "parameters" actually mean when describing an AI model (measured in millions)?' },
  ] satisfies QuestionLink[],
  security: [
    { id: 'q-offline', question: 'Will it really work offline?' },
    {
      id: 'q-security',
      question:
        'What security risks does installing a local AI assistant introduce to our computers? Could malware compromise it or give attackers control over our system?',
    },
    {
      id: 'q-injection',
      question:
        'But what happens when it starts reading content from the internet? Could someone hide malicious instructions in a website or document, tricking our AI into performing tasks without our knowledge? Could it be manipulated into downloading malware, accessing personal documents, or even damaging your system?',
    },
  ] satisfies QuestionLink[],
  guardrails: [
    { id: 'q-guardrails', question: 'Whose responsibility is it to put safety guardrails in place? Ours, or the company that developed the model?' },
  ] satisfies QuestionLink[],
  quality: [
    {
      id: 'q-quality',
      question: "How capable are they? Are they anywhere near comparable to commercial assistants like Anthropic's Claude?",
    },
  ] satisfies QuestionLink[],
};

/** One answer heading + its (currently placeholder) body. */
export interface AnswerSection {
  id?: string;
  heading: string;
  body: string;
}

export const ANSWER_SECTIONS: AnswerSection[] = [
  {
    heading: 'How I ran it',
    body: 'I installed Ollama from ollama.com/download, then used the commands in the panel on the right. The first model I pulled was Llama. [To add: the exact model and size, the hardware I ran it on, and how fast it responded.]',
  },
  { id: 'q-uses', heading: 'What can we do with it?', body: '[To answer: the tasks I actually used it for, with examples.]' },
  { id: 'q-limits', heading: 'Its limitations', body: '[To answer.]' },
  { id: 'q-automate', heading: 'What will we automate?', body: '[To answer: the automations I build, and how far prompting alone gets them.]' },
  { id: 'q-parameters', heading: 'What "parameters" means', body: '[To answer.]' },
  { id: 'q-offline', heading: 'Does it really work offline?', body: '[To answer.]' },
  { id: 'q-security', heading: 'Security risks of a local assistant', body: '[To answer.]' },
  { id: 'q-injection', heading: 'Hidden instructions in web pages and documents', body: '[To answer.]' },
  { id: 'q-guardrails', heading: 'Who puts the guardrails in place?', body: '[To answer.]' },
  { id: 'q-quality', heading: 'How good is it compared to Claude?', body: '[To answer: my own side-by-side tests.]' },
  { heading: 'Projects (to recreate)', body: '[To document: each small project — what it did, the prompt or script, and exact steps to recreate it.]' },
];

/** The two scripted steps of the PowerShell replay widget. */
export const POWERSHELL_STEPS = ['Download and start Llama 3.2', 'Say hello'] as const;

export const PULL_MANIFEST_ROWS: { hash: string; size: string; ms: number }[] = [
  { hash: 'dde5aa3fc5ff', size: '2.0 GB', ms: 1100 },
  { hash: '966de95ca8a6', size: '1.4 KB', ms: 220 },
  { hash: '34bb5ab01051', size: ' 561 B', ms: 220 },
];

export const HELLO_REPLY =
  "Hello! It's nice to meet you. Is there something I can help you with or would you like to chat?";
