import { useMemo, useState } from 'react';
import './Demos.css';
import {
  EDUCATIONS,
  OCCUPATIONS,
  filterAdultRows,
  generateAdultRows,
  groupByEducation,
  incomeShare,
} from './adultIncome';

export function AdultIncomeDemo() {
  const all = useMemo(() => generateAdultRows(21, 280), []);
  const [education, setEducation] = useState<string>('all');
  const [occupation, setOccupation] = useState<string>('all');
  const [minHours, setMinHours] = useState(20);
  const filtered = useMemo(
    () => filterAdultRows(all, education, occupation, minHours),
    [all, education, occupation, minHours],
  );
  const groups = useMemo(() => groupByEducation(filtered), [filtered]);
  const maxTotal = Math.max(...groups.map((g) => g.total), 1);

  return (
    <div className="demo-wrap">
      <div className="demo-fields" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <label>
          Education
          <select value={education} onChange={(e) => setEducation(e.target.value)}>
            <option value="all">All</option>
            {EDUCATIONS.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </label>
        <label>
          Occupation
          <select value={occupation} onChange={(e) => setOccupation(e.target.value)}>
            <option value="all">All</option>
            {OCCUPATIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </label>
        <label>
          Min hours
          <input type="number" min={0} max={60} value={minHours} onChange={(e) => setMinHours(Number(e.target.value))} />
        </label>
      </div>
      <p className="demo-stat" style={{ margin: '0.75rem 0' }}>
        {filtered.length} people · {(incomeShare(filtered) * 100).toFixed(1)}% above 50K (synthetic Census-style sample)
      </p>
      <div className="income-bars">
        {groups.map((g) => (
          <div key={g.education} className="income-row">
            <span className="income-label">{g.education}</span>
            <div className="income-track">
              <div className="income-fill" style={{ width: `${(g.total / maxTotal) * 100}%` }}>
                <div className="income-high" style={{ width: `${g.share * 100}%` }} />
              </div>
            </div>
            <span className="income-pct">{(g.share * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
