import { learningSections } from '../data/learning';

export function LearningPage() {
  return (
    <div className="page-header container">
      <p className="section-label">Growth</p>
      <h1>Continued Learning</h1>
      <p>Books, articles, research topics, and hands-on labs I am reading or plan to explore.</p>

      {learningSections.map((section) => (
        <section key={section.id} id={section.id} className="learning-section">
          <h2>{section.title}</h2>
          <div className="learning-list">
            {section.items.map((item) => (
              <article key={item.title} className="card learning-item">
                <h3>
                  {item.url ? (
                    <a href={item.url} target="_blank" rel="noreferrer">{item.title}</a>
                  ) : (
                    item.title
                  )}
                </h3>
                <p>{item.note}</p>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
