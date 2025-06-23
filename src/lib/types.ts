export const playerStyles = ['Ninguno', 'Cazagoles', 'Señuelo', 'Hombre de área', 'Creador de juego', 'El destructor', 'Portero defensivo', 'Portero ofensivo', 'Atacante extra'] as const;
export type PlayerStyle = typeof playerStyles[number];

export const positions = ['PT', 'DFC', 'LI', 'LD', 'MCD', 'MC', 'MDI', 'MDD', 'MO', 'EXI', 'EXD', 'SD', 'DC'] as const;
export type Position = typeof positions[number];

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
