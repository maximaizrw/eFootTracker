export type Position = 'Forward' | 'Midfielder' | 'Defender' | 'Goalkeeper';

export const positions: Position[] = ['Forward', 'Midfielder', 'Defender', 'Goalkeeper'];

export type PlayerCard = {
  id: string;
  name: string; // e.g., "Highlight", "Player of the Week"
  ratings: number[];
};

export type Player = {
  id: string;
  name: string;
  position: Position;
  cards: PlayerCard[];
};

export type PlayersByPosition = {
  [key in Position]: Player[];
};
