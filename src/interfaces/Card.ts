import { Character } from "./Character";

export interface Card {
    id: number;
    character: Character;
    flipped: boolean;
    matched: boolean;
  }