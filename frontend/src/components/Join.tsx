import React, {
  memo,
  Profiler,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
import { SocketContext } from "../context/socket";
import { useAutocomplete } from "../hooks/useAutocomplete";

type Props = {
  changeRoomId: (id: string) => void;
};

export const Join = memo(({ changeRoomId }: Props) => {
  const name = useRef<string>();
  const roomId = useRef<string>();
  const [availableRoomIds, setAvailableRoomIds] = useState<string[]>([]);

  const socket = useContext(SocketContext);

  useEffect(() => {
    socket.on("getRoomIds", (ids: string[]) => {
      setAvailableRoomIds(() => {
        return ids;
      });
    });
    return () => {
      socket.off("getRoomIds");
    };
  });

  function onFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const inputName = String(form.get("name"));

    if (!inputName || inputName.trim() === "") {
      toast("Please enter your name");
      return;
    }

    const inputRoomId = String(form.get("roomId"));
    if (!inputRoomId || inputRoomId.trim() === "") {
      toast("Please enter Quiz ID");
      return;
    }

    name.current = inputName;
    roomId.current = inputRoomId;
    changeRoomId(roomId.current);

    socket.emit("joinQuiz", roomId.current, name.current);
  }

  const { autocomplete } = useAutocomplete({
    input: document.querySelector("input[name='roomId']") as HTMLInputElement,
    options: availableRoomIds,
  });

  // to measure rendering performance of a React tree programmatically
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
    <Profiler id="Join" onRender={onRender}>
      <div className="flex flex-col gap-4 justify-center items-center mt-[-100px]">
        <h1>Join Real Time Quiz</h1>
        <form className="flex flex-col gap-4" onSubmit={(e) => onFormSubmit(e)}>
          <input
            className="rounded-lg text-violet-900 px-4 py-2 text-2xl bg-white focus:outline-none"
            type="text"
            name="name"
            placeholder="Enter your name"
          />
          <div className="relative">
            <input
              name="roomId"
              className="rounded-lg text-violet-900 px-4 py-2 text-2xl bg-white focus:outline-none"
              type="text"
              placeholder="Enter a quiz ID"
              onInput={autocomplete}
            />
          </div>
          <button
            className="bg-violet-600 hover:bg-violet-500 text-white mt-2 outline-0"
            type="submit"
          >
            JOIN
          </button>
        </form>
      </div>
    </Profiler>
  );
});
