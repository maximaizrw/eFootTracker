export type PlayerStyle = 'Cazagoles' | 'Señuelo' | 'Hombre de área' | 'Ninguno';

export const playerStyles: PlayerStyle[] = ['Ninguno', 'Cazagoles', 'Señuelo', 'Hombre de área'];

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
  style: PlayerStyle;
  cards: PlayerCard[];
};

export type PlayersByPosition = {
  [key in Position]: Player[];
};
