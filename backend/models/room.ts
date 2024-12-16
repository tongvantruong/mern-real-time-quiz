import { Player } from "./player";
import { Question } from "./question";

export interface Room {
  id: string;
  players: Player[];
  questions: Question[];
  currentQuestionIndex: number;
}
