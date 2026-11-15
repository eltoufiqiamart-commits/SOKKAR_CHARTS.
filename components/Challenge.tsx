'use client';
import { useState } from 'react';
import type { Challenge } from '@/lib/types';
import { useProgress } from '@/lib/progress';

export default function ChallengeBox({ challenge, slug }: { challenge: Challenge; slug: string }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [numeric, setNumeric] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const { toggleCompleted, isCompleted, hydrated } = useProgress();
  const alreadyDone = hydrated && isCompleted(slug);

  const check = () => {
    let ok = false;
    if (challenge.mode === 'choice') {
      ok = selected === challenge.answer;
    } else {
      const guess = parseFloat(numeric);
      const answer = parseFloat(challenge.answer);
      ok = Number.isFinite(guess) && Math.abs(guess - answer) <= (challenge.tolerance ?? 0.01);
    }
    setCorrect(ok);
    setSubmitted(true);
    if (ok && !isCompleted(slug)) toggleCompleted(slug);
  };

  const retry = () => { setSelected(null); setNumeric(''); setSubmitted(false); setCorrect(false); };

  return (
    <div className="challenge-box" aria-labelledby="challenge-title">
      <div className="chip-row" style={{ marginBottom: 10 }}>
        <span className="chip chip-solid">CHALLENGE</span>
        {alreadyDone && <span className="done-badge"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6.5 5 9.5 10 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>Completed</span>}
      </div>
      <h3 id="challenge-title" className="h3" style={{ marginBottom: 14 }}>{challenge.question}</h3>

      {challenge.mode === 'choice' ? (
        <div role="radiogroup" aria-label="Answer options">
          {(challenge.options ?? []).map(opt => {
            const isSelected = selected === opt;
            const showState = submitted && (opt === challenge.answer ? 'correct' : isSelected ? 'wrong' : '');
            return (
              <button key={opt} className={`option-btn ${showState || ''}`} role="radio" aria-checked={isSelected}
                onClick={() => !submitted && setSelected(opt)} disabled={submitted}>
                {opt}
              </button>
            );
          })}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="input-wrap" style={{ flex: 1 }}>
            <input className="input" type="number" step="any" inputMode="decimal" placeholder={challenge.placeholder ?? 'Your answer'} value={numeric}
              onChange={e => setNumeric(e.target.value)} disabled={submitted} aria-label="Your answer"
              onKeyDown={e => e.key === 'Enter' && !submitted && numeric.trim() && check()} />
            {challenge.unit && <span className="unit">{challenge.unit}</span>}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 14, alignItems: 'center' }}>
        {!submitted ? (
          <button className="btn btn-sm" onClick={check} disabled={challenge.mode === 'choice' ? !selected : !numeric.trim()}>Submit answer</button>
        ) : (
          <button className="btn-outline btn btn-sm" onClick={retry}>Try again</button>
        )}
      </div>

      {submitted && (
        <div className={`result-banner ${correct ? 'result-ok' : 'result-err'}`} role="status" style={{ marginTop: 14 }}>
          <strong>{correct ? 'Correct.' : 'Not quite.'}</strong> {challenge.explanation}
          {correct && <div style={{ marginTop: 6, fontWeight: 700 }}>Experience marked as completed.</div>}
        </div>
      )}
    </div>
  );
}
