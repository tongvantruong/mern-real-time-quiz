import React, { memo, Profiler, useContext, useEffect, useState } from "react";
import type { Option, Question } from "backend/models";
import { toast } from "react-toastify";
import { SocketContext } from "../context/socket";

type Props = {
  roomId: string;
  increaseScore: () => void;
};

export const Quiz = memo(({ roomId, increaseScore }: Props) => {
  const [question, setQuestion] = useState<Question>(undefined);

  const socket = useContext(SocketContext);

  useEffect(() => {
    socket.on("newQuestion", (question) => {
      setQuestion(() => {
        return question;
      });
    });
    return () => {
      socket.off("newQuestion");
    };
  });

  useEffect(() => {
    socket.on("completed", () => {
      setQuestion(() => {
        return undefined;
      });
    });
    return () => {
      socket.off("completed");
    };
  });

  function onAnswer(index: number) {
    if (!question) return;
    const options = question.options;
    const isCorrect = options[index].isCorrect;
    if (isCorrect) {
      increaseScore();
      socket.emit("submitAnswer", roomId, question, isCorrect);
    } else {
      toast("Oh no! Wrong answer!");
    }
  }

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

  return question ? (
    <Profiler id="Quiz" onRender={onRender}>
      <div className="p-6 bg-slate-800 mt-6 rounded-lg">
        <h2 className="text-3xl">{question.label}</h2>
        <ul className="flex flex-col gap-3 mt-4">
          {question.options.map((value: Option, index: number) => {
            return (
              <li
                className="px-4 py-2 text-2xl text-white rounded-lg bg-teal-800 hover:bg-teal-600 cursor-pointer text-center"
                key={index}
                onClick={() => onAnswer(index)}
              >
                {value.label}
              </li>
            );
          })}
        </ul>
      </div>
    </Profiler>
  ) : null;
});
