import { render, screen } from "@testing-library/react";
import { Join } from "./Join";
import { expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { SocketContext } from "../context/socket";
import io from "socket.io-client";

vi.mock("socket.io-client", () => {
  const mSocket = {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  };
  return { default: vi.fn(() => mSocket) };
});

it("should match snapshot", () => {
  const mockChangeRoomId = vi.fn();
  const { container } = render(
    <SocketContext.Provider value={io()}>
      <Join changeRoomId={mockChangeRoomId} />
    </SocketContext.Provider>
  );

  expect(container).toMatchSnapshot();
});

it("renders 2 input for name, quiz ID and a button", () => {
  const mockChangeRoomId = vi.fn();
  render(
    <SocketContext.Provider value={io()}>
      <Join changeRoomId={mockChangeRoomId} />
    </SocketContext.Provider>
  );

  expect(screen.getByPlaceholderText("Enter your name")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Enter a quiz ID")).toBeInTheDocument();
  expect(screen.getByText("JOIN")).toBeInTheDocument();
});

it("calls callback and emit joinQuiz when name, quiz id are provided", async () => {
  const mockChangeRoomId = vi.fn();
  render(
    <SocketContext.Provider value={io()}>
      <Join changeRoomId={mockChangeRoomId} />
    </SocketContext.Provider>
  );

  const name = "My name";
  const quizId = "1234";

  await userEvent.type(screen.getByPlaceholderText("Enter your name"), name);
  await userEvent.type(screen.getByPlaceholderText("Enter a quiz ID"), quizId);
  await userEvent.click(screen.getByText("JOIN"));

  expect(mockChangeRoomId).toHaveBeenCalledTimes(1);
  expect(mockChangeRoomId).toHaveBeenCalledWith(quizId);
  expect(io().emit).toHaveBeenCalledTimes(1);
  expect(io().emit).toHaveBeenCalledWith("joinQuiz", quizId, name);
});

it("does not call callback and emit joinQuiz when name is not provided", async () => {
  const mockChangeRoomId = vi.fn();
  render(
    <SocketContext.Provider value={io()}>
      <Join changeRoomId={mockChangeRoomId} />
    </SocketContext.Provider>
  );

  await userEvent.type(screen.getByPlaceholderText("Enter a quiz ID"), "123");
  await userEvent.click(screen.getByText("JOIN"));
  expect(mockChangeRoomId).toHaveBeenCalledTimes(0);
});

it("does not call callback and emit joinQuiz when quiz id is not provided", async () => {
  const mockChangeRoomId = vi.fn();
  render(
    <SocketContext.Provider value={io()}>
      <Join changeRoomId={mockChangeRoomId} />
    </SocketContext.Provider>
  );

  await userEvent.type(
    screen.getByPlaceholderText("Enter your name"),
    "My Name"
  );
  await userEvent.click(screen.getByText("JOIN"));
  expect(mockChangeRoomId).toHaveBeenCalledTimes(0);
});
