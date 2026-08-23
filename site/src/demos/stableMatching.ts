export type MatchingStep = {
  proposer: string;
  proposed: string;
  action: 'propose' | 'accept' | 'reject' | 'replace';
  note: string;
  engaged: Record<string, string>;
};

export function galeShapley(
  proposers: string[],
  _receivers: string[],
  proposerPrefs: Record<string, string[]>,
  receiverPrefs: Record<string, string[]>,
) {
  const free = [...proposers];
  const nextIndex: Record<string, number> = Object.fromEntries(proposers.map((p) => [p, 0]));
  const engaged: Record<string, string> = {};
  const steps: MatchingStep[] = [];
  const rank = (list: string[], name: string) => list.indexOf(name);

  while (free.length) {
    const proposer = free.shift()!;
    const prefs = proposerPrefs[proposer];
    const i = nextIndex[proposer];
    if (i >= prefs.length) continue;
    const proposed = prefs[i];
    nextIndex[proposer] += 1;
    const current = Object.entries(engaged).find(([, r]) => r === proposed)?.[0];
    steps.push({
      proposer,
      proposed,
      action: 'propose',
      note: `${proposer} proposes to ${proposed}.`,
      engaged: { ...engaged },
    });
    if (!current) {
      engaged[proposer] = proposed;
      steps.push({
        proposer,
        proposed,
        action: 'accept',
        note: `${proposed} is free and accepts.`,
        engaged: { ...engaged },
      });
    } else if (rank(receiverPrefs[proposed], proposer) < rank(receiverPrefs[proposed], current)) {
      delete engaged[current];
      engaged[proposer] = proposed;
      free.push(current);
      steps.push({
        proposer,
        proposed,
        action: 'replace',
        note: `${proposed} prefers ${proposer} over ${current}.`,
        engaged: { ...engaged },
      });
    } else {
      free.push(proposer);
      steps.push({
        proposer,
        proposed,
        action: 'reject',
        note: `${proposed} stays with ${current}.`,
        engaged: { ...engaged },
      });
    }
  }

  return { engaged, steps };
}

export const hospitalExample = {
  proposers: ['R1', 'R2', 'R3'],
  receivers: ['H1', 'H2', 'H3'],
  proposerPrefs: {
    R1: ['H1', 'H2', 'H3'],
    R2: ['H1', 'H3', 'H2'],
    R3: ['H2', 'H1', 'H3'],
  },
  receiverPrefs: {
    H1: ['R2', 'R1', 'R3'],
    H2: ['R1', 'R3', 'R2'],
    H3: ['R1', 'R2', 'R3'],
  },
};
