import { useState } from 'react';
import {
  Brain, Trophy, RefreshCw, ChevronRight,
  CheckCircle, XCircle, AlertTriangle, Loader2, BookOpen, Zap
} from 'lucide-react';
import api from '../../services/api';
import { useStore } from '../../store';

// ─── demo questions (hackathon fallback / testing) ──────────────────────────
const DEMO_QUESTIONS = [
  {
    scenario: "You're driving for DoorDash and rear-end another car at a red light. You file a claim with your personal auto insurer.",
    answer: "not_covered",
    clause: "Commercial Use Exclusion — Coverage does not apply when the vehicle is being used for hire or delivery services.",
    explanation: "Personal auto policies explicitly exclude incidents that occur while the vehicle is being used for commercial purposes, including food delivery. You would need a rideshare/delivery endorsement or a commercial policy for this to be covered."
  },
  {
    scenario: "You slip and fall on ice walking to your car before your shift starts, resulting in a broken wrist and $4,000 in medical bills.",
    answer: "partial",
    clause: "Medical Payments Coverage — Up to $2,500 per person per accident, regardless of fault.",
    explanation: "Your policy's MedPay coverage would apply here, but only up to the $2,500 limit. You'd be responsible for the remaining $1,500 out of pocket unless you have other health insurance to cover the gap."
  },
  {
    scenario: "A passenger accidentally leaves their phone in your car. You return it the next day with no issue.",
    answer: "not_covered",
    clause: "Personal Property Exclusion — The policy does not cover personal belongings of third parties left in the vehicle.",
    explanation: "Your auto policy covers your vehicle and your liability, not the personal property of others. If the passenger's phone were damaged or stolen, they would need to claim against their own renters/homeowners or device insurance."
  },
  {
    scenario: "Your car is broken into overnight and your delivery equipment (insulated bags, phone mount) is stolen.",
    answer: "not_covered",
    clause: "Personal Property — Business equipment and tools are excluded from auto coverage.",
    explanation: "Auto insurance policies don't cover business equipment stored in your vehicle. You'd need a separate business property policy or a rider on your homeowners/renters policy to cover work equipment."
  },
  {
    scenario: "While parked waiting for a ride request (app open, no passenger), a tree branch falls on your car causing $1,200 in damage.",
    answer: "covered",
    clause: "Comprehensive Coverage — covers damage from falling objects, weather events, and other non-collision perils.",
    explanation: "Comprehensive coverage applies to damage caused by events other than collisions, including falling objects like tree branches. Since you have comprehensive on this policy, the damage is covered after your deductible."
  },
];

// ─── answer option definitions ───────────────────────────────────────────────
const ANSWER_OPTIONS = [
  {
    value: 'covered',
    label: 'Covered',
    Icon: CheckCircle,
    idle: 'border-green-400/50 text-green-700 bg-green-500/5 hover:bg-green-500/15 hover:border-green-500',
    active: 'bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/20',
  },
  {
    value: 'not_covered',
    label: 'Not Covered',
    Icon: XCircle,
    idle: 'border-red-400/50 text-red-600 bg-red-500/5 hover:bg-red-500/15 hover:border-red-500',
    active: 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20',
  },
  {
    value: 'partial',
    label: 'Partially Covered',
    Icon: AlertTriangle,
    idle: 'border-amber-400/50 text-amber-700 bg-amber-500/5 hover:bg-amber-500/15 hover:border-amber-500',
    active: 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20',
  },
];

const ANSWER_META = {
  covered:     { label: 'Covered',           color: 'text-green-600', ring: 'border-green-500/30 bg-green-500/5' },
  not_covered: { label: 'Not Covered',       color: 'text-red-500',   ring: 'border-red-500/30 bg-red-500/5' },
  partial:     { label: 'Partially Covered', color: 'text-amber-600', ring: 'border-amber-500/30 bg-amber-500/5' },
};

// ─── score tiers ─────────────────────────────────────────────────────────────
function scoreTier(score) {
  if (score === 5) return { emoji: '🏆', label: 'Expert',      color: 'text-green-600', bg: 'bg-green-500/10 border-green-400/30' };
  if (score >= 3)  return { emoji: '🛡️', label: 'Solid',       color: 'text-brand',     bg: 'bg-brand/10 border-brand/20' };
  return              { emoji: '⚠️', label: 'Needs Review', color: 'text-red-500',   bg: 'bg-red-500/10 border-red-400/30' };
}

// ─── sub-components ──────────────────────────────────────────────────────────

function ProgressDots({ total, current }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-500 ${
            i < current  ? 'w-8 bg-brand' :
            i === current ? 'w-8 bg-brand/50' :
                            'w-6 bg-border'
          }`}
        />
      ))}
      <span className="text-xs text-app-muted ml-1 tabular-nums">
        {current + 1}/{total}
      </span>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────
export default function QuizGame() {
  const { policyText } = useStore();

  // quiz FSM state
  const [phase, setPhase]         = useState('idle');       // idle | generating | question | reveal | complete
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx]             = useState(0);
  const [picked, setPicked]       = useState(null);         // user's selected answer for current q
  const [history, setHistory]     = useState([]);           // [{question, selected, isCorrect}]
  const [error, setError]         = useState(null);

  const score      = history.filter(h => h.isCorrect).length;
  const blindSpots = history.filter(h => !h.isCorrect);

  // ── actions ──────────────────────────────────────────────────────────────
  const startQuiz = async () => {
    setPhase('generating');
    setQuestions([]);
    setIdx(0);
    setPicked(null);
    setHistory([]);
    setError(null);

    try {
      const res = await api.post('/api/ai/generate-quiz', { policyText });
      const qs = res.data.questions;
      if (!qs || qs.length === 0) throw new Error('No questions returned');
      setQuestions(qs);
      setPhase('question');
    } catch (err) {
      console.error('Quiz generation error:', err);
      setError('Failed to generate quiz. Please try again.');
      setPhase('idle');
    }
  };

  const loadDemoQuiz = () => {
    setQuestions(DEMO_QUESTIONS);
    setIdx(0);
    setPicked(null);
    setHistory([]);
    setError(null);
    setPhase('question');
  };

  const handleAnswer = (value) => {
    if (phase !== 'question') return;
    const q = questions[idx];
    setPicked(value);
    setHistory(prev => [...prev, {
      question: q,
      selected: value,
      isCorrect: value === q.answer,
    }]);
    setPhase('reveal');
  };

  const handleNext = () => {
    if (idx < questions.length - 1) {
      setIdx(i => i + 1);
      setPicked(null);
      setPhase('question');
    } else {
      setPhase('complete');
    }
  };

  const resetQuiz = () => {
    setPhase('idle');
    setQuestions([]);
    setIdx(0);
    setPicked(null);
    setHistory([]);
    setError(null);
  };

  // ── IDLE ─────────────────────────────────────────────────────────────────
  if (phase === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center space-y-6">
        <div className="relative">
          <div className="p-5 bg-brand/10 rounded-full">
            <Brain className="text-brand" size={40} />
          </div>
          <span className="absolute -top-1 -right-1 bg-brand text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            5 Qs
          </span>
        </div>

        <div className="space-y-2">
          <h4 className="text-xl font-display font-semibold text-app-text">
            Test Your Policy Knowledge
          </h4>
          <p className="text-sm text-app-muted max-w-sm leading-relaxed">
            5 real scenarios generated from <span className="font-semibold text-app-text">your exact policy</span>.
            Find out where your coverage gaps actually are.
          </p>
        </div>

        <div className="flex gap-6 text-center text-xs text-app-muted">
          <div className="flex items-center gap-1.5"><CheckCircle size={13} className="text-green-500" /> Covered</div>
          <div className="flex items-center gap-1.5"><XCircle size={13} className="text-red-500" /> Not Covered</div>
          <div className="flex items-center gap-1.5"><AlertTriangle size={13} className="text-amber-500" /> Partial</div>
        </div>

        {error && (
          <p className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-lg">
            {error}
          </p>
        )}

        <div className="flex flex-col items-center gap-3 w-full max-w-xs">
          <button
            onClick={startQuiz}
            className="w-full bg-brand hover:bg-brand-light text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-brand/20 flex items-center justify-center gap-2 hover:scale-105 transform"
          >
            <Zap size={18} />
            Start Quiz
          </button>
          <button
            onClick={loadDemoQuiz}
            className="w-full flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl border-2 border-border text-app-muted hover:border-brand/40 hover:text-brand transition-all duration-200 text-sm font-medium"
          >
            Try Demo Quiz
          </button>
        </div>
      </div>
    );
  }

  // ── GENERATING ───────────────────────────────────────────────────────────
  if (phase === 'generating') {
    return (
      <div className="flex flex-col items-center justify-center py-14 space-y-4">
        <div className="relative">
          <Loader2 className="animate-spin text-brand" size={44} />
        </div>
        <div className="text-center">
          <p className="font-medium text-app-text">Generating your quiz...</p>
          <p className="text-sm text-app-muted mt-1 animate-pulse">
            Reading your policy and crafting 5 personalized scenarios
          </p>
        </div>
      </div>
    );
  }

  // ── QUESTION / REVEAL ─────────────────────────────────────────────────────
  if (phase === 'question' || phase === 'reveal') {
    const q          = questions[idx];
    const isRevealed = phase === 'reveal';
    const isCorrect  = picked === q.answer;
    const correctMeta = ANSWER_META[q.answer] || {};

    return (
      <div className="space-y-5">
        {/* Progress */}
        <ProgressDots total={questions.length} current={idx} />

        {/* Scenario card */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
          <span className="inline-block bg-brand/10 text-brand text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
            Scenario {idx + 1}
          </span>
          <p className="text-app-text text-[15px] leading-relaxed font-medium">
            {q.scenario}
          </p>
          {!isRevealed && (
            <p className="text-xs text-app-muted mt-4 pt-4 border-t border-border/60">
              Based on your uploaded policy — is this scenario covered?
            </p>
          )}
        </div>

        {/* Answer buttons */}
        {!isRevealed && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {ANSWER_OPTIONS.map(({ value, label, Icon, idle }) => (
              <button
                key={value}
                onClick={() => handleAnswer(value)}
                className={`flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border-2 font-semibold text-sm transition-all duration-150 cursor-pointer ${idle}`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Reveal card */}
        {isRevealed && (
          <div className={`rounded-2xl border-2 p-5 space-y-4 ${
            isCorrect
              ? 'bg-green-500/5 border-green-500/30'
              : 'bg-red-500/5 border-red-500/30'
          }`}>
            {/* Result header */}
            <div className="flex items-center gap-2">
              {isCorrect
                ? <CheckCircle size={22} className="text-green-500 shrink-0" />
                : <XCircle    size={22} className="text-red-500 shrink-0" />}
              <span className={`font-bold text-lg ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                {isCorrect ? 'Correct!' : 'Not quite.'}
              </span>
              {!isCorrect && (
                <span className="text-sm text-app-muted">
                  Answer: <span className={`font-semibold ${correctMeta.color}`}>{correctMeta.label}</span>
                </span>
              )}
            </div>

            {/* Policy clause */}
            <div className="bg-white/80 rounded-xl p-4 border border-border/60 space-y-2">
              <p className="text-[11px] text-app-muted uppercase tracking-widest font-bold flex items-center gap-1.5">
                <BookOpen size={11} />
                Policy Clause
              </p>
              <p className="text-sm text-app-text italic leading-relaxed">
                "{q.clause}"
              </p>
            </div>

            {/* Explanation */}
            <p className="text-sm text-app-muted leading-relaxed">{q.explanation}</p>

            {/* Next button */}
            <button
              onClick={handleNext}
              className="w-full bg-brand hover:bg-brand-light text-white py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            >
              {idx < questions.length - 1
                ? <><ChevronRight size={18} />Next Question</>
                : <><Trophy size={18} />See My Results</>}
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── COMPLETE ──────────────────────────────────────────────────────────────
  if (phase === 'complete') {
    const tier = scoreTier(score);

    return (
      <div className="space-y-6">
        {/* Score hero */}
        <div className="flex flex-col items-center justify-center py-8 text-center space-y-4 bg-white border border-border rounded-2xl shadow-sm">
          <Trophy className="text-brand" size={48} />
          <div>
            <p className="text-6xl font-display font-bold text-app-text tabular-nums">
              {score}
              <span className="text-3xl text-app-muted font-medium">/5</span>
            </p>
            <span className={`inline-flex items-center gap-1.5 mt-3 text-sm font-bold px-4 py-1.5 rounded-full border ${tier.bg} ${tier.color}`}>
              {tier.emoji} {tier.label}
            </span>
          </div>
          <p className="text-sm text-app-muted max-w-xs leading-relaxed">
            {score === 5
              ? 'You know your policy inside out — no blind spots found!'
              : score >= 3
              ? 'Solid understanding, but a few gaps worth reviewing.'
              : 'Several coverage gaps found — review the clauses below.'}
          </p>
        </div>

        {/* All correct case */}
        {blindSpots.length === 0 ? (
          <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-5 text-center">
            <CheckCircle className="text-green-500 mx-auto mb-2" size={28} />
            <p className="text-sm font-semibold text-green-700">Perfect score — no blind spots!</p>
          </div>
        ) : (
          /* Blind spots */
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-app-muted uppercase tracking-widest flex items-center gap-2">
              🔴 Coverage Blind Spots
              <span className="text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                {blindSpots.length} found
              </span>
            </h5>
            {blindSpots.map((item, i) => {
              const cm = ANSWER_META[item.question.answer] || {};
              return (
                <div key={i} className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 space-y-2">
                  <p className="text-sm font-semibold text-app-text leading-snug">
                    {item.question.scenario}
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-app-muted">Correct answer:</span>
                    <span className={`font-bold ${cm.color}`}>{cm.label}</span>
                  </div>
                  <p className="text-xs text-app-muted leading-relaxed border-t border-red-500/10 pt-2">
                    <span className="font-semibold">Clause: </span>
                    {item.question.clause}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Retake */}
        <button
          onClick={resetQuiz}
          className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-brand text-brand hover:bg-brand/5 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.01] transform"
        >
          <RefreshCw size={16} />
          Retake Quiz
        </button>
      </div>
    );
  }

  return null;
}
