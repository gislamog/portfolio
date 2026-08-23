import { describe, it, expect } from 'vitest';
import { linkifyCitations, linkifyReference, portfolioPapers } from './mcsPortfolio';

const joined = (r: string) => linkifyReference(r).map((p) => p.text).join('');
const links = (r: string) => linkifyReference(r).filter((p) => p.href);

describe('linkifyReference', () => {
  it('turns a DOI into a doi.org link', () => {
    const [link] = links('Title, 1979. doi:10.2307/2346830');
    expect(link.href).toBe('https://doi.org/10.2307/2346830');
    expect(link.text).toBe('doi:10.2307/2346830');
  });

  it('leaves a trailing period out of the identifier', () => {
    const [link] = links('Deep Learning. doi:10.1038/nature14539. Available: x');
    expect(link.href).toBe('https://doi.org/10.1038/nature14539');
  });

  it('links a bare URL to itself', () => {
    const [link] = links('Available: https://arxiv.org/pdf/1903.06733');
    expect(link.href).toBe('https://arxiv.org/pdf/1903.06733');
  });

  it('links both identifiers when a reference carries a DOI and a URL', () => {
    const found = links(
      'Nature, 2015. doi:10.1038/nature14539. Available: https://www.nature.com/articles/nature14539',
    );
    expect(found).toHaveLength(2);
    expect(found[0].href).toBe('https://doi.org/10.1038/nature14539');
    expect(found[1].href).toBe('https://www.nature.com/articles/nature14539');
  });

  it('never alters the visible citation text', () => {
    for (const paper of portfolioPapers) {
      for (const r of paper.references) expect(joined(r)).toBe(r);
    }
  });

  it('finds a link in every reference in the report', () => {
    for (const paper of portfolioPapers) {
      for (const r of paper.references) expect(links(r).length).toBeGreaterThan(0);
    }
  });
});

describe('inline figures', () => {
  const sections = portfolioPapers.flatMap((p) => p.sections);

  it('anchors every figure to a paragraph that exists', () => {
    for (const s of sections) {
      for (const f of s.figures ?? []) {
        expect(f.afterParagraph).toBeGreaterThanOrEqual(-1);
        expect(f.afterParagraph).toBeLessThan(s.paragraphs.length);
      }
    }
  });

  it('gives every figure cell an image and alt text', () => {
    for (const s of sections) {
      for (const f of s.figures ?? []) {
        expect(f.cells.length).toBeGreaterThan(0);
        for (const c of f.cells) {
          expect(c.src).toMatch(/images\/report\/.+\.png$/);
          expect(c.alt.length).toBeGreaterThan(10);
        }
      }
    }
  });

  it('places every image figure from the source documents', () => {
    const cells = sections.flatMap((s) => (s.figures ?? []).flatMap((f) => f.cells));
    expect(cells).toHaveLength(7); // 3 tables x 2 + Fig. 1
    expect(new Set(cells.map((c) => c.src)).size).toBe(5); // 5 distinct images
  });
});

describe('display equations', () => {
  const sections = portfolioPapers.flatMap((p) => p.sections);
  const formulas = sections.flatMap((s) => s.formulas ?? []);

  it('carries the K-Means Loss Function the source document sets standalone', () => {
    const [loss] = formulas;
    const sums = loss.parts.filter((p) => 'sum' in p);
    expect(sums).toHaveLength(2); // the outer sum over clusters and the inner sum over points
    expect(loss.legend.map((e) => e.symbol)).toEqual(['x', 'μᵢ', 'k']);
  });

  it('carries the Binary Cross-Entropy loss, numbered as the paper cites it', () => {
    expect(formulas).toHaveLength(2); // one per paper
    const bce = formulas[1];
    expect(bce.number).toBe('(1)');
    expect(bce.parts.some((p) => 'frac' in p)).toBe(true); // the 1/N averaging term
    expect(bce.legend.map((e) => e.symbol)).toEqual(['yᵢ', 'ŷᵢ', 'N']);
  });

  it('never leaves an equation inlined in the paragraph that introduces it', () => {
    const bodies = sections.flatMap((s) => s.paragraphs);
    for (const text of bodies) expect(text).not.toMatch(/L = −\(1\/N\)/);
  });

  it('anchors every equation to a paragraph that exists', () => {
    for (const s of sections) {
      for (const f of s.formulas ?? []) {
        expect(f.afterParagraph).toBeGreaterThanOrEqual(-1);
        expect(f.afterParagraph).toBeLessThan(s.paragraphs.length);
      }
    }
  });

  it('gives every equation a spoken reading, since the stacked layout is visual', () => {
    for (const f of formulas) expect(f.speech.length).toBeGreaterThan(20);
  });
});

describe('plotted charts', () => {
  const sections = portfolioPapers.flatMap((p) => p.sections);
  const charts = sections.flatMap((s) => s.charts ?? []);

  it('carries Scatter Plot 1 with both algorithms over K = 2 to 10', () => {
    const plot = charts.find((c) => c.label === 'SCATTER PLOT 1');
    expect(plot?.series.map((s) => s.name)).toEqual(['K-Means', 'K-Means++']);
    for (const s of plot?.series ?? []) {
      expect(s.points.map((p) => p.x)).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10]);
    }
  });

  it('carries Graph 1 over the 20 training epochs', () => {
    expect(charts).toHaveLength(2); // one per paper
    const graph = charts.find((c) => c.label === 'GRAPH 1');
    expect(graph?.series.map((s) => s.name)).toEqual(['Test Loss', 'Train Loss']);
    // Test loss is recorded from the untrained network at epoch 0; training
    // loss is first available after the first epoch has run.
    const [test, train] = graph?.series ?? [];
    expect(test.points[0].x).toBe(0);
    expect(train.points[0].x).toBe(1);
    for (const s of graph?.series ?? []) expect(s.points[s.points.length - 1].x).toBe(20);
  });

  it('matches the loss values the second paper quotes in its text', () => {
    const graph = charts.find((c) => c.label === 'GRAPH 1');
    const at = (name: string, x: number) =>
      graph?.series.find((s) => s.name === name)?.points.find((p) => p.x === x)?.y;
    expect(at('Test Loss', 0)).toBe(0.7586);
    expect(at('Train Loss', 1)).toBe(0.2178);
    expect(at('Test Loss', 1)).toBe(0.1196);
    expect(at('Train Loss', 20)).toBe(0.0814);
    expect(at('Test Loss', 20)).toBe(0.0932);
  });

  it('keeps the loss values decreasing overall, as the report describes', () => {
    for (const c of charts) {
      for (const s of c.series) {
        const ys = s.points.map((p) => p.y);
        expect(ys[0]).toBeGreaterThan(ys[ys.length - 1]);
        for (const y of ys) expect(y).toBeGreaterThan(0);
      }
    }
  });

  it('anchors every chart to a paragraph that exists', () => {
    for (const s of sections) {
      for (const c of s.charts ?? []) {
        expect(c.afterParagraph).toBeGreaterThanOrEqual(-1);
        expect(c.afterParagraph).toBeLessThan(s.paragraphs.length);
      }
    }
  });

  it('describes every chart for readers who cannot see it', () => {
    for (const c of charts) expect(c.description.length).toBeGreaterThan(40);
  });
});

describe('linkifyCitations', () => {
  const cited = (t: string, id: string) => linkifyCitations(t, id).filter((p) => p.refNumber);

  it('maps an author-year citation to its reference number', () => {
    const [c] = cited('...clustering (Flynt & Dean, 2016).', 'kmeans-paper');
    expect(c.refNumber).toBe(2);
    expect(c.text).toBe('(Flynt & Dean, 2016)');
  });

  it('maps a narrative year-only citation', () => {
    const [c] = cited('Tanir and Nuriyeva (2017), who highlighted...', 'kmeans-paper');
    expect(c.refNumber).toBe(3);
  });

  it('maps an IEEE numeric citation to its own number', () => {
    const [c] = cited('...complex tasks [3].', 'neural-network-paper');
    expect(c.refNumber).toBe(3);
  });

  it('leaves an out-of-range or unknown citation as plain text', () => {
    expect(cited('...tasks [9].', 'neural-network-paper')).toHaveLength(0);
    expect(cited('...per (Nobody & Nothing, 1999).', 'kmeans-paper')).toHaveLength(0);
  });

  it('never alters the visible paragraph text', () => {
    for (const paper of portfolioPapers) {
      for (const s of paper.sections) {
        for (const t of s.paragraphs) {
          expect(linkifyCitations(t, paper.id).map((p) => p.text).join('')).toBe(t);
        }
      }
    }
  });

  it('resolves every citation appearing in either paper', () => {
    let found = 0;
    for (const paper of portfolioPapers) {
      for (const s of paper.sections) {
        for (const t of s.paragraphs) found += cited(t, paper.id).length;
      }
    }
    expect(found).toBe(8); // 4 author-year in paper 1, 4 numeric in paper 2
  });
});

describe('caption placement', () => {
  const figures = portfolioPapers.flatMap((p) => p.sections.flatMap((s) => s.figures ?? []));
  const byLabel = (l: string) => figures.find((f) => f.label === l);

  it('captions every figure above the artwork it labels', () => {
    for (const label of ['TABLE I', 'TABLE 2', 'TABLE 3', 'Fig. 1.']) {
      expect(byLabel(label)?.captionPosition).toBe('above');
    }
  });

  it('marks the figure number for inline rendering, and table numbers not', () => {
    // A trailing period distinguishes IEEE's inline figure numbering from the
    // block table labels; the renderer keys off it.
    expect(byLabel('Fig. 1.')?.label.endsWith('.')).toBe(true);
    for (const label of ['TABLE I', 'TABLE 2', 'TABLE 3']) {
      expect(byLabel(label)?.label.endsWith('.')).toBe(false);
    }
  });
});
