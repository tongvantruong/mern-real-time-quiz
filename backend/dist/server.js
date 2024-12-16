"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const socket_io_1 = require("socket.io");
const questions_json_1 = __importDefault(require("./data/questions.json"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
app.use(cors_1.default);
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log("server running at " + PORT);
});
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    },
});
const rooms = new Map();
io.on("connection", (socket) => {
    console.log(`a player was connected: ${socket.id}`);
    socket.on("joinQuiz", (roomId, name) => {
        console.log("join:" + JSON.stringify(rooms));
        socket.join(roomId);
        io.to(roomId).emit("message", `${name} has joined`);
        createNewRoom(roomId, name);
    });
    socket.on("submitAnswer", (room, question, isCorrect) => {
        const currentRoom = rooms.get(room);
        saveAnswerToPlayer(currentRoom, question, isCorrect);
        emitLeaderboard(currentRoom);
        showNextQuestion(currentRoom);
        console.log("submitAnswer:" + JSON.stringify(rooms.size));
    });
    socket.on("disconnect", () => {
        console.log(`a player was disconnected: ${socket.id}`);
        deletePlayer(socket.id);
    });
    function deletePlayer(playerId) {
        for (let [_, room] of rooms) {
            if (room.players.find((p) => p.id === playerId)) {
                const newPlayers = room.players.filter((p) => p.id !== playerId);
                room.players = newPlayers;
                const playerScores = room.players.map((p) => {
                    return { name: p.name, score: p.correctQuestions.length };
                });
                io.to(room.id).emit("updateLeaderboard", playerScores);
            }
        }
    }
    function createNewRoom(roomId, name) {
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
        }
        else {
            showCurrentQuestion(existingRoom);
        }
        rooms.set(roomId, existingRoom);
    }
    function addPlayerToRoom(room, name) {
        const newPlayer = {
            name: name,
            id: socket.id,
            roomId: room.id,
            correctQuestions: [],
            wrongQuestions: [],
        };
        room.players = [...room.players, newPlayer];
        const playerScores = room.players.map((p) => {
            return { name: p.name, score: p.correctQuestions.length };
        });
        io.to(room.id).emit("updateLeaderboard", playerScores);
    }
    function initRoom(roomId) {
        rooms.set(roomId, {
            id: roomId,
            players: [],
            questions: questions_json_1.default.sort(() => 1 - Math.random()),
            currentQuestionIndex: -1,
        });
    }
    function showCurrentQuestion(room) {
        if (room.currentQuestionIndex > room.questions.length - 1) {
            complete(room);
            return;
        }
        emitNewQuestion(room);
    }
    function showNextQuestion(room) {
        if (room.currentQuestionIndex >= room.questions.length - 1) {
            complete(room);
            return;
        }
        room.currentQuestionIndex = room.currentQuestionIndex + 1;
        emitNewQuestion(room);
    }
    function saveAnswerToPlayer(room, question, isCorrect) {
        const currentPlayer = room.players.find((p) => p.id === socket.id);
        if (currentPlayer && isCorrect) {
            currentPlayer.correctQuestions.push(question);
        }
        else if (currentPlayer) {
            currentPlayer.wrongQuestions.push(question);
        }
        rooms.set(room.id, room);
    }
    function emitLeaderboard(room) {
        const playerScores = room.players.map((p) => {
            return { name: p.name, score: p.correctQuestions.length };
        });
        io.to(room.id).emit("updateLeaderboard", playerScores);
    }
    function emitNewQuestion(room) {
        const currentQuestion = room.questions[room.currentQuestionIndex];
        io.to(room.id).emit("newQuestion", currentQuestion);
    }
    function complete(room) {
        rooms.delete(room.id);
        io.to(room.id).emit("completed");
    }
});
//# sourceMappingURL=server.js.map