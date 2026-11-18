import { STATUSES, statusFor, type LearningSection } from '../data/learningBoard';
import { LearningCard } from './LearningCard';

/**
 * Groups one section's items into status columns (To do / In progress /
 * Almost done / Done), each a responsive CSS Grid rather than the retired
 * board's brute-forced column-count-fitting layout — this codebase already
 * solves "responsive card reflow" with plain `repeat(auto-fit, minmax(...))`
 * grids elsewhere (courses-grid, skills-grid), so that's reused here too.
 * Only non-empty status columns render.
 */
export function LearningColumns({
  section,
  onOpenArticle,
}: {
  section: LearningSection;
  onOpenArticle: (articleId: string) => void;
}) {
  const groups = STATUSES.map((s) => ({
    status: s,
    items: section.items.filter((it) => statusFor(it.id) === s.value),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="learning-cols">
      {groups.map((g) => (
        <div key={g.status.value} className="learning-col" style={{ ['--c' as string]: `var(--s-${g.status.value})` }}>
          <div className="col-head">
            <span className="col-title">{g.status.label}</span>
            <span className="col-count">{g.items.length}</span>
          </div>
          <div className="learning-col-body">
            {g.items.map((item) => (
              <LearningCard key={item.id} item={item} status={g.status.value} onOpenArticle={onOpenArticle} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
