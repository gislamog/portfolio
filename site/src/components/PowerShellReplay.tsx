import { useEffect, useRef, useState } from 'react';
import { POWERSHELL_STEPS, PULL_MANIFEST_ROWS, HELLO_REPLY } from '../data/learningArticle';
import './PowerShellReplay.css';

interface Line {
  id: number;
  cls?: string;
  text: string;
}

const LAST_STEP = POWERSHELL_STEPS.length - 1;
const CANCEL = Symbol('cancel');

function bar(pct: number, width: number) {
  const n = Math.round((pct / 100) * width);
  return '█'.repeat(n) + ' '.repeat(width - n);
}

/**
 * Scripted two-step PowerShell session replay: typing animation, fake
 * download progress bars, a thinking spinner, then a streamed reply.
 * Ported from the retired static board's initTerm(). Cancellation uses an
 * incrementing ref id (mirroring the original's `runId`) so mashing
 * prev/next can't leave two animations racing into the same output.
 */
export function PowerShellReplay() {
  const [step, setStep] = useState(0);
  const [lines, setLines] = useState<Line[]>([]);
  const [playing, setPlaying] = useState(true);
  const runId = useRef(0);
  const nextLineId = useRef(0);
  const started = useRef(false);
  const reduce =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function sleep(ms: number, id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      window.setTimeout(() => (id === runId.current ? resolve() : reject(CANCEL)), ms);
    });
  }

  function addLine(cls: string | undefined, text: string, setter: (fn: (ls: Line[]) => Line[]) => void) {
    const lineId = nextLineId.current++;
    setter((ls) => [...ls, { id: lineId, cls, text }]);
    return lineId;
  }
  function updateLine(lineId: number, text: string, setter: (fn: (ls: Line[]) => Line[]) => void) {
    setter((ls) => ls.map((l) => (l.id === lineId ? { ...l, text } : l)));
  }
  function appendLine(lineId: number, delta: string, setter: (fn: (ls: Line[]) => Line[]) => void) {
    setter((ls) => ls.map((l) => (l.id === lineId ? { ...l, text: l.text + delta } : l)));
  }

  async function run(target: number, animateLast: boolean) {
    const id = ++runId.current;
    setLines([]);
    nextLineId.current = 0;
    const anim = (atTarget: boolean) => animateLast && !reduce && atTarget;
    const set = (fn: (ls: Line[]) => Line[]) => setLines(fn);

    async function type(lineId: number, text: string, ms: number) {
      if (!anim(true)) {
        appendLine(lineId, text, set);
        return;
      }
      for (const ch of text) {
        await sleep(ms + Math.random() * ms * 0.8, id);
        appendLine(lineId, ch, set);
      }
    }

    async function stage0(animated: boolean) {
      addLine(undefined, 'Windows PowerShell 5.1', set);
      addLine(undefined, 'Copyright (C) Microsoft Corporation. All rights reserved.', set);
      addLine(undefined, '', set);
      const promptId = addLine('nw', 'PS C:\\Users> ', set);
      if (animated) await sleep(450, id);
      await type(promptId, 'ollama run llama3.2', 55);
      if (animated) await sleep(250, id);
      appendLine(promptId, ' ← Downloads & starts Llama 3.2', set);
      addLine(undefined, 'pulling manifest', set);
      if (animated) await sleep(350, id);
      for (const { hash, size, ms } of PULL_MANIFEST_ROWS) {
        const lineId = addLine('nw', '', set);
        const draw = (pct: number) =>
          updateLine(lineId, `pulling ${hash}: ${String(pct).padStart(3)}% ▕${bar(pct, 22)}▏ ${size}`, set);
        if (!animated) {
          draw(100);
          continue;
        }
        const t0 = performance.now();
        for (;;) {
          const pct = Math.min(100, Math.round(((performance.now() - t0) / ms) * 100));
          draw(pct);
          if (pct >= 100) break;
          await sleep(40, id);
        }
      }
      for (const [txt, ms] of [
        ['verifying sha256 digest', 300],
        ['writing manifest', 160],
        ['success', 140],
      ] as const) {
        if (animated) await sleep(ms, id);
        addLine(undefined, txt, set);
      }
      if (animated) await sleep(120, id);
      addLine(undefined, '>>> ', set);
    }

    async function stage1(animated: boolean) {
      const promptId = addLine(undefined, '>>> ', set);
      if (animated) await sleep(300, id);
      await type(promptId, 'Hello!', 85);
      if (animated) await sleep(220, id);
      appendLine(promptId, ' ← Speaking with Ollama', set);
      if (animated) {
        const spinnerId = addLine('dim', '', set);
        const frames = '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏';
        for (let i = 0; i < 12; i++) {
          updateLine(spinnerId, frames[i % frames.length], set);
          await sleep(80, id);
        }
        updateLine(spinnerId, '', set);
      }
      const replyId = addLine(undefined, '', set);
      const words = HELLO_REPLY.split(' ');
      for (let i = 0; i < words.length; i++) {
        if (animated) await sleep(45, id);
        appendLine(replyId, (i ? ' ' : '') + words[i], set);
      }
      addLine(undefined, '', set);
      if (animated) await sleep(150, id);
      addLine(undefined, '>>> ', set);
    }

    const stages = [stage0, stage1];
    try {
      for (let i = 0; i <= target; i++) {
        await stages[i](anim(i === target));
      }
      if (id === runId.current) setPlaying(false);
    } catch (e) {
      if (e !== CANCEL) throw e;
    }
  }

  function go(i: number, animate: boolean) {
    const next = Math.max(0, Math.min(LAST_STEP, i));
    setStep(next);
    setPlaying(true);
    void run(next, animate);
  }

  function start() {
    if (started.current) return;
    started.current = true;
    go(0, true);
  }

  // The widget only starts animating once its article is actually opened
  // (ArticleReader mounts it), not the instant the module loads.
  useEffect(() => {
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const prevIsReplay = step === 0;
  const nextIsReplay = step === LAST_STEP;

  return (
    <figure className="art-term" aria-label="PowerShell session running Llama 3.2 with Ollama">
      <div className="at-bar">
        <span className="at-ico" aria-hidden="true">&gt;_</span>
        <span>Windows PowerShell</span>
      </div>
      <pre className="at-body" aria-live="polite">
        <code>
          {lines.map((l) => (
            <span key={l.id} className={`l${l.cls ? ` ${l.cls}` : ''}`}>
              {l.text}
            </span>
          ))}
        </code>
      </pre>
      <div className="at-foot">
        <button
          type="button"
          className="at-nav"
          aria-label={prevIsReplay ? 'Replay this step' : 'Previous step'}
          title={prevIsReplay ? 'Replay this step' : 'Previous step'}
          disabled={prevIsReplay && playing}
          onClick={() => go(prevIsReplay ? 0 : step - 1, true)}
        >
          {prevIsReplay ? <ReplayIcon /> : <Chevron dir="l" />}
        </button>
        <span className="at-cap">
          <b>{step + 1}/{POWERSHELL_STEPS.length}</b> · {POWERSHELL_STEPS[step]}
        </span>
        <button
          type="button"
          className="at-nav"
          aria-label={nextIsReplay ? 'Replay this step' : 'Next step'}
          title={nextIsReplay ? 'Replay this step' : 'Next step'}
          disabled={nextIsReplay && playing}
          onClick={() => go(nextIsReplay ? LAST_STEP : step + 1, true)}
        >
          {nextIsReplay ? <ReplayIcon /> : <Chevron dir="r" />}
        </button>
      </div>
    </figure>
  );
}

function Chevron({ dir }: { dir: 'l' | 'r' }) {
  const d = dir === 'l' ? 'M15 18l-6-6 6-6' : 'M9 6l6 6-6 6';
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

function ReplayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 12a8 8 0 1 0 2.3-5.7" />
      <path d="M4 4v4h4" />
    </svg>
  );
}
