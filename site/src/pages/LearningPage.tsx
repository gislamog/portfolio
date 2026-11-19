import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SECTIONS } from '../data/learningBoard';
import { LearningColumns } from '../components/LearningColumns';
import { ArticleReader } from '../components/ArticleReader';
import { LearningLocalAiArticle } from '../components/LearningLocalAiArticle';
import { LearningMcsPortfolioArticle } from '../components/LearningMcsPortfolioArticle';
import { LearningBigDataCertArticle } from '../components/LearningBigDataCertArticle';
import './LearningPage.css';

const SHEETS = ['dots', 'ruled', 'hatched', 'graph'] as const;

const ARTICLES: Record<string, { label: string; render: () => React.ReactNode }> = {
  'local-ai': { label: 'Run your own AI locally', render: () => <LearningLocalAiArticle /> },
  'mcs-portfolio': { label: 'MCS Portfolio', render: () => <LearningMcsPortfolioArticle /> },
  'big-data-cert': { label: 'ASU — Big Data Graduate Certificate', render: () => <LearningBigDataCertArticle /> },
};

export function LearningPage() {
  const { hash } = useLocation();
  const navigate = useNavigate();
  const openArticleId = hash.replace(/^#/, '');
  const openArticle = openArticleId && ARTICLES[openArticleId] ? ARTICLES[openArticleId] : undefined;

  const closeArticle = useCallback(() => {
    navigate({ hash: '' }, { replace: false });
  }, [navigate]);

  const openArticleById = useCallback(
    (articleId: string) => {
      navigate({ hash: `#${articleId}` });
    },
    [navigate],
  );

  return (
    <div className="nb-page learning-page">
      {SECTIONS.map((section, i) => (
        <section key={section.id} id={section.id} className="nb-sheet" data-sheet={SHEETS[i % SHEETS.length]}>
          {i === 0 && (
            <div className="page-header container">
              <p className="section-label">Continued Learning</p>
              <h1>Continued Learning</h1>
              <p className="page-lead">
                Coursework, certifications, and side projects I keep working through, grouped the way I actually
                track them.
              </p>
            </div>
          )}
          <div className="page-content container">
            <h2 className="learning-section-title">{section.title}</h2>
            <p className="learning-section-intro">{section.intro}</p>
            <LearningColumns section={section} onOpenArticle={openArticleById} />
          </div>
        </section>
      ))}

      {openArticle && (
        <ArticleReader label={openArticle.label} onClose={closeArticle}>
          {openArticle.render()}
        </ArticleReader>
      )}
    </div>
  );
}
