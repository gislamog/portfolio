import { mulberry32 } from './kmeans';

export const EDUCATIONS = ['HS-grad', 'Some-college', 'Bachelors', 'Masters', 'Doctorate'] as const;
export const OCCUPATIONS = ['Tech', 'Education', 'Healthcare', 'Trade', 'Sales'] as const;

export type AdultRow = {
  education: (typeof EDUCATIONS)[number];
  occupation: (typeof OCCUPATIONS)[number];
  hours: number;
  highIncome: boolean;
};

export function generateAdultRows(seed = 21, count = 240): AdultRow[] {
  const rand = mulberry32(seed);
  const rows: AdultRow[] = [];
  for (let i = 0; i < count; i++) {
    const education = EDUCATIONS[Math.floor(rand() * EDUCATIONS.length)];
    const occupation = OCCUPATIONS[Math.floor(rand() * OCCUPATIONS.length)];
    const hours = 20 + Math.floor(rand() * 41);
    const eduBoost = EDUCATIONS.indexOf(education) * 0.08;
    const hoursBoost = Math.max(0, (hours - 35) / 80);
    const occBoost = occupation === 'Tech' || occupation === 'Healthcare' ? 0.08 : 0;
    const p = Math.min(0.85, 0.12 + eduBoost + hoursBoost + occBoost);
    rows.push({ education, occupation, hours, highIncome: rand() < p });
  }
  return rows;
}

export function incomeShare(rows: AdultRow[]) {
  if (!rows.length) return 0;
  return rows.filter((r) => r.highIncome).length / rows.length;
}

export function groupByEducation(rows: AdultRow[]) {
  return EDUCATIONS.map((education) => {
    const subset = rows.filter((r) => r.education === education);
    return {
      education,
      total: subset.length,
      high: subset.filter((r) => r.highIncome).length,
      share: incomeShare(subset),
    };
  });
}

export function filterAdultRows(
  rows: AdultRow[],
  education: string | 'all',
  occupation: string | 'all',
  minHours: number,
) {
  return rows.filter((r) => {
    if (education !== 'all' && r.education !== education) return false;
    if (occupation !== 'all' && r.occupation !== occupation) return false;
    return r.hours >= minHours;
  });
}
