import React, { memo, Profiler } from "react";

type Props = {
  score: number;
};

function onRender(
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) {
  console.log(`-------- render ${id} -------`);
  console.log(`phase: ${phase}`);
  console.log(`actualDuration: ${actualDuration}`);
  console.log(`baseDuration: ${baseDuration}`);
  console.log(`startTime: ${startTime}`);
  console.log(`commitTime: ${commitTime}`);
}

export const Score = memo(({ score }: Props) => {
  return (
    <Profiler id="Score" onRender={onRender}>
      <p className="text-2xl">
        Your Score: <span className="text-pink-500">{score}</span>
      </p>
    </Profiler>
  );
});
