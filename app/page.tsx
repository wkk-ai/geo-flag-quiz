"use client";

import { useState, useCallback, useEffect, useSyncExternalStore } from "react";
import StartScreen, { GameMode } from "@/components/StartScreen";
import GameScreen from "@/components/GameScreen";
import MapScreen from "@/components/MapScreen";
import GameOverScreen from "@/components/GameOverScreen";
import {
  Difficulty,
  Flag,
  FlagStep,
  AnswerState,
  TIER_LABELS,
  START_LIVES,
  COUNTRY_PTS,
  CAPITAL_PTS,
  MAP_PTS,
  getFlagsByDifficulty,
  generateCountryOptions,
  generateCapitalOptions,
  pointsFor,
} from "@/lib/gameLogic";
import {
  saveStats,
  saveBests,
  recordRun,
  subscribeStats,
  getStatsSnapshot,
  getServerStats,
} from "@/lib/stats";
import { unlockAudio, playCorrect, playBonus, playWrong, playGameOver } from "@/lib/audio";

type Phase = "start" | "playing" | "over";

interface GameState {
  gameMode: GameMode;
  difficulty: Difficulty;
  bucket: Flag[];
  currentFlag: Flag;
  countryOptions: Flag[];
  capitalOptions: Flag[];
}

function buildInitialGameState(mode: GameMode, difficulty: Difficulty): GameState {
  const bucket = getFlagsByDifficulty(difficulty);
  const current = bucket[0];
  return {
    gameMode: mode,
    difficulty,
    bucket: bucket.slice(1),
    currentFlag: current,
    countryOptions: generateCountryOptions(current, mode === "map"),
    capitalOptions: generateCapitalOptions(current),
  };
}

function nextQuestion(state: GameState): GameState {
  if (state.bucket.length === 0) {
    const newBucket = getFlagsByDifficulty(state.difficulty, state.currentFlag.code);
    const current = newBucket[0];
    return {
      ...state,
      bucket: newBucket.slice(1),
      currentFlag: current,
      countryOptions: generateCountryOptions(current, state.gameMode === "map"),
      capitalOptions: generateCapitalOptions(current),
    };
  }
  const current = state.bucket[0];
  return {
    ...state,
    bucket: state.bucket.slice(1),
    currentFlag: current,
    countryOptions: generateCountryOptions(current, state.gameMode === "map"),
    capitalOptions: generateCapitalOptions(current),
  };
}

export default function Home() {
  const [phase, setPhase] = useState<Phase>("start");
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>("idle");
  const [flagStep, setFlagStep] = useState<FlagStep>("country");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedCapital, setSelectedCapital] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [bestStreakThisRun, setBestStreakThisRun] = useState(0);
  const [lives, setLives] = useState(START_LIVES);
  const [score, setScore] = useState(0);
  const [lastDelta, setLastDelta] = useState<number | null>(null);
  const [asked, setAsked] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [newBestScore, setNewBestScore] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const stored = useSyncExternalStore(subscribeStats, getStatsSnapshot, getServerStats);
  const bestScore = stored.bestScore;
  const bestStreak = stored.bestStreak;
  const muted = stored.muted;

  useEffect(() => {
    if (lastDelta == null) return;
    const t = window.setTimeout(() => setLastDelta(null), 900);
    return () => window.clearTimeout(t);
  }, [lastDelta]);

  const bumpStreak = useCallback((next: number) => {
    setStreak(next);
    setBestStreakThisRun((s) => Math.max(s, next));
  }, []);

  const handleStart = useCallback((mode: GameMode, difficulty: Difficulty) => {
    unlockAudio();
    setGameState(buildInitialGameState(mode, difficulty));
    setPhase("playing");
    setAnswerState("idle");
    setFlagStep("country");
    setSelectedCountry(null);
    setSelectedCapital(null);
    setStreak(0);
    setBestStreakThisRun(0);
    setLives(START_LIVES);
    setScore(0);
    setLastDelta(null);
    setAsked(0);
    setCorrect(0);
    setNewBestScore(false);
    setConfirmLeave(false);
  }, []);

  const finishRun = useCallback((finalScore: number, finalStreak: number) => {
    const result = recordRun(finalScore, finalStreak);
    setNewBestScore(result.newBestScore);
    playGameOver(muted);
    setPhase("over");
  }, [muted]);

  const handleSelectCountry = useCallback(
    (code: string) => {
      if (!gameState || answerState !== "idle") return;
      if (gameState.gameMode === "flag" && flagStep !== "country") return;

      setSelectedCountry(code);
      const isRight = code === gameState.currentFlag.code;
      setAsked((n) => n + 1);

      if (isRight) {
        const nextStreak = streak + 1;
        const base = gameState.gameMode === "map" ? MAP_PTS : COUNTRY_PTS;
        const delta = pointsFor(base, nextStreak);
        bumpStreak(nextStreak);
        setScore((s) => s + delta);
        setLastDelta(delta);
        setCorrect((n) => n + 1);
        playCorrect(muted);
        if (gameState.gameMode === "map") {
          setAnswerState("correct");
        } else {
          setFlagStep("capital");
        }
      } else {
        bumpStreak(0);
        setLives((n) => n - 1);
        setAnswerState("wrong");
        playWrong(muted);
      }
    },
    [gameState, answerState, flagStep, streak, muted, bumpStreak]
  );

  const handleSelectCapital = useCallback(
    (code: string) => {
      if (!gameState || answerState !== "idle" || flagStep !== "capital") return;
      setSelectedCapital(code);
      if (code === gameState.currentFlag.code) {
        const delta = pointsFor(CAPITAL_PTS, Math.max(streak, 1));
        setScore((s) => s + delta);
        setLastDelta(delta);
        setAnswerState("correct");
        playBonus(muted);
      } else {
        setAnswerState("partial");
        playWrong(muted);
      }
    },
    [gameState, answerState, flagStep, streak, muted]
  );

  const handleSkipCapital = useCallback(() => {
    if (flagStep !== "capital" || answerState !== "idle") return;
    setAnswerState("partial");
  }, [flagStep, answerState]);

  const handleNext = useCallback(() => {
    if (!gameState) return;
    if (lives <= 0) {
      finishRun(score, bestStreakThisRun);
      return;
    }
    setGameState(nextQuestion(gameState));
    setAnswerState("idle");
    setFlagStep("country");
    setSelectedCountry(null);
    setSelectedCapital(null);
    setLastDelta(null);
  }, [gameState, lives, score, bestStreakThisRun, finishRun]);

  const leaveToMenu = useCallback(() => {
    if (score > 0 || bestStreakThisRun > 0) {
      saveBests(score, bestStreakThisRun);
    }
    setPhase("start");
    setGameState(null);
    setAnswerState("idle");
    setConfirmLeave(false);
    setStreak(0);
  }, [score, bestStreakThisRun]);

  const handleGoHome = useCallback(() => {
    if (phase === "playing" && (score > 0 || streak > 0)) {
      setConfirmLeave(true);
      return;
    }
    leaveToMenu();
  }, [phase, score, streak, leaveToMenu]);

  const handleToggleMute = useCallback(() => {
    saveStats({ muted: !muted });
  }, [muted]);

  const hud = {
    lives,
    score,
    bestScore: Math.max(bestScore, score),
    lastDelta,
    muted,
    onHome: handleGoHome,
    onToggleMute: handleToggleMute,
  };

  const confirmModal = confirmLeave ? (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="leave-title"
    >
      <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-sm w-full space-y-4 overscroll-contain">
        <h2 id="leave-title" className="text-lg font-bold text-white">
          Leave this run?
        </h2>
        <p className="text-sm text-slate-400">Your best score is saved.</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setConfirmLeave(false)}
            className="flex-1 min-h-11 rounded-xl bg-white/10 font-semibold hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            Stay
          </button>
          <button
            type="button"
            onClick={leaveToMenu}
            className="flex-1 min-h-11 rounded-xl bg-rose-600 font-semibold hover:bg-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
          >
            Leave
          </button>
        </div>
      </div>
    </div>
  ) : null;

  if (phase === "start") {
    return <StartScreen onStart={handleStart} bestScore={bestScore} bestStreak={bestStreak} />;
  }

  if (phase === "over") {
    return (
      <GameOverScreen
        score={score}
        bestScore={Math.max(bestScore, score)}
        streak={bestStreakThisRun}
        bestStreak={Math.max(bestStreak, bestStreakThisRun)}
        correct={correct}
        asked={asked}
        newBestScore={newBestScore}
        onPlayAgain={() => {
          if (!gameState) return;
          handleStart(gameState.gameMode, gameState.difficulty);
        }}
        onHome={() => {
          setPhase("start");
          setGameState(null);
        }}
      />
    );
  }

  if (!gameState) return null;

  if (gameState.gameMode === "map") {
    return (
      <>
        {confirmModal}
        <MapScreen
          country={gameState.currentFlag}
          countryOptions={gameState.countryOptions}
          streak={streak}
          tier={TIER_LABELS[gameState.difficulty]}
          answerState={answerState}
          selectedCountry={selectedCountry}
          onSelectCountry={handleSelectCountry}
          onNext={handleNext}
          {...hud}
        />
      </>
    );
  }

  return (
    <>
      {confirmModal}
      <GameScreen
        flag={gameState.currentFlag}
        countryOptions={gameState.countryOptions}
        capitalOptions={gameState.capitalOptions}
        streak={streak}
        tier={TIER_LABELS[gameState.difficulty]}
        answerState={answerState}
        flagStep={flagStep}
        selectedCountry={selectedCountry}
        selectedCapital={selectedCapital}
        onSelectCountry={handleSelectCountry}
        onSelectCapital={handleSelectCapital}
        onSkipCapital={handleSkipCapital}
        onNext={handleNext}
        {...hud}
      />
    </>
  );
}
