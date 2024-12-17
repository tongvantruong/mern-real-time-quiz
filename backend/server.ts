import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { Question } from "./models/question";
import { Room } from "./models/room";
import { Player, PlayerScore } from "./models/player";
import questions from "./data/questions.json";

const app = express();
const server = http.createServer(app);
app.use(cors);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("server running at " + PORT);
});

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const rooms: Map<String, Room> = new Map();

io.on("connection", (socket) => {
  console.log(`a player was connected: ${socket.id}`);

  socket.on("joinQuiz", (roomId, name) => {
    socket.join(roomId);
    io.to(roomId).emit("message", `${name} has joined`);

    createNewRoom(roomId, name);
  });

  socket.on("submitAnswer", (room, question, isCorrect) => {
    const currentRoom = rooms.get(room);
    saveAnswerToPlayer(currentRoom, question, isCorrect);
    emitLeaderboard(currentRoom);
    showNextQuestion(currentRoom);
  });

  socket.on("disconnect", () => {
    console.log(`a player was disconnected: ${socket.id}`);
    deletePlayer(socket.id);
  });

  function deletePlayer(playerId: string) {
    for (let [_, room] of rooms) {
      if (room.players.find((p) => p.id === playerId)) {
        const newPlayers = room.players.filter((p) => p.id !== playerId);
        room.players = newPlayers;
        const playerScores: PlayerScore[] = room.players.map((p: Player) => {
          return { name: p.name, score: p.correctQuestions.length };
        });
        io.to(room.id).emit("updateLeaderboard", playerScores);
      }
    }
  }

  function createNewRoom(roomId: string, name: string) {
    if (!rooms.get(roomId)) {
      initRoom(roomId);
    }
    const existingRoom = rooms.get(roomId);
    const isNoPlayerInRoom = !existingRoom.players.find((p) => p.name === name);
    if (isNoPlayerInRoom) {
      addPlayerToRoom(existingRoom, name);
    }
    const noQuestion = existingRoom.currentQuestionIndex === -1;
    if (noQuestion) {
      showNextQuestion(existingRoom);
    } else {
      showCurrentQuestion(existingRoom);
    }
    rooms.set(roomId, existingRoom);
  }

  function addPlayerToRoom(room: Room, name: string) {
    const newPlayer: Player = {
      name: name,
      id: socket.id,
      roomId: room.id,
      correctQuestions: [],
      wrongQuestions: [],
    };
    room.players = [...room.players, newPlayer];
    const playerScores: PlayerScore[] = room.players.map((p: Player) => {
      return { name: p.name, score: p.correctQuestions.length };
    });
    io.to(room.id).emit("updateLeaderboard", playerScores);
  }

  function initRoom(roomId: string) {
    rooms.set(roomId, {
      id: roomId,
      players: [],
      questions: questions.sort(() => 1 - Math.random()),
      currentQuestionIndex: -1,
    });
  }

  function showCurrentQuestion(room: Room) {
    if (room.currentQuestionIndex > room.questions.length - 1) {
      complete(room);
      return;
    }
    emitNewQuestion(room);
  }

  function showNextQuestion(room: Room) {
    if (room.currentQuestionIndex >= room.questions.length - 1) {
      complete(room);
      return;
    }
    room.currentQuestionIndex = room.currentQuestionIndex + 1;
    emitNewQuestion(room);
  }

  function saveAnswerToPlayer(
    room: Room,
    question: Question,
    isCorrect: boolean
  ) {
    const currentPlayer = room.players.find((p) => p.id === socket.id);
    if (currentPlayer && isCorrect) {
      currentPlayer.correctQuestions.push(question);
    } else if (currentPlayer) {
      currentPlayer.wrongQuestions.push(question);
    }
    rooms.set(room.id, room);
  }

  function emitLeaderboard(room: Room) {
    const playerScores: PlayerScore[] = room.players.map((p: Player) => {
      return { name: p.name, score: p.correctQuestions.length };
    });
    io.to(room.id).emit("updateLeaderboard", playerScores);
  }

  function emitNewQuestion(room: Room) {
    const currentQuestion = room.questions[room.currentQuestionIndex];
    io.to(room.id).emit("newQuestion", currentQuestion);
  }

  function complete(room: Room) {
    rooms.delete(room.id);
    io.to(room.id).emit("completed");
  }
});
