"use client";

import { useState, useCallback } from "react";
import StartScreen, { GameMode } from "@/components/StartScreen";
import GameScreen from "@/components/GameScreen";
import MapScreen from "@/components/MapScreen";
import {
  Difficulty,
  Flag,
  getDifficultySequence,
  getFlagsByDifficulty,
  generateCountryOptions,
  generateCapitalOptions,
} from "@/lib/gameLogic";

type Phase = "start" | "playing";
type AnswerState = "idle" | "both-correct" | "wrong";

const TIER_LABELS: Record<Difficulty, string> = { 1: "Easy", 2: "Medium", 3: "Hard" };

interface GameState {
  gameMode: GameMode;
  sequence: Difficulty[];
  seqIndex: number;
  bucket: Flag[];
  currentFlag: Flag;
  countryOptions: Flag[];
  capitalOptions: Flag[];
}

function buildInitialGameState(mode: GameMode, startDifficulty: Difficulty): GameState {
  const sequence = getDifficultySequence(startDifficulty);
  const bucket = getFlagsByDifficulty(sequence[0]);
  const current = bucket[0];
  return {
    gameMode: mode,
    sequence,
    seqIndex: 0,
    bucket: bucket.slice(1),
    currentFlag: current,
    countryOptions: generateCountryOptions(current),
    capitalOptions: generateCapitalOptions(current),
  };
}

function nextQuestion(state: GameState): GameState {
  if (state.bucket.length === 0) {
    const nextSeqIndex = (state.seqIndex + 1) % state.sequence.length;
    const nextDifficulty = state.sequence[nextSeqIndex];
    const newBucket = getFlagsByDifficulty(nextDifficulty);
    const current = newBucket[0];
    return {
      ...state,
      seqIndex: nextSeqIndex,
      bucket: newBucket.slice(1),
      currentFlag: current,
      countryOptions: generateCountryOptions(current),
      capitalOptions: generateCapitalOptions(current),
    };
  }
  const current = state.bucket[0];
  return {
    ...state,
    bucket: state.bucket.slice(1),
    currentFlag: current,
    countryOptions: generateCountryOptions(current),
    capitalOptions: generateCapitalOptions(current),
  };
}

export default function Home() {
  const [phase, setPhase] = useState<Phase>("start");
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>("idle");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedCapital, setSelectedCapital] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);

  const handleStart = useCallback((mode: GameMode, difficulty: Difficulty) => {
    setGameState(buildInitialGameState(mode, difficulty));
    setPhase("playing");
    setAnswerState("idle");
    setSelectedCountry(null);
    setSelectedCapital(null);
    setStreak(0);
  }, []);

  const resolveAnswer = useCallback(
    (countryCode: string | null, capitalCode: string | null, flag: Flag) => {
      if (!countryCode) return; // wait for country
      
      // For Flag Quiz, wait for both. For Map Quiz, resolve immediately on country select?
      // User said: "regardless of getting it right or wrong, the capital names of all options should appear"
      // This implies Map Quiz should reveal capitals on country selection.
      
      const bothCorrect = countryCode === flag.code && (!capitalCode || capitalCode === flag.code);
      setAnswerState(bothCorrect ? "both-correct" : "wrong");
      setStreak((s) => (bothCorrect ? s + 1 : 0));
    },
    []
  );

  const handleSelectCountry = useCallback(
    (code: string) => {
      if (!gameState || answerState !== "idle") return;
      setSelectedCountry(code);
      
      if (gameState.gameMode === "map") {
        // Resolve immediately in map mode
        const isCorrect = code === gameState.currentFlag.code;
        setAnswerState(isCorrect ? "both-correct" : "wrong");
        setStreak((s) => (isCorrect ? s + 1 : 0));
      } else {
        // Flag mode: wait for both
        resolveAnswer(code, selectedCapital, gameState.currentFlag);
      }
    },
    [gameState, answerState, selectedCapital, resolveAnswer]
  );

  const handleSelectCapital = useCallback(
    (code: string) => {
      if (!gameState || answerState !== "idle" || gameState.gameMode === "map") return;
      setSelectedCapital(code);
      resolveAnswer(selectedCountry, code, gameState.currentFlag);
    },
    [gameState, answerState, selectedCountry, resolveAnswer]
  );

  const handleNext = useCallback(() => {
    if (!gameState) return;
    setGameState(nextQuestion(gameState));
    setAnswerState("idle");
    setSelectedCountry(null);
    setSelectedCapital(null);
  }, [gameState]);

  if (phase === "start") return <StartScreen onStart={handleStart} />;
  if (!gameState) return null;

  if (gameState.gameMode === "map") {
    return (
      <MapScreen
        country={gameState.currentFlag}
        countryOptions={gameState.countryOptions}
        streak={streak}
        tier={TIER_LABELS[gameState.sequence[gameState.seqIndex]]}
        answerState={answerState}
        selectedCountry={selectedCountry}
        onSelectCountry={handleSelectCountry}
        onNext={handleNext}
      />
    );
  }

  return (
    <GameScreen
      flag={gameState.currentFlag}
      countryOptions={gameState.countryOptions}
      capitalOptions={gameState.capitalOptions}
      streak={streak}
      tier={TIER_LABELS[gameState.sequence[gameState.seqIndex]]}
      answerState={answerState}
      selectedCountry={selectedCountry}
      selectedCapital={selectedCapital}
      onSelectCountry={handleSelectCountry}
      onSelectCapital={handleSelectCapital}
      onNext={handleNext}
    />
  );
}
