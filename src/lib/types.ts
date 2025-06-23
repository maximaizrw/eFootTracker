export type Position = 'ARQUERO' | 'DFC' | 'LI' | 'LD' | 'MCD' | 'MC' | 'MDI' | 'MDD' | 'MO' | 'EXI' | 'EXD' | 'SD' | 'DC';

export const positions: Position[] = ['ARQUERO', 'DFC', 'LI', 'LD', 'MCD', 'MC', 'MDI', 'MDD', 'MO', 'EXI', 'EXD', 'SD', 'DC'];

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
