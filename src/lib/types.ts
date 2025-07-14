
import type { Player as PlayerType, PlayerCard as PlayerCardType, Position as PositionType } from './types';

export const playerStyles = ['Ninguno', 'Cazagoles', 'Señuelo', 'Hombre de área', 'Hombre objetivo', 'Creador de juego', 'El destructor', 'Portero defensivo', 'Portero ofensivo', 'Atacante extra', 'Lateral defensivo', 'Lateral Ofensivo', 'Lateral finalizador', 'Omnipresente', 'Medio escudo', 'Organizador', 'Jugador de huecos', 'Especialista en centros', 'Extremo móvil', 'Creador de jugadas', 'Diez Clasico', 'Segundo delantero', 'Extremo prolífico'] as const;
export type PlayerStyle = typeof playerStyles[number];

export const positions = ['PT', 'DFC', 'LI', 'LD', 'MCD', 'MC', 'MDI', 'MDD', 'MO', 'EXI', 'EXD', 'SD', 'DC'] as const;
export type Position = typeof positions[number];

export type PlayerCard = {
  id: string;
  name: string; // e.g., "Highlight", "Player of the Week"
  style: PlayerStyle;
  imageUrl?: string;
  ratingsByPosition: { [key in Position]?: number[] };
};

export type Player = {
  id: string;
  name: string;
  cards: PlayerCard[];
};

export type AddRatingFormValues = {
    playerId?: string;
    playerName: string;
    cardName: string;
    position: Position;
    style: PlayerStyle;
    rating: number;
}

export type PlayersByPosition = {
  [key in Position]: Player[];
};

export type Formation = {
  [key in Position]?: number;
};

export type IdealTeamPlayer = {
  player: Player;
  card: PlayerCard;
  position: Position;
  average: number;
};

// --- Nuevos tipos para Formaciones ---

export const formationPlayStyles = [
  'Contraataque rápido', 
  'Contraataque largo', 
  'Por las bandas', 
  'Balones largos', 
  'Posesión'
] as const;
export type FormationPlayStyle = typeof formationPlayStyles[number];

export type MatchResult = {
  id: string;
  goalsFor: number;
  goalsAgainst: number;
  date: string; // ISO 8601 string
};

export type FormationStats = {
  id: string;
  name: string;
  playStyle: FormationPlayStyle;
  imageUrl: string;
  imagePath?: string; // Ruta en Firebase Storage
  secondaryImageUrl?: string;
  secondaryImagePath?: string; // Ruta en Firebase Storage
  sourceUrl?: string;
  matches: MatchResult[];
};

export type AddFormationFormValues = {
  name: string;
  playStyle: FormationPlayStyle;
  image: FileList;
  secondaryImage?: FileList;
  sourceUrl?: string;
};

export type AddMatchFormValues = {
  formationId: string;
  goalsFor: number;
  goalsAgainst: number;
}

// Tipos para componentes refactorizados
export type FlatPlayer = {
  player: PlayerType;
  card: PlayerCardType;
  ratingsForPos: number[];
};

    