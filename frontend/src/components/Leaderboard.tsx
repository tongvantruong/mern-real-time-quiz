import { memo, Profiler, useContext, useEffect, useState } from "react";
import type { PlayerScore } from "backend/models";
import { SocketContext } from "../context/socket";

export const Leaderboard = memo(() => {
  const [playerScores, setPlayerScores] = useState<PlayerScore[]>([]);

  const socket = useContext(SocketContext);

  useEffect(() => {
    socket.on("updateLeaderboard", (playerScore: PlayerScore) => {
      setPlayerScores(() => {
        return playerScore.sort(
          (a: PlayerScore, b: PlayerScore) => b.score - a.score
        );
      });
    });
    return () => {
      socket.off("updateLeaderboard");
    };
  });

  function onRender(
    id: unknown,
    phase: unknown,
    actualDuration: unknown,
    baseDuration: unknown,
    startTime: unknown,
    commitTime: unknown
  ) {
    console.log(`-------- render ${id} -------`);
    console.log(`phase: ${phase}`);
    console.log(`actualDuration: ${actualDuration}`);
    console.log(`baseDuration: ${baseDuration}`);
    console.log(`startTime: ${startTime}`);
    console.log(`commitTime: ${commitTime}`);
  }

  return (
    <Profiler id="Leaderboard" onRender={onRender}>
      <div className="p-4 bg-slate-700 rounded-lg flex flex-col items-center">
        <h2 className="text-xl">
          Leaderboard <i>({playerScores.length} players)</i>
        </h2>
        <ul className="flex flex-col items-center mt-3">
          {playerScores.map((player, index) => {
            return (
              <li key={index} className="flex justify-between w-full gap-2">
                <i>{`${player.name}:`}</i> <b>{player.score}</b>
              </li>
            );
          })}
        </ul>
      </div>
    </Profiler>
  );
});
