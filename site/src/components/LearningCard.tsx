import { LearningIcon } from '../data/learningIcons';
import type { LearningItem, LearningStatus, LearningTag } from '../data/learningBoard';
import { STATUS_COLOR_VAR } from '../data/learningBoard';

const TAG_LABEL: Partial<Record<LearningTag, string>> = {
  primary: 'start here',
  standout: 'worth it',
  cost: 'trial / paid',
};

function Tag({ tag }: { tag: LearningTag }) {
  const cls =
    tag === 'free'
      ? 'tag free'
      : tag === 'primary' || tag === 'standout'
      ? 'tag star'
      : tag === 'owned'
      ? 'tag owned'
      : tag === 'cost'
      ? 'tag cost'
      : 'tag';
  return <span className={cls}>{TAG_LABEL[tag] ?? tag}</span>;
}

/**
 * One kanban-style card, shared by every section on the Learning page.
 * Clicking the name either opens an external link, opens the ArticleReader
 * (when the item has an `article` id), or does nothing (plain text).
 */
export function LearningCard({
  item,
  status,
  onOpenArticle,
}: {
  item: LearningItem;
  status: LearningStatus;
  onOpenArticle: (articleId: string) => void;
}) {
  const nameContent = (
    <>
      <span className="name">{item.name}</span>
      {item.tags.map((t) => (
        <Tag key={t} tag={t} />
      ))}
    </>
  );

  return (
    <article className="learning-item" style={{ ['--stripe' as string]: `var(${STATUS_COLOR_VAR[status]})` }}>
      <span className="stripe" aria-hidden="true" />
      <div className="cbody">
        <div className="chead">
          <span className="ic" aria-hidden="true">
            {item.badge ? (
              <span className="ic-badge" style={{ background: item.badge.bg }}>
                {item.badge.text}
              </span>
            ) : (
              <LearningIcon name={item.icon ?? ''} />
            )}
          </span>
          <div className="htext">
            <p className="top">
              {item.article ? (
                <button type="button" className="learning-item-link" onClick={() => onOpenArticle(item.article!)}>
                  {nameContent}
                </button>
              ) : item.links?.length ? (
                <a href={item.links[0][1]} target="_blank" rel="noopener noreferrer" className="learning-item-link">
                  {nameContent}
                </a>
              ) : (
                nameContent
              )}
            </p>
          </div>
        </div>
        <p className="desc" title={item.desc}>{item.short}</p>
        {item.ties && <p className="ties">{item.ties}</p>}
      </div>
    </article>
  );
}
