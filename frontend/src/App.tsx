import { useEffect, useRef, useState } from "react";
import "./App.css";
import io from "socket.io-client";
import type { Option, Question, PlayerScore } from "backend/models";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const socket = io("ws://localhost:3000");

function App() {
  const name = useRef<string>();
  const [roomId, setRoomId] = useState<string>();
  const [question, setQuestion] = useState<Question>();
  const [score, setScore] = useState<number>(0);
  const [playerScores, setPlayerScores] = useState<PlayerScore[]>([]);

  function onFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    name.current = String(form.get("name"));
    setRoomId(() => String(form.get("room")));
  }

  useEffect(() => {
    if (roomId && name.current) socket.emit("joinQuiz", roomId, name.current);
  }, [roomId]);

  useEffect(() => {
    socket.on("message", (message) => {
      toast(message);
    });
    return () => {
      socket.off("message");
    };
  }, []);

  useEffect(() => {
    socket.on("newQuestion", (question) => {
      setQuestion(() => {
        return question;
      });
    });
    return () => {
      socket.off("newQuestion");
    };
  }, []);

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
  }, []);

  useEffect(() => {
    socket.on("completed", () => {
      setQuestion(() => {
        return undefined;
      });
    });
    return () => {
      socket.off("completed");
    };
  }, []);

  function onAnswer(index: number) {
    if (!question) return;
    const options = question.options;
    const isCorrect = options[index].isCorrect;
    if (isCorrect) {
      setScore((oldScore) => {
        return oldScore + 1;
      });
      socket.emit("submitAnswer", roomId, question, isCorrect);
    } else {
      toast("Oh no! Wrong answer!");
    }
  }

  return (
    <div className="w-[100vw] p-6">
      {roomId ? (
        <div className="flex flex-col gap-4 justify-center items-center">
          <ToastContainer
            position="top-center"
            autoClose={1000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
          <h1>Real Time Quiz</h1>
          <p>
            <i>Quiz ID: {roomId}</i>
          </p>
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
          <p className="text-2xl">
            Your Score: <span className="text-pink-500">{score}</span>
          </p>
          {question && (
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
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4 justify-center items-center">
          <h1>Join Real Time Quiz</h1>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => onFormSubmit(e)}
          >
            <input
              className="rounded-lg text-white px-4 py-2 text-2xl"
              type="text"
              name="name"
              placeholder="Enter your name"
            />
            <input
              name="room"
              className="rounded-lg text-white px-4 py-2 text-2xl"
              type="text"
              placeholder="Enter a test ID"
            />
            <button className="" type="submit">
              JOIN
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
