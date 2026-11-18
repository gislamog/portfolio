import {
  MODEL_TILES,
  OLLAMA_CHEAT_SHEET,
  INTRO_QUESTIONS,
  ANSWER_SECTIONS,
} from '../data/learningArticle';
import { PowerShellReplay } from './PowerShellReplay';
import { useHashScrollFlash } from '../hooks/useHashScrollFlash';
import './LearningLocalAiArticle.css';

function QuestionLink({ id, question, flashHeading }: { id: string; question: string; flashHeading: (id: string) => void }) {
  return (
    <a
      className="q"
      href={`#${id}`}
      onClick={(e) => {
        e.preventDefault();
        flashHeading(id);
      }}
    >
      {question}
    </a>
  );
}

const MODEL_LOGOS: Record<string, React.ReactNode> = {
  llama: (
    <svg viewBox="0 0 32 32">
      <path
        d="M4 19.5c0-5.6 2.9-9.5 6.4-9.5 3 0 4.9 3.3 6.9 6.9s3.9 7.1 6.6 7.1c2.4 0 4.1-1.9 4.1-4.9 0-5-2.6-9.1-5.6-9.1-3 0-4.9 3.4-6.9 6.9s-4 7.1-6.6 7.1C6 24 4 22.4 4 19.5z"
        fill="none"
        stroke="#0a84ff"
        strokeWidth={3.4}
        strokeLinejoin="round"
      />
    </svg>
  ),
  deepseek: (
    <svg viewBox="0 0 32 32">
      <path
        d="M4.5 17.2c0-5 4.6-8.2 10.3-8.2 4 0 7.1 1.6 8.9 4.2l3-2.6c1 2.3.7 4.8-.9 6.6.3 4.6-3.9 8.3-10.8 8.3-6 0-10.5-3.3-10.5-8.3z"
        fill="#fff"
      />
      <circle cx="20.2" cy="15" r="1.3" fill="#1f1b33" />
      <path d="M9 19.5c2.2 1.4 5 1.8 7.6 1" fill="none" stroke="#1f1b33" strokeWidth={1.4} strokeLinecap="round" />
    </svg>
  ),
  gemma: (
    <svg viewBox="0 0 32 32">
      <g fill="none" strokeWidth={5}>
        <path d="M23.66 9.57A10 10 0 0 0 6.6 12.58" stroke="#ea4335" />
        <path d="M6.6 12.58A10 10 0 0 0 6.6 19.42" stroke="#fbbc05" />
        <path d="M6.6 19.42A10 10 0 0 0 23.66 22.43" stroke="#34a853" />
        <path d="M23.66 22.43A10 10 0 0 0 26 16H16" stroke="#4285f4" />
      </g>
    </svg>
  ),
  mistral: (
    <svg viewBox="0 0 30 30">
      <g fill="#ffd800"><rect x="3" y="4" width="4.8" height="4.4" /><rect x="22.2" y="4" width="4.8" height="4.4" /></g>
      <g fill="#ffaf00"><rect x="3" y="8.4" width="4.8" height="4.4" /><rect x="7.8" y="8.4" width="4.8" height="4.4" /><rect x="17.4" y="8.4" width="4.8" height="4.4" /><rect x="22.2" y="8.4" width="4.8" height="4.4" /></g>
      <g fill="#ff8205"><rect x="3" y="12.8" width="4.8" height="4.4" /><rect x="7.8" y="12.8" width="4.8" height="4.4" /><rect x="12.6" y="12.8" width="4.8" height="4.4" /><rect x="17.4" y="12.8" width="4.8" height="4.4" /><rect x="22.2" y="12.8" width="4.8" height="4.4" /></g>
      <g fill="#fa500f"><rect x="3" y="17.2" width="4.8" height="4.4" /><rect x="12.6" y="17.2" width="4.8" height="4.4" /><rect x="22.2" y="17.2" width="4.8" height="4.4" /></g>
      <g fill="#e10500"><rect x="3" y="21.6" width="4.8" height="4.4" /><rect x="22.2" y="21.6" width="4.8" height="4.4" /></g>
    </svg>
  ),
};

export function LearningLocalAiArticle() {
  const { flashHeading } = useHashScrollFlash();

  return (
    <article className="art-body">
      <h1>Hosting a Local LLM</h1>
      <p className="art-lede">
        Have your own AI running entirely on your computer — without paying a subscription or needing internet access.
      </p>
      <p>
        Running a LLM (Large Language Model) locally comes with many benefits: Better privacy and control over your
        data; Offline use; Free with no worry of tokens; Customization of the model&rsquo;s parameters; and Access to
        logs or other internal data cloud LLMs do not expose. There are several free and popular AI models available
        to download and run locally on your own computer. Some examples include:
      </p>
      <div className="models">
        {MODEL_TILES.map((m) => (
          <a
            key={m.id}
            className="model"
            href={m.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ['--m' as string]: m.accent }}
            aria-label={`${m.name} by ${m.maker}, ${m.size} (opens on ollama.com)`}
          >
            <span className="lg" aria-hidden="true">{MODEL_LOGOS[m.id]}</span>
            <span className="tx">
              <span className="nm">{m.name}</span>
              <span className="by">{m.maker}</span>
            </span>
            <span className="sz">{m.size}</span>
            <svg className="go" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 12h15M13 6l6 6-6 6" />
            </svg>
          </a>
        ))}
      </div>

      <PowerShellReplay />

      <p>
        We will explore the commands and tools needed to set up our own AI assistant on our computer.{' '}
        {INTRO_QUESTIONS.firstPara.map((q) => (
          <span key={q.id}>
            <QuestionLink id={q.id} question={q.question} flashHeading={flashHeading} />{' '}
          </span>
        ))}
        For example, it won&rsquo;t automatically have access to current events or the latest news, but it could
        interact with our operating system, help with personal automations, and assist with personal projects.
      </p>

      <aside className="art-side" aria-label="Ollama command cheat sheet">
        <div className="term-bar">
          <span className="term-dots" aria-hidden="true"><i /><i /><i /></span>
          <h2 className="term-title">
            <span className="pr">&gt;_</span> Ollama Cheat Sheet
            <a className="term-dl" href="https://ollama.com/download" target="_blank" rel="noopener noreferrer" title="Download Ollama" aria-label="Download Ollama (opens ollama.com)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 17L17 7M8 7h9v9" />
              </svg>
            </a>
          </h2>
        </div>
        <pre className="term-body">
          <code>
            {OLLAMA_CHEAT_SHEET.map((l, i) => (
              <span key={i} className={`ln${!l.comment && !l.command ? '' : ''}`}>
                {l.comment && <span className="c">{`// ${l.comment}`}</span>}
                {l.command && (
                  <>
                    <span className="k">{l.command}</span>{' '}
                    {l.sub && <span className="s">{l.sub}</span>}
                    {l.arg && <> <span className="a">{l.arg}</span></>}
                    {l.quoted && <> <span className="q">{l.quoted}</span></>}
                  </>
                )}
                {'\n'}
              </span>
            ))}
          </code>
        </pre>
      </aside>

      <p>
        We will also explore some of the terminology we encounter along the way.{' '}
        <QuestionLink id={INTRO_QUESTIONS.terminology[0].id} question={INTRO_QUESTIONS.terminology[0].question} flashHeading={flashHeading} />{' '}
        <span className="art-todo">[TODO: Find more questions.]</span>
      </p>
      <p>
        Security is another important question.{' '}
        <QuestionLink id={INTRO_QUESTIONS.security[0].id} question={INTRO_QUESTIONS.security[0].question} flashHeading={flashHeading} />{' '}
        <QuestionLink id={INTRO_QUESTIONS.security[1].id} question={INTRO_QUESTIONS.security[1].question} flashHeading={flashHeading} />{' '}
        At some point, we will need to give our assistant internet access for progressing on tasks.{' '}
        <QuestionLink id={INTRO_QUESTIONS.security[2].id} question={INTRO_QUESTIONS.security[2].question} flashHeading={flashHeading} />
      </p>
      <p>
        <QuestionLink id={INTRO_QUESTIONS.guardrails[0].id} question={INTRO_QUESTIONS.guardrails[0].question} flashHeading={flashHeading} />
      </p>
      <p>
        Finally, we will explore the quality of locally hosted AI models.{' '}
        <QuestionLink id={INTRO_QUESTIONS.quality[0].id} question={INTRO_QUESTIONS.quality[0].question} flashHeading={flashHeading} />{' '}
        There is a lot to explore.
      </p>

      <div className="art-content">
        {ANSWER_SECTIONS.map((a, i) => (
          <div key={i}>
            <h2 id={a.id}>{a.heading}</h2>
            <p className="art-todo">{a.body}</p>
          </div>
        ))}
      </div>
    </article>
  );
}
