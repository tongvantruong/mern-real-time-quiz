import { Question } from "./question";

export type Player = {
  name: string;
  id: string;
  roomId: string;
  correctQuestions: Question[];
  wrongQuestions: Question[];
};

export type PlayerScore = Pick<Player, "name"> & { score: number };
