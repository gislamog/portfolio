import { Component, lazy, Suspense, useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { FiActivity, FiArrowLeft, FiAward, FiBookOpen, FiPlay, FiX } from 'react-icons/fi';
import { experiments, exploreArticles, featuredExploreArticles, getExperiment, getExploreArticle, type ExperimentId, type ExploreArticleId } from '../data/explore';
import { demoHref } from '../data/projects';
import { ExploreArticleDocument } from './ExploreArticleDocument';
import './ExplorePage.css';

const demoComponents = {
  kmeans: lazy(() => import('../demos/KMeansDemo').then(({ KMeansDemo }) => ({ default: KMeansDemo }))),
  'robot-ml': lazy(() => import('../demos/RobotMLDemo').then(({ RobotMLDemo }) => ({ default: RobotMLDemo }))),
  sierpinski: lazy(() => import('../demos/SierpinskiDemo').then(({ SierpinskiDemo }) => ({ default: SierpinskiDemo }))),
};

const modalSession = Math.random().toString(36);
export function isExploreModal(state: unknown) {
  return typeof state === 'object' && state !== null && 'exploreModal' in state && state.exploreModal === modalSession;
}

function useExploreMetadata(title: string, description: string) {
  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const oldTitle = document.title;
    const oldDescription = meta?.content;
    document.title = `${title} | Gulsum Islamoglu`;
    if (meta) meta.content = description;
    return () => {
      document.title = oldTitle;
      if (meta && oldDescription !== undefined) meta.content = oldDescription;
    };
  }, [title, description]);
}

function ArticleLink({ id, label, children }: { id: ExploreArticleId; label?: string; children: ReactNode }) {
  return <Link className="portfolio-pill explore-primary" aria-label={label} to={`/explore/${id}`} state={{ exploreModal: modalSession }}>{children}</Link>;
}

function ExploreGallery() {
  return (
    <div className="portfolio-content explore-page">
      <header className="portfolio-section-intro">
        <p className="portfolio-eyebrow">The Engineering Notebook</p>
        <h1>Explore</h1>
        <p className="portfolio-summary">Ideas, experiments &amp; discoveries.</p>
      </header>
      <section className="explore-featured" aria-label="Featured discoveries">
        {featuredExploreArticles.map((id) => {
          const article = exploreArticles[id];
          return (
            <article className="portfolio-card explore-feature" key={id}>
              <img src={article.image} alt={article.alt} width="640" height="360" />
              <div className="explore-feature-copy">
                <p className="explore-kind"><FiPlay aria-hidden="true" /> Interactive experiment</p>
                <h2>{article.title}</h2>
                <p>{article.question}</p>
                <div className="explore-actions">
                  <ArticleLink id={id} label={`Read the investigation: ${article.title}`}>Read the investigation</ArticleLink>
                  <Link to={demoHref(article.demo)}>{id === 'kmeans-initialization' ? 'Try clustering' : 'Try the simulator'}</Link>
                </div>
              </div>
            </article>
          );
        })}
      </section>
      <section className="explore-collection" aria-labelledby="explore-collection-title">
        <h2 id="explore-collection-title">More to explore</h2>
        <div className="explore-collection-grid">
          <article className="portfolio-card explore-entry">
            <p className="explore-kind"><FiActivity aria-hidden="true" /> Interactive experiment</p>
            <h3>{experiments.sierpinski.title}</h3>
            <p>{experiments.sierpinski.description}</p>
            <Link className="portfolio-pill" to={demoHref('sierpinski')}>Build the triangle</Link>
          </article>
          {(['mcs-portfolio', 'big-data-cert'] as const).map((id) => {
            const entry = exploreArticles[id];
            const Icon = id === 'mcs-portfolio' ? FiBookOpen : FiAward;
            return (
              <article className="portfolio-card explore-entry" key={id}>
                <p className="explore-kind"><Icon aria-hidden="true" />{id === 'mcs-portfolio' ? 'Research · July 2026' : 'Completed credential'}</p>
                <h3>{entry.title}</h3>
                <p>{entry.description}</p>
                <ArticleLink id={id}>{id === 'mcs-portfolio' ? 'Read the report' : 'View the certificate'}</ArticleLink>
              </article>
            );
          })}
        </div>
      </section>
      <Link className="explore-about" to="/about">About Gulsum</Link>
    </div>
  );
}

function ExploreArticleModal({ id }: { id: ExploreArticleId }) {
  const navigate = useNavigate();
  const dialog = useRef<HTMLDialogElement>(null);

  useLayoutEffect(() => {
    const panel = dialog.current;
    if (!panel) return;
    const trigger = document.activeElement;
    panel.showModal();
    return () => {
      panel.close();
      if (trigger instanceof HTMLElement) trigger.focus({ preventScroll: true });
    };
  }, []);

  return (
    <dialog
      ref={dialog}
      className="explore-dialog"
      aria-labelledby="explore-article-title"
      onCancel={(event) => { event.preventDefault(); navigate(-1); }}
      onClick={(event) => { if (event.target === event.currentTarget) navigate(-1); }}
    >
      <div className="explore-dialog-scroll">
        <div className="explore-dialog-toolbar">
          <button type="button" aria-label="Close article" onClick={() => navigate(-1)}><FiX aria-hidden="true" /> Close</button>
        </div>
        <ExploreArticleDocument id={id} />
      </div>
    </dialog>
  );
}

class DemoErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <p role="alert">The experiment could not start. <button type="button" onClick={() => window.location.reload()}>Reload experiment</button></p>;
    return this.props.children;
  }
}

function ExperimentWorkspace({ id }: { id: ExperimentId }) {
  const experiment = experiments[id];
  const Demo = demoComponents[id];
  return (
    <div className="portfolio-content explore-page explore-workspace">
      <Link className="explore-back" to="/explore"><FiArrowLeft aria-hidden="true" /> Back to Explore</Link>
      <header className="portfolio-section-intro">
        <p className="portfolio-eyebrow">Interactive Experiment</p>
        <h1>{experiment.title}</h1>
        <p className="portfolio-summary">{experiment.description}</p>
      </header>
      {'article' in experiment && <Link className="explore-about" to={`/explore/${experiment.article}`}>Read the investigation</Link>}
      <div className="portfolio-card explore-demo">
        <DemoErrorBoundary key={id}>
          <Suspense fallback={<p role="status">Loading experiment…</p>}><Demo /></Suspense>
        </DemoErrorBoundary>
      </div>
    </div>
  );
}

const exploreDescription = 'Ideas, experiments and discoveries in machine learning, visual computing, and continued learning.';

export function ExplorePage() {
  const { pathname, state } = useLocation();
  const path = pathname.replace(/\/$/, '').split('/').slice(2);
  const articleId = path.length === 1 ? getExploreArticle(path[0]) : undefined;
  const experimentId = path.length === 2 && path[0] === 'experiments' ? getExperiment(path[1]) : undefined;
  const metadata = articleId ? exploreArticles[articleId] : experimentId ? experiments[experimentId] : null;
  const modalOpen = Boolean(articleId && isExploreModal(state));
  useExploreMetadata(metadata?.title ?? 'Explore', metadata?.description ?? exploreDescription);

  if (experimentId) return <ExperimentWorkspace id={experimentId} />;
  if (articleId && !modalOpen) {
    return (
      <div className="portfolio-content explore-page">
        <Link className="explore-back" to="/explore"><FiArrowLeft aria-hidden="true" /> Back to Explore</Link>
        <ExploreArticleDocument id={articleId} />
      </div>
    );
  }
  if (path.length && !articleId) return <div className="portfolio-content explore-page"><h1>Entry unavailable</h1><Link className="explore-back" to="/explore">Back to Explore</Link></div>;

  return <><ExploreGallery />{articleId && <ExploreArticleModal id={articleId} />}</>;
}

export function ExploreLegacyRedirect({ section }: { section: 'learning' | 'demos' }) {
  const { hash } = useLocation();
  const id = hash.slice(1);
  const destination = section === 'demos' && getExperiment(id)
    ? demoHref(id)
    : section === 'learning' && getExploreArticle(id) ? `/explore/${id}` : '/explore';
  return <Navigate to={destination} replace />;
}
