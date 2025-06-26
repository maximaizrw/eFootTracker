export const playerStyles = ['Ninguno', 'Cazagoles', 'Señuelo', 'Hombre de área', 'Creador de juego', 'El destructor', 'Portero defensivo', 'Portero ofensivo', 'Atacante extra', 'Lateral defensivo', 'Lateral Ofensivo', 'Lateral finalizador', 'Omnipresente', 'Medio escudo', 'Organizador'] as const;
export type PlayerStyle = typeof playerStyles[number];

export const positions = ['PT', 'DFC', 'LI', 'LD', 'MCD', 'MC', 'MDI', 'MDD', 'MO', 'EXI', 'EXD', 'SD', 'DC'] as const;
export type Position = typeof positions[number];

export type PlayerCard = {
  id: string;
  name: string; // e.g., "Highlight", "Player of the Week"
  ratingsByPosition: { [key in Position]?: number[] };
};

export type Player = {
  id: string;
  name: string;
  style: PlayerStyle;
  cards: PlayerCard[];
};

export type PlayersByPosition = {
  [key in Position]: Player[];
};
