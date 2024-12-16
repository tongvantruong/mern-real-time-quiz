import { useCallback, useContext, useEffect, useState } from "react";
import "./App.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React from "react";
import { Leaderboard } from "./components/Leaderboard";
import { Score } from "./components/Score";
import { Quiz } from "./components/Quiz";
import { Join } from "./components/Join";
import { SocketContext } from "./context/socket";

function App() {
  const [roomId, setRoomId] = useState<string>();
  const [score, setScore] = useState<number>(0);

  const socket = useContext(SocketContext);

  const increaseScore = useCallback(() => {
    setScore((oldScore) => {
      return oldScore + 1;
    });
  }, []);

  const changeRoomId = useCallback((roomId: string) => {
    setRoomId(() => roomId);
  }, []);

  useEffect(() => {
    socket.on("message", (message) => {
      toast(message);
    });
    return () => {
      socket.off("message");
    };
  });

  return (
    <div className="w-[100vw] p-6">
      {roomId ? (
        <div className="flex flex-col gap-4 justify-center items-center">
          <h1>Real Time Quiz</h1>
          <p>
            <i>Quiz ID: {roomId}</i>
          </p>
          <Leaderboard />
          <Score score={score} />
          <Quiz roomId={roomId} increaseScore={increaseScore} />
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
        </div>
      ) : (
        <Join changeRoomId={changeRoomId} />
      )}
    </div>
  );
}

export default App;
