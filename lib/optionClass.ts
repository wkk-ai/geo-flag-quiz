import { AnswerState } from "@/lib/gameLogic";

export function optionClass(
  code: string,
  correctCode: string,
  selected: string | null,
  answerState: AnswerState,
  revealCorrect: boolean
): string {
  const base =
    "w-full min-h-14 px-3 py-3 border rounded-2xl text-sm font-semibold text-center flex items-center justify-center gap-2 transition-[transform,background-color,border-color,color,opacity,box-shadow] duration-200 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-default ";

  if (answerState === "idle" && !revealCorrect) {
    if (selected === code) {
      return `${base} bg-blue-600 border-blue-400 text-white`;
    }
    return `${base} border-white/10 bg-white/[0.03] text-slate-200 hover:border-white/25 hover:bg-white/[0.07] hover:text-white active:scale-[0.98]`;
  }

  if (code === correctCode) {
    return `${base} bg-emerald-500 border-emerald-400 text-white`;
  }
  if (code === selected && selected !== correctCode) {
    return `${base} bg-rose-500 border-rose-400 text-white`;
  }
  return `${base} border-white/5 bg-white/[0.01] text-slate-600 opacity-50`;
}
